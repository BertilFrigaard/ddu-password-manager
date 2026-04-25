import { logRequestError } from "../common/util.js";
import { authenticatedFetch } from "./authService.js";

export async function createVault(vaultName: string) {
	const res = await authenticatedFetch(`/vaults`, "POST", { vaultName });

	if (!res.ok) {
		logRequestError("createVault", res);
		return false;
	} else {
		console.log("SUCCESS");
		return true;
	}
}
