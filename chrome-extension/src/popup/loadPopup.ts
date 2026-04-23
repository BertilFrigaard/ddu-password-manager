import { isUnlocked } from "../services/authService.js";

async function main() {
	if (await isUnlocked()) {
		window.location.replace("popupUnlocked.html");
	} else {
		window.location.replace("popupLocked.html");
	}
}

main().catch(console.error);
