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
