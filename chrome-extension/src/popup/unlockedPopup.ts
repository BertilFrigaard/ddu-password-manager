import { logout } from "../services/authService.js";
import { getCredentials } from "../storage/store.js";
import { setTextId } from "../core/util.js";

async function main() {
	const logoutButton = document.getElementById("logout-btn");
	const mainPageButton = document.getElementById("main-page-btn");
	const createNewButton = document.getElementById("create-new-btn");

	if (logoutButton) {
		logoutButton.onclick = async () => {
			await logout();
			window.location.replace("popupLoading.html");
		};
	}

	if (mainPageButton) {
		mainPageButton.onclick = async () => {
			chrome.tabs.create({ url: "public/webapp/webappLoading.html" });
		};
	}

	if (createNewButton) {
		createNewButton.onclick = async () => {
			chrome.tabs.create({ url: "public/webapp/webappUnlocked.html?popup=create-credential" });
		};
	}

	const credentialView = document.getElementById("credentials-view");
	if (credentialView) {
		updateCredentialView(credentialView);
	} else {
		console.error("CredentialView not found");
	}
}

async function updateCredentialView(parent: HTMLElement) {
	const credentials = await getCredentials();

	parent.innerHTML = "";

	for (const credential of credentials) {
		const container = document.createElement("div");
		container.innerHTML = `
			<div>
				<p id="website-text-${credential.id}"></p>
				<p id="website-username-${credential.id}"></p>
			</div>
			<button id="copy-btn">Copy</button>
			<button id="details-btn">Details</button>
		`;

		parent.appendChild(container);

		setTextId(`website-text-${credential.id}`, credential.website);
		setTextId(`website-username-${credential.id}`, credential.username);
	}
}

main().catch(console.error);
