import { logout } from "../services/authService.js";

async function main() {
	const logoutButton = document.getElementById("logout-btn");

	if (logoutButton) {
		logoutButton.onclick = async () => {
			await logout();
			window.location.replace("popupLoading.html");
		};
	}
}

main().catch(console.error);
