import { login, signup } from "./backendService.js";

const loginView = document.getElementById("view-login");
const loginButton = document.getElementById("login-btn");
const signupButton = document.getElementById("signup-btn");
const emailInput = document.getElementById("email-input") as HTMLInputElement | null;
const passwordInput = document.getElementById("password-input") as HTMLInputElement | null;
const mainPageButton = document.getElementById("main-page-btn");

if (signupButton && passwordInput && emailInput) {
	signupButton.onclick = () => {
		signup(emailInput.value, passwordInput.value);
	};
}

if (loginButton && passwordInput && emailInput) {
	loginButton.onclick = () => {
		login(emailInput.value, passwordInput.value);
	};
}
