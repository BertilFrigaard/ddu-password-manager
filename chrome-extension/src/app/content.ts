chrome.runtime.onMessage.addListener((message) => {
	if (message.type === "AUTOFILL") {
		const { username, password } = message;

		const usernameField = document.querySelector<HTMLInputElement>('input[type="email"], input[type="text"][name*="user"], input[type="text"][name*="email"]');
		const passwordField = document.querySelector<HTMLInputElement>('input[type="password"]');

		if (usernameField) {
			usernameField.value = username;
			usernameField.dispatchEvent(new Event("input", { bubbles: true }));
		}
		if (passwordField) {
			passwordField.value = password;
			passwordField.dispatchEvent(new Event("input", { bubbles: true }));
		}
	}
});
