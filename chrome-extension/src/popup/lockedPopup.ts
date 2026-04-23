import { login, signup } from "../services/authService.js";
import { getRefreshKey } from "../storage/store.js";

async function main() {
	const loginView = document.getElementById("view-login");
	const loginButton = document.getElementById("login-btn");
	const signupButton = document.getElementById("signup-btn");
	const emailInput = document.getElementById("email-input") as HTMLInputElement | null;
	const passwordInput = document.getElementById("password-input") as HTMLInputElement | null;
	const mainPageButton = document.getElementById("main-page-btn");

	if (signupButton && passwordInput && emailInput) {
		signupButton.onclick = async () => {
			await signup(emailInput.value, passwordInput.value);
		};
	}

	if (loginButton && passwordInput && emailInput) {
		loginButton.onclick = async () => {
			await login(emailInput.value, passwordInput.value);
			window.location.replace("popupLoading.html");
		};
	}

	if (mainPageButton) {
		mainPageButton.onclick = async () => {
			chrome.tabs.create({ url: "public/webapp/webappLoading.html" });
		};
	}
}

main().catch(console.error);
