import { logout } from "../authentication.js";
import { login, signup } from "../backendService.js";
import { getRefreshKey } from "../store.js";

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
