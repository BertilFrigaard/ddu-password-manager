import { encryptData } from "./crypto.js";
import { logRequestError } from "../common/util.js";
import { authenticatedFetch } from "./authService.js";
import { VaultItem, ItemPassword } from "../common/types.js";

export async function createCredential(website: string, username: string, passsword: string | null, vaultId: number, twoFactorEnabled: boolean) {
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
			twoFactorEnabled,
			ivPassword: encryptedPassword.iv,
			encryptedPassword: encryptedPassword.encryptedData,
			authTagPassword: encryptedPassword.authTag,
		};
	} else {
		body = {
			encryptedInfo: encryptedInfo.encryptedData,
			iv: encryptedInfo.iv,
			authTag: encryptedInfo.authTag,
			twoFactorEnabled,
		};
	}

	const res = await authenticatedFetch(`/vaults/${vaultId}/items`, "POST", body);

	if (!res.ok) {
		logRequestError("createCredential", res);
		throw Error("Failed to create new login");
	}
}

export async function getCredentialWithTwoFactorAuthentication(itemId: number, token: string) {
	const res = await authenticatedFetch("/vaultItem/" + itemId + "/password", "POST", { token });

	if (!res.ok) {
		logRequestError("getCredentialWithTwoFactorAuthentication", res);
		throw Error("Failed get password with 2FA");
	}

	const resJson = await res.json();

	if (!resJson.password) {
		throw Error("Didn't recieve login from server");
	}

	return resJson.password as ItemPassword;
}
