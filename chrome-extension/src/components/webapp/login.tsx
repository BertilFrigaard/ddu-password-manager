import { useState } from "react";
import { login } from "../../services/authService.js";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { FormInput } from "../userinput/formInput.js";
import { useUser } from "../../context/UserContext.js";
import LoadingSpinner from "../info/loadingSpinner.js";

export function Login() {
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

	return (
		<div className="flex flex-col items-center justify-center w-72 min-h-48 px-6 py-8 border-gray-300 border rounded-md m-auto mt-[10%]">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Vault</h1>
			<div className="flex flex-col gap-3 w-full">
				<FormInput placeholder="Email" value={username} onChange={setUsername} />
				<FormInput placeholder="Password" type="password" value={password} onChange={setPassword} />
				{loading && <LoadingSpinner />}
				{error && !loading && <p className="text-danger">{error}</p>}
				<button onClick={onLogin} disabled={loading} className="btn-primary">
					Login
				</button>
				<button onClick={onSignup} disabled={loading} className="btn-secondary relative flex items-center justify-center">
					Signup
					<BsBoxArrowUpRight size={14} className="absolute right-3" />
				</button>
			</div>
		</div>
	);
}
