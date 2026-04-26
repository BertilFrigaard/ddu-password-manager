import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { isUnlocked } from "../services/authService.js";
import { Signup } from "../components/webapp/signup.js";
import { Login } from "../components/webapp/login.js";
import { Unlocked } from "../components/webapp/unlocked.js";
import { VaultProvider } from "../context/VaultContext.js";
import { UserProvider, useUser } from "../context/UserContext.js";

function App() {
	return (
		<UserProvider>
			<MainPage />
		</UserProvider>
	);
}

function MainPage() {
	const [view, setView] = useState<"login" | "signup">("login");
	const { isLoading, isLoggedIn } = useUser();

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const popup = params.get("openView");

		if (popup === "signup") {
			setView("signup");
		}
	}, []);

	if (isLoading) {
		return <p>Loading...</p>;
	}

	if (isLoggedIn) {
		return (
			<VaultProvider>
				<Unlocked />
			</VaultProvider>
		);
	} else {
		if (view == "signup") {
			return <Signup />;
		} else {
			return <Login />;
		}
	}
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
