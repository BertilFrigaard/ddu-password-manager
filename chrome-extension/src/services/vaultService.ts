import { Vault } from "../common/types.js";
import { logRequestError } from "../common/util.js";
import { setVaults } from "../store/store.js";
import { authenticatedFetch } from "./authService.js";
import { decryptVaults } from "./crypto.js";

export async function createVault(vaultName: string, twoFactorEnabled: boolean) {
	const res = await authenticatedFetch(`/vaults`, "POST", { vaultName, twoFactorEnabled });

	if (!res.ok) {
		logRequestError("createVault", res);
		throw Error("Failed to create vault");
	}
}

export async function deleteVault(vaultId: number, token?: string) {
	const res = await authenticatedFetch(`/vaults/${vaultId}`, "DELETE", { token });

	if (!res.ok) {
		logRequestError("deleteVault", res);
		throw Error("Failed to delete vault");
	}
}

export async function updateVault(vaultId: number, vaultName: string, twoFactorEnabled?: boolean, token?: string) {
	const res = await authenticatedFetch(`/vaults/${vaultId}`, "POST", { name: vaultName, twoFactorEnabled, token: token });

	if (!res.ok) {
		logRequestError("updateVault", res);
		throw Error("Failed to update vault");
	}
}

export async function getVaults() {
	const res = await authenticatedFetch("/vaults", "GET");

	if (!res.ok) {
		logRequestError("getVaults", res);
		throw Error("Failed to fetch vaults");
	} else {
		const json = await res.json();
		const vaults = json.vaults;

		if (vaults === undefined) {
			console.error("fetch succeded but returned no vaults in res.json(). In method getVaults()");
			throw Error("Failed to fetch vaults");
		}

		try {
			const decryptedVaults = await decryptVaults(vaults);
			setVaults(decryptedVaults);
		} catch (e) {
			console.error("Failed to decrypt vaults in method getVaults");
			console.error(e);
			throw Error("Failed to decrypt vaults");
		}
	}
}
