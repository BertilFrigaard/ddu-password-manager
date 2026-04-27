import { argon2id } from "@noble/hashes/argon2.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha512 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, logRequestError, padEmail } from "../common/util.js";
import { decryptData, decryptVaults } from "./crypto.js";
import { VaultItem } from "../common/types.js";
import { BACKEND } from "../common/config.js";
import { clearAccessToken, clearRefreshKey, clearSymmetricKey, clearUser, clearVaults, getAccessToken, getRefreshKey, setAccessToken, setRefreshKey, setSymmetricKey, setUser, setUser2FA, setVaults } from "../store/store.js";

export async function signup(email: string, password: string) {
	const enc = new TextEncoder();

	// 1. Argon2id — derive a master key from the user's password and email (used as salt).
	const masterKey = argon2id(enc.encode(password), enc.encode(padEmail(email)), {
		p: 4, // parallelism
		t: 3, // passes
		m: 65536, // memory
		dkLen: 32, // tagLength
	});

	// 2. HKDF stretch to 64 bytes
	// Uses 0 salt because salt must be known
	// Uses "DDU" label to ensure the stretch is domain specific
	const stretchedMasterKey = hkdf(sha512, masterKey, new Uint8Array(0), enc.encode("DDU"), 64);

	// 2.5 Split the stretched master key
	// encKey: Used for encrypting the symmetric key never sent to server
	// authKey: Sent to the server for accout verification
	const encKey = stretchedMasterKey.slice(0, 32);
	const authKey = stretchedMasterKey.slice(32, 64);

	// 3. Generate a random symmetric key and encrypt it with encKey
	const generatedSymmetricKey = crypto.getRandomValues(new Uint8Array(32));
	const iv = crypto.getRandomValues(new Uint8Array(12));

	const cryptoKey = await crypto.subtle.importKey("raw", encKey.buffer as ArrayBuffer, { name: "AES-GCM" }, false, ["encrypt"]);

	const encryptedKeyWithTag = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, cryptoKey, generatedSymmetricKey);

	// 3.5 Split ciphertext and authTag
	const encryptedKeyBytes = new Uint8Array(encryptedKeyWithTag.slice(0, -16));
	const authTag = new Uint8Array(encryptedKeyWithTag.slice(-16));

	// 4. Send to backend
	// All keys are send in hex for proper serilization
	const res = await fetch(`${BACKEND}/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			authKey: bytesToHex(authKey),
			encryptedKey: bytesToHex(encryptedKeyBytes),
			iv: bytesToHex(iv),
			authTag: bytesToHex(authTag),
			email,
		}),
	});

	if (!res.ok) {
		logRequestError("signup", res);
		throw Error("Failed to signup");
	}
}

export async function login(email: string, password: string) {
	const enc = new TextEncoder();

	// 1. Argon2id via @noble/hashes (not in Web Crypto API)
	const masterKey = argon2id(enc.encode(password), enc.encode(padEmail(email)), {
		p: 4, // parallelism
		t: 3, // passes
		m: 65536, // memory
		dkLen: 32, // tagLength
	});

	// 2. HKDF stretch to 64 bytes
	const stretchedMasterKey = hkdf(sha512, masterKey, new Uint8Array(0), new TextEncoder().encode("DDU"), 64);

	const encKey = stretchedMasterKey.slice(0, 32);
	const authKey = stretchedMasterKey.slice(32, 64);

	// 3. Send authKey to server
	const res = await fetch(`${BACKEND}/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			authKey: bytesToHex(authKey),
			email,
		}),
	});

	if (res.ok) {
		try {
			const resJson = await res.json();

			// 4. Import encKey into Web Crypto API
			const cryptoKey = await crypto.subtle.importKey(
				"raw",
				encKey,
				{ name: "AES-GCM" },
				false, // non-extractable
				["decrypt"],
			);

			// 5. Decrypt the protected symmetric key using AES-GCM
			const iv = hexToBytes(resJson.user.iv).buffer as ArrayBuffer;
			const authTag = hexToBytes(resJson.user.authTag);
			const ciphertext = hexToBytes(resJson.user.encryptedKey);

			// Web Crypto expects ciphertext + authTag concatenated
			const ciphertextWithTag = new Uint8Array([...ciphertext, ...authTag]);

			const symmetricKeyBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, ciphertextWithTag);

			setSymmetricKey(bytesToHex(new Uint8Array(symmetricKeyBuffer)));
			setAccessToken(resJson.accessToken);
			setRefreshKey(resJson.refreshKey);
			setUser({ id: resJson.user.id, email: resJson.user.email, defaultVault: resJson.user.defaultVault, twoFactorEnabled: resJson.user.twoFactorEnabled });

			const decryptedVaults = await decryptVaults(resJson.vaults);

			setVaults(decryptedVaults);
		} catch (err) {
			throw err;
		}
	} else {
		logRequestError("login", res);
		throw Error("Failed to login");
	}
}

export async function isUnlocked(): Promise<boolean> {
	const key = await getRefreshKey();
	return key !== null;
}

export async function logout() {
	await clearAccessToken();
	await clearSymmetricKey();
	await clearRefreshKey();
	await clearUser();
	await clearVaults();
}

async function refreshAccessToken(): Promise<void> {
	const refreshKey = await getRefreshKey();
	if (!refreshKey) {
		throw new Error("No refresh key");
	}

	const accessToken = await getAccessToken();
	if (!accessToken) {
		throw new Error("No access token to extract sessionId");
	}

	// TODO: figure out how the sessinId is extracted from the payload,
	// make it cleaner and possiple extract to a util function
	const payload = JSON.parse(atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
	const sessionId = payload.sessionId;

	const res = await fetch(`${BACKEND}/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refreshKey, sessionId }),
	});

	if (!res.ok) {
		await logRequestError("refreshAccessToken", res);
		throw new Error("Refresh access token failed");
	}

	const { accessToken: newToken } = await res.json();
	await setAccessToken(newToken);
}

export async function authenticatedFetch(endpoint: string, method: string, body?: object): Promise<Response> {
	const makeRequest = async (token: string | null) =>
		fetch(`${BACKEND}${endpoint}`, {
			method,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token ?? ""}`,
			},
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});

	let res = await makeRequest(await getAccessToken());
	if (res.status !== 401) {
		return res;
	}
	try {
		await refreshAccessToken();
	} catch {
		await logout();
		throw new Error("Session expired, logged out");
	}

	res = await makeRequest(await getAccessToken());
	if (res.status === 401) {
		await logout();
		throw new Error("Session expired, logged out");
	}

	return res;
}

export async function getTwoFactorAuthenticationQRCode() {
	const res = await authenticatedFetch("/2fa", "GET");

	if (!res.ok) {
		logRequestError("getTwoFactorAuthenticationQRCode", res);
		throw Error("Failed to get 2FA setup QRcode");
	}

	const resJson = await res.json();

	if (!resJson.qrstring) {
		throw Error("2FA Setup request succeded, but failed to decode qrstring");
	}

	return resJson.qrstring as string;
}

export async function enableTwoFactorAuthentication(token: string) {
	const res = await authenticatedFetch("/2fa", "POST", { token });

	if (!res.ok) {
		logRequestError("enableTwoFactorAuthentication", res);
		throw Error("Failed to setup 2FA");
	}

	await setUser2FA(true);
}
