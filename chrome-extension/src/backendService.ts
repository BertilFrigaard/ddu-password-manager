import { argon2id } from "@noble/hashes/argon2.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha512 } from "@noble/hashes/sha2.js";
import { bytesToHex, logRequestError, padEmail } from "./util.js";
import { BACKEND } from "./config.js";

export async function signup(email: string, password: string) {
	const enc = new TextEncoder();

	// 1. Argon2id — derive a master key from the user's password and email (used as salt).
	// p: 4       — parallelism: use 4 parallel threads
	// t: 3       — time cost: 3 iterations over memory (increases CPU work)
	// m: 65536   — memory cost: 64 MiB of RAM (makes brute-force expensive)
	// dkLen: 32  — output length: 32 bytes (256-bit key)
	const masterKey = argon2id(enc.encode(password), enc.encode(padEmail(email)), {
		p: 4,
		t: 3,
		m: 65536,
		dkLen: 32,
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
