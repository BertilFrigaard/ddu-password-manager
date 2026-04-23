import { StoredUser, Vault } from "../common/types.js";

export async function setSymmetricKey(key: string) {
	await chrome.storage.session.set({ symmetricKey: key });
}

export async function getSymmetricKey(): Promise<string | null> {
	const result = await chrome.storage.session.get("symmetricKey");
	return result.symmetricKey ?? null;
}

export async function clearSymmetricKey() {
	await chrome.storage.session.remove("symmetricKey");
}

export async function setAccessToken(token: string) {
	await chrome.storage.session.set({ accessToken: token });
}

export async function getAccessToken(): Promise<string | null> {
	const result = await chrome.storage.session.get("accessToken");
	return result.accessToken ?? null;
}

export async function clearAccessToken() {
	await chrome.storage.session.remove("accessToken");
}

export async function setRefreshKey(key: string) {
	await chrome.storage.session.set({ refreshKey: key });
}

export async function getRefreshKey(): Promise<string | null> {
	const result = await chrome.storage.session.get("refreshKey");
	return result.refreshKey ?? null;
}

export async function clearRefreshKey() {
	await chrome.storage.session.remove("refreshKey");
}

export async function setUser(user: StoredUser) {
	await chrome.storage.session.set({ user });
}

export async function getUser(): Promise<StoredUser | null> {
	const result = await chrome.storage.session.get("user");
	return result.user ?? null;
}

export async function clearUser() {
	await chrome.storage.session.remove("user");
}

export async function setVaults(vaults: Vault[]) {
	await chrome.storage.session.set({ vaults });
}

export async function getVaults(): Promise<Vault[] | null> {
	const result = await chrome.storage.session.get("vaults");
	return result.vaults ?? null;
}

export async function getCredentials(selectVault: number | null = null) {
	const vaults = await getVaults();
	if (!vaults) {
		return [];
	}
	if (selectVault !== null) {
		return vaults.filter((v) => v.id == selectVault).flatMap((vault) => vault.items);
	} else {
		return vaults.flatMap((vault) => vault.items);
	}
}

export async function clearVaults() {
	await chrome.storage.session.remove("vaults");
}
