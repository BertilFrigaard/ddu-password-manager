import { setTextId } from "../core/util.js";
import { createCredential } from "../services/credentialService.js";
import { getCredentials, getUser, getVaults } from "../storage/store.js";

async function main() {
	const openCreateCredentialViewButton = document.getElementById("open-create-btn");
	const websiteInput = document.getElementById("website-input") as HTMLInputElement | null;
	const usernameInput = document.getElementById("username-input") as HTMLInputElement | null;
	const passwordInput = document.getElementById("password-input") as HTMLInputElement | null;
	const createBtn = document.getElementById("create-btn");

	if (openCreateCredentialViewButton) {
		openCreateCredentialViewButton.onclick = async () => {
			const createCredentialView = document.getElementById("create-credential-view");
			if (!createCredentialView) {
				console.error("Could not find create credential view");
			} else {
				createCredentialView.removeAttribute("hidden");
			}
		};
	}

	if (createBtn && websiteInput && usernameInput && passwordInput) {
		createBtn.onclick = async () => {
			const website = websiteInput.value;
			const username = usernameInput.value;
			const password = passwordInput.value;
			if (website.trim() === "" || username.trim() === "") {
				console.log("Website and username must be filled");
				return;
			}

			const user = await getUser();
			if (!user) {
				throw new Error("User is not set in store");
			}

			if (!user.defaultVault) {
				throw new Error("User has no default vault");
			}

			//TODO: fine grained choice of vault
			createCredential(website, username, password.trim() === "" ? null : password, user.defaultVault);
		};
	}

	const credentialView = document.getElementById("credentials-view");
	if (credentialView) {
		updateCredentialView(credentialView);
	} else {
		console.error("CredentialView not found");
	}

	const params = new URLSearchParams(window.location.search);
	const popup = params.get("popup"); // "create-credential"

	if (popup === "create-credential") {
		const createCredentialView = document.getElementById("create-credential-view");
		if (!createCredentialView) {
			console.error("Could not find create credential view");
		} else {
			createCredentialView.removeAttribute("hidden");
		}
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
			<div style="position:relative;display:inline-block;">
				<button id="copy-btn-${credential.id}">Copy</button>
				<div id="copy-menu-${credential.id}" hidden style="position:absolute;z-index:10;background:#fff;border:1px solid #ccc;padding:4px 0;">
					<button class="copy-option" data-field="password">Password</button>
					<button class="copy-option" data-field="website">Website</button>
					<button class="copy-option" data-field="username">Username</button>
				</div>
			</div>
			<button id="details-btn">Details</button>
		`;

		parent.appendChild(container);

		setTextId(`website-text-${credential.id}`, credential.website);
		setTextId(`website-username-${credential.id}`, credential.username);

		const copyBtn = document.getElementById(`copy-btn-${credential.id}`);
		const copyMenu = document.getElementById(`copy-menu-${credential.id}`);

		if (!copyBtn || !copyMenu) {
			console.error("copybutton or copymenu not found for id: " + credential.id);
			continue;
		}

		copyBtn.addEventListener("click", (e) => {
			e.stopPropagation();
			const isHidden = copyMenu.hasAttribute("hidden");
			if (isHidden) copyMenu.removeAttribute("hidden");
		});

		copyMenu.querySelectorAll<HTMLButtonElement>(".copy-option").forEach((btn) => {
			btn.addEventListener("click", () => {
				const field = btn.dataset.field;
				let value = "";
				if (field === "password") {
					value = "credential.password";
				} else if (field === "website") {
					value = credential.website;
				} else if (field === "username") {
					value = credential.username;
				}
				navigator.clipboard.writeText(value);
				copyMenu.setAttribute("hidden", "");
			});
		});
	}

	document.addEventListener("click", () => {
		document.querySelectorAll<HTMLElement>(".copy-menu").forEach((m) => m.setAttribute("hidden", ""));
	});
}

main().catch(console.error);
