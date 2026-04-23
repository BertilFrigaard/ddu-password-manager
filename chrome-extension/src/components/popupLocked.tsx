import { useState } from "react";
import { login } from "../services/authService.js";

interface Props {
	onRefresh: () => void;
}

export function PopupLocked({ onRefresh }: Props) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const onLogin = async () => {
		await login(username, password);
		onRefresh();
	};

	const onSignup = async () => {
		chrome.tabs.create({ url: chrome.runtime.getURL("public/mainpage.html?openView=signup") });
		document.close();
	};

	const onWebapp = async () => {
		chrome.tabs.create({ url: chrome.runtime.getURL("public/mainpage.html") });
		document.close();
	};

	return (
		<div>
			<h1>Locked</h1>
			<input
				type="text"
				value={username}
				onChange={(e) => {
					setUsername(e.target.value);
				}}
			/>
			<input
				type="password"
				value={password}
				onChange={(e) => {
					setPassword(e.target.value);
				}}
			/>
			<button onClick={onLogin}>Login</button>
			<button onClick={onSignup}>Signup</button>
			<button onClick={onWebapp}>Webapp</button>
		</div>
	);
}
