export function hexToBytes(hex: string): Uint8Array {
	return new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
}

export function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}
export function padEmail(email: string): string {
	while (email.length < 8) email += ".";
	return email;
}
export async function logRequestError(method: string, res: Response) {
	const resJson = await res.json();

	let errorString = `Status code ${res.status} recieved from request in method ${method}`;

	if (resJson) {
		if (resJson.error) {
			errorString += `\nError message: ${resJson.error}`;
		} else {
			errorString += `\nRecieved json: ${JSON.stringify(resJson)}`;
		}
	}

	console.error(errorString);
	return resJson.error ?? "Unknown Error";
}

export function setTextElement(element: HTMLElement | null, str: string) {
	if (!element) {
		console.error("Element not found");
		return;
	}
	element.textContent = str;
}

export function setTextId(id: string, str: string) {
	const element = document.getElementById(id);
	if (!element) {
		console.error(`Element not found with id: ${id}`);
		return;
	}
	element.textContent = str;
}
