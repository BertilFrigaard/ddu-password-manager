import { clearAccessToken, clearRefreshKey, clearSymmetricKey, getRefreshKey } from "./store.js";

export async function isUnlocked(): Promise<boolean> {
	const key = await getRefreshKey();
	return key !== null;
}

export async function logout() {
	await clearAccessToken();
	await clearSymmetricKey();
	await clearRefreshKey();
}
