import { isUnlocked } from "../services/authService.js";

async function main() {
	if (await isUnlocked()) {
		window.location.replace("webappUnlocked.html");
	} else {
		window.location.replace("webappLocked.html");
	}
}

main().catch(console.error);
