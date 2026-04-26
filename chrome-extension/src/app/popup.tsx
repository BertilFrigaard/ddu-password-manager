import { createRoot } from "react-dom/client";
import { isUnlocked } from "../services/authService.js";
import { useEffect, useState } from "react";
import { PopupUnlocked } from "../components/popup/popupUnlocked.js";
import { PopupLocked } from "../components/popup/popupLocked.js";
import { VaultProvider } from "../context/VaultContext.js";
import { UserProvider, useUser } from "../context/UserContext.js";

function App() {
	return (
		<UserProvider>
			<Popup />
		</UserProvider>
	);
}

function Popup() {
	const { isLoading, isLoggedIn } = useUser();

	if (isLoading) {
		return (
			<div>
				<p>Loading...</p>
			</div>
		);
	}

	return isLoggedIn ? (
		<VaultProvider>
			<PopupUnlocked />
		</VaultProvider>
	) : (
		<PopupLocked />
	);
}

const root = createRoot(document.getElementById("root")!);
root.render(<App />);
