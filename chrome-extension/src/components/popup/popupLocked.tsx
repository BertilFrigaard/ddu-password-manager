import { useState } from "react";
import { login } from "../../services/authService.js";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { FormInput } from "../userinput/formInput.js";
import { useUser } from "../../context/UserContext.js";
import LoadingSpinner from "../info/loadingSpinner.js";

export function PopupLocked() {
	const { refreshUser } = useUser();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const onLogin = async () => {
		setLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 0));
		try {
			await login(username, password);
			await refreshUser();
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		}
		setLoading(false);
	};

	const onSignup = async () => {
		chrome.tabs.create({ url: chrome.runtime.getURL("public/mainpage.html?openView=signup") });
		window.close();
	};

	const onWebapp = async () => {
		chrome.tabs.create({ url: chrome.runtime.getURL("public/mainpage.html") });
		window.close();
	};

	return (
		<div className="flex flex-col items-center justify-center w-72 min-h-48 px-6 py-5 bg-white">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Vault</h1>
			<div className="flex flex-col gap-3 w-full">
				<FormInput placeholder="Email" value={username} onChange={setUsername} />
				<FormInput placeholder="Password" type="password" value={password} onChange={setPassword} />
				<div>{loading && <LoadingSpinner />}</div>
				{error && !loading && <p className="text-danger">{error}</p>}
				<button onClick={onLogin} disabled={loading} className="btn-primary">
					Login
				</button>
				<button onClick={onSignup} disabled={loading} className="btn-secondary relative flex justify-center">
					Signup
					<BsBoxArrowUpRight size={14} className="absolute right-3" />
				</button>
			</div>
			<button onClick={onWebapp} className="btn-sm-ghost mt-4">
				Open App
			</button>
		</div>
	);
}
