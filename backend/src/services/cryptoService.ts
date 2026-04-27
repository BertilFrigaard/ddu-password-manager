import crypto from "node:crypto";

export function encrypt(symmetricKey: string, data: string): { encryptedString: string; iv: string; authTag: string } {
	const iv = crypto.randomBytes(12);
	const cipher = crypto.createCipheriv("aes-256-gcm", Buffer.from(symmetricKey, "hex"), iv);
	const encryptedString = Buffer.concat([cipher.update(data, "utf-8"), cipher.final()]).toString("hex");
	return {
		encryptedString,
		iv: iv.toString("hex"),
		authTag: cipher.getAuthTag().toString("hex"),
	};
}

export function decrypt(symmetricKey: string, encryptedString: string, iv: string, authTag: string): string {
	const decipher = crypto.createDecipheriv("aes-256-gcm", Buffer.from(symmetricKey, "hex"), Buffer.from(iv, "hex"));
	decipher.setAuthTag(Buffer.from(authTag, "hex"));
	return Buffer.concat([decipher.update(Buffer.from(encryptedString, "hex")), decipher.final()]).toString("utf-8");
}
