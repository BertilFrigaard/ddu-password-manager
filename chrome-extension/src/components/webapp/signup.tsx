import { useState } from "react";
import { login, signup } from "../../services/authService.js";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { CiWarning } from "react-icons/ci";
import { FormInput } from "../userinput/formInput.js";
import { useUser } from "../../context/UserContext.js";
import LoadingSpinner from "../info/loadingSpinner.js";

export function Signup() {
	const { refreshUser } = useUser();
	const [username, setUsername] = useState("");
	const [confirmUsername, setConfirmUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const onSignup = async () => {
		if (evalInputs()) {
			setLoading(true);
			await new Promise((resolve) => setTimeout(resolve, 0));
			try {
				await signup(username, password);
				await login(username, password);
				refreshUser();
			} catch (e) {
				setErrorMessage(e instanceof Error ? e.message : String(e));
			}
			setLoading(false);
		}
	};

	const onLogin = async () => {
		chrome.tabs.create({ url: chrome.runtime.getURL("public/mainpage.html?openView=login") });
		window.close();
	};

	const evalInputs = () => {
		if (!username || !password) {
			setErrorMessage("Both email and password is required");
			return false;
		}

		if (username !== confirmUsername) {
			setErrorMessage("Emails dosen't match");
			return false;
		}

		if (password !== confirmPassword) {
			setErrorMessage("Passwords dosen't match");
			return false;
		}

		if (password.length < 8) {
			setErrorMessage("Password must be at least 8 characters long");
			return false;
		}
		return true;
	};

	return (
		<div className="flex flex-col items-center justify-center w-150 min-h-48 px-6 py-8 border-gray-300 border rounded-md m-auto mt-[10%]">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Vault</h1>
			<div className="flex flex-col gap-3 w-full">
				<FormInput placeholder="Email" value={username} onChange={setUsername} />
				<FormInput placeholder="Confirm Email" value={confirmUsername} onChange={setConfirmUsername} />
				<div className="flex flex-col gap-1.5 bg-orange-50 border border-orange-300 rounded-md px-3 py-2.5">
					<p className="text-sm font-bold text-orange-700 uppercase tracking-wider flex gap-3 items-center">
						<CiWarning size={16} /> Remember <CiWarning size={16} />
					</p>
					<ul className="text-sm text-orange-600 list-disc list-inside space-y-0.5">
						<li>You must be able to remember this password</li>
						<li>Do not use personal information</li>
						<li>Make it very strong, since it locks all your logins</li>
					</ul>
					<p className="text-xs text-orange-600 leading-snug">Consider using a password like the following:</p>
					<p className="text-xs font-mono font-semibold text-orange-700 bg-orange-100 rounded px-2 py-2">dog-apple-doctor-mini-table-running</p>
				</div>
				<FormInput placeholder="Password" type="password" value={password} onChange={setPassword} />
				<FormInput placeholder="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
				{errorMessage && !loading && <p className="text-danger">{errorMessage}</p>}
				{loading && <LoadingSpinner />}
				<button onClick={onSignup} disabled={loading} className="btn-primary">
					Signup
				</button>
				<button onClick={onLogin} disabled={loading} className="relative btn-secondary flex justify-center">
					Login
					<BsBoxArrowUpRight size={14} className="absolute right-3" />
				</button>
			</div>
		</div>
	);
}
