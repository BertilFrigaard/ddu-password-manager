let symmetricKey: string | null = null;

export function clearSymmetricKey() {
	// TODO: Memory should be purged so the key isnt left in memory as garbage
	symmetricKey = null;
}

export function setSymmetricKey(newSymmetricKey: string) {
	symmetricKey = newSymmetricKey;
}

export function getSymmetricKey() {
	return symmetricKey;
}

let accessToken: string | null = null;

export function clearAccessToken() {
	// TODO: Memory should be purged so the key isnt left in memory as garbage
	accessToken = null;
}

export function setAccessToken(newAccessToken: string) {
	accessToken = newAccessToken;
}

export function getAccessToken() {
	return accessToken;
}

let refreshKey: string | null = null;

export function clearRefreshKey() {
	// TODO: Memory should be purged so the key isnt left in memory as garbage
	refreshKey = null;
}

export function setRefreshKey(newRefreshKey: string) {
	refreshKey = newRefreshKey;
}

export function getRefreshKey() {
	return refreshKey;
}
