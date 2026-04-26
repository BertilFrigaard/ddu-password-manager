import { getSymmetricKey } from "../store/store.js";
import { bytesToHex, hexToBytes } from "../common/util.js";
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
		vaults.map(async (vault: { id: number; name: string; items: any[] }) => ({
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
}
