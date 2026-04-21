import { clearAccessToken, clearRefreshKey, clearSymmetricKey, clearUser, clearVaults, getAccessToken, getRefreshKey, setAccessToken } from "./store.js";
import { BACKEND } from "./config.js";
import { logRequestError } from "./util.js";

export async function isUnlocked(): Promise<boolean> {
	const key = await getRefreshKey();
	return key !== null;
}

export async function logout() {
	await clearAccessToken();
	await clearSymmetricKey();
	await clearRefreshKey();
	await clearUser();
	await clearVaults();
}

async function refreshAccessToken(): Promise<void> {
	const refreshKey = await getRefreshKey();
	if (!refreshKey) {
		throw new Error("No refresh key");
	}

	const accessToken = await getAccessToken();
	if (!accessToken) {
		throw new Error("No access token to extract sessionId");
	}

	// TODO: figure out how the sessinId is extracted from the payload,
	// make it cleaner and possiple extract to a util function
	const payload = JSON.parse(atob(accessToken.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
	const sessionId = payload.sessionId;

	const res = await fetch(`${BACKEND}/refresh`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refreshKey, sessionId }),
	});

	if (!res.ok) {
		await logRequestError("refreshAccessToken", res);
		throw new Error("Refresh access token failed");
	}

	const { accessToken: newToken } = await res.json();
	await setAccessToken(newToken);
}

export async function authenticatedFetch(endpoint: string, method: string, body?: object): Promise<Response> {
	const makeRequest = async (token: string | null) =>
		fetch(`${BACKEND}${endpoint}`, {
			method,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token ?? ""}`,
			},
			body: body !== undefined ? JSON.stringify(body) : undefined,
		});

	let res = await makeRequest(await getAccessToken());
	if (res.status !== 401) {
		return res;
	}
	try {
		await refreshAccessToken();
	} catch {
		await logout();
		throw new Error("Session expired, logged out");
	}

	res = await makeRequest(await getAccessToken());
	if (res.status === 401) {
		await logout();
		throw new Error("Session expired, logged out");
	}

	return res;
}
