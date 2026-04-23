import { encryptData } from "./crypto.js";
import { logRequestError } from "../common/util.js";
import { authenticatedFetch } from "./authService.js";

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
		logRequestError("createCredential", res);
	} else {
		console.log("SUCCESS");
	}
}
