import { argon2id } from "@noble/hashes/argon2.js";
import { hkdf } from "@noble/hashes/hkdf.js";
import { sha512 } from "@noble/hashes/sha2.js";
import { getSymmetricKey } from "../store/store.js";
import { bytesToHex, hexToBytes, padEmail } from "../common/util.js";
import { Vault, VaultItem } from "../common/types.js";

export async function decryptData(encryptedData: string, iv: string, authTag: string): Promise<Uint8Array> {
	const symmetricKeyHex = await getSymmetricKey();
	if (!symmetricKeyHex) throw new Error("Symmetric key not set");

	const keyBytes = hexToBytes(symmetricKeyHex);
	const cryptoKey = await crypto.subtle.importKey("raw", keyBytes as Uint8Array<ArrayBuffer>, { name: "AES-GCM" }, false, ["decrypt"]);

	const ciphertextWithTag = new Uint8Array([...hexToBytes(encryptedData), ...hexToBytes(authTag)]);

	const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: hexToBytes(iv).buffer as ArrayBuffer }, cryptoKey, ciphertextWithTag);

	return new Uint8Array(decrypted);
}

export async function encryptData(plaintext: Uint8Array<ArrayBuffer>): Promise<{ encryptedData: string; iv: string; authTag: string }> {
	const symmetricKeyHex = await getSymmetricKey();
	if (!symmetricKeyHex) throw new Error("Symmetric key not set");

	const keyBytes = hexToBytes(symmetricKeyHex);
	const cryptoKey = await crypto.subtle.importKey("raw", keyBytes as Uint8Array<ArrayBuffer>, { name: "AES-GCM" }, false, ["encrypt"]);

	const iv = crypto.getRandomValues(new Uint8Array(12));

	const ciphertextWithTag = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv.buffer as ArrayBuffer }, cryptoKey, plaintext));

	// AES-GCM appends a 16-byte auth tag at the end
	const ciphertext = ciphertextWithTag.slice(0, -16);
	const authTag = ciphertextWithTag.slice(-16);

	return { encryptedData: bytesToHex(ciphertext), iv: bytesToHex(iv), authTag: bytesToHex(authTag) };
}

export async function decryptVaults(vaults: any): Promise<Vault[]> {
	return await Promise.all(
		vaults.map(async (vault: { id: number; name: string; twoFactorEnabled: boolean; items: any[] }) => ({
			id: vault.id,
			name: vault.name,
			twoFactorEnabled: vault.twoFactorEnabled,
			items: await Promise.all(
				vault.items.map(async (item): Promise<VaultItem> => {
					const infoBytes = await decryptData(item.encryptedInfo, item.iv, item.authTag);
					const info = JSON.parse(new TextDecoder().decode(infoBytes));
					return {
						id: item.id,
						website: info.website,
						username: info.username,
						twoFactorEnabled: item.twoFactorEnabled,
						twoFactorSource: item.twoFactorSource,
						password: item.password ?? null,
					};
				}),
			),
		})),
	);
}

export async function deriveKeys(email: string, password: string) {
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
	return { encKey, authKey };
}
