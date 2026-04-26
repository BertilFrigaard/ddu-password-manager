import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { isUnlocked } from "../services/authService.js";
import { Signup } from "../components/webapp/signup.js";
import { Login } from "../components/webapp/login.js";
import { Unlocked } from "../components/webapp/unlocked.js";
import { VaultProvider } from "../context/VaultContext.js";

function MainPage() {
	const [view, setView] = useState<null | "signup">(null);
	const [unlocked, setUnlocked] = useState<boolean | null>(null);

	const refresh = async () => {
		setUnlocked(await isUnlocked());
	};

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const popup = params.get("openView");

		if (popup === "signup") {
			setView("signup");
		}

		refresh();
	});

	if (unlocked === null) {
		return <p>Loading...</p>;
	}

	if (unlocked) {
		return (
			<VaultProvider>
				<Unlocked onRefresh={refresh} />
			</VaultProvider>
		);
	} else {
		if (view == "signup") {
			return <Signup onRefresh={refresh} />;
		} else {
			return <Login onRefresh={refresh} />;
		}
	}
}

const root = createRoot(document.getElementById("root")!);
root.render(<MainPage />);
