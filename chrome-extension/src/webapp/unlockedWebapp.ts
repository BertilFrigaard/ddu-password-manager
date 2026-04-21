import { createCredential } from "../backendService.js";
import { getUser, getVaults } from "../store.js";

async function main() {
	const websiteInput = document.getElementById("website-input") as HTMLInputElement | null;
	const usernameInput = document.getElementById("username-input") as HTMLInputElement | null;
	const passwordInput = document.getElementById("password-input") as HTMLInputElement | null;
	const createBtn = document.getElementById("create-btn");

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

	const vaults = await getVaults();
	console.log(vaults);
}

main().catch(console.error);
