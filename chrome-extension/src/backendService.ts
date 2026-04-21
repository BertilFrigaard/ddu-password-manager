import { argon2id } from "@noble/hashes/argon2.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha512 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, logRequestError, padEmail } from "./util.js";
import { decryptData, encryptData } from "./crypto.js";
import { VaultItem } from "./types.js";
import { BACKEND } from "./config.js";
import { getSymmetricKey, getUser, getVaults, setAccessToken, setRefreshKey, setSymmetricKey, setUser, setVaults } from "./store.js";
import { authenticatedFetch } from "./authentication.js";

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
	} else {
		console.log("Success");
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
			setUser({ id: resJson.user.id, email: resJson.user.email, defaultVault: resJson.user.defaultVault });

			const decryptedVaults = await Promise.all(
				resJson.vaults.map(async (vault: { id: number; name: string; items: any[] }) => ({
					id: vault.id,
					name: vault.name,
					items: await Promise.all(
						vault.items.map(async (item): Promise<VaultItem> => {
							const infoBytes = await decryptData(item.encryptedInfo, item.iv, item.authTag);
							const info = JSON.parse(new TextDecoder().decode(infoBytes));
							return {
								id: item.id,
								website: info.website,
								username: info.username,
								twoFactorEnabled: item.twoFactorEnabled,
								password: item.password ?? null,
							};
						}),
					),
				})),
			);

			setVaults(decryptedVaults);

			console.log("SUCCESS");
		} catch (err) {
			throw err;
		}
	} else {
		logRequestError("login", res);
	}
}

export async function createCredential(website: string, username: string, passsword: string | null, vaultId: number) {
	const enc = new TextEncoder();

	const encryptedInfo = await encryptData(enc.encode(JSON.stringify({ website, username })));
	let body;
	// TODO: Twofactor should not always be false i am thinking
	if (passsword) {
		const encryptedPassword = await encryptData(enc.encode(passsword));
		body = {
			encryptedInfo: encryptedInfo.encryptedData,
			iv: encryptedInfo.iv,
			authTag: encryptedInfo.authTag,
			twoFactorEnabled: false,
			ivPassword: encryptedPassword.iv,
			encryptedPassword: encryptedPassword.encryptedData,
			authTagPassword: encryptedPassword.authTag,
		};
	} else {
		body = {
			encryptedInfo: encryptedInfo.encryptedData,
			iv: encryptedInfo.iv,
			authTag: encryptedInfo.authTag,
			twoFactorEnabled: false,
		};
	}

	const res = await authenticatedFetch(`/vaults/${vaultId}/items`, "POST", body);

	if (!res.ok) {
		logRequestError("HERE", res);
	} else {
		console.log("SUCCESS");
	}
}
