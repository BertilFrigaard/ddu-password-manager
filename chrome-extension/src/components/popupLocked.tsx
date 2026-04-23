import { useState } from "react";
import { login } from "../services/authService.js";
import { BsBoxArrowUpRight } from "react-icons/bs";

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
		<div className="flex flex-col items-center justify-center w-72 min-h-48 px-6 py-8 bg-white">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Vault</h1>
			<div className="flex flex-col gap-3 w-full">
				<input
					className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400"
					placeholder="Email"
					type="text"
					value={username}
					onChange={(e) => {
						setUsername(e.target.value);
					}}
				/>
				<input
					className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400"
					placeholder="Password"
					type="password"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
				/>
				<button onClick={onLogin} className="w-full py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
					Login
				</button>
				<button onClick={onSignup} className="relative flex items-center justify-center w-full py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
					Signup
					<BsBoxArrowUpRight size={14} className="absolute right-3" />
				</button>
			</div>
			<button onClick={onWebapp} className="mt-5 text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
				Open web app
			</button>
		</div>
	);
}
