import { useState } from "react";
import { login, signup } from "../../services/authService.js";
import { BsBoxArrowUpRight } from "react-icons/bs";
import { CiWarning } from "react-icons/ci";
import { ErrorBox } from "../info/errorBox.js";
import { FormInput } from "../input/formInput.js";

interface Props {
	onRefresh: () => void;
}

export function Signup({ onRefresh }: Props) {
	const [username, setUsername] = useState("");
	const [confirmUsername, setConfirmUsername] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	const onSignup = async () => {
		if (evalInputs()) {
			await signup(username, password);
			await login(username, password);
			onRefresh();
		}
	};

	const onLogin = async () => {
		chrome.tabs.create({ url: chrome.runtime.getURL("public/mainpage.html?openView=login") });
		document.close();
	};

	const evalInputs = () => {
		if (!username || !password) {
			setErrorMessage("Both email and password is required");
			return false;
		}

		if (username !== username) {
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
		<div className="flex flex-col items-center justify-center w-72 min-h-48 px-6 py-8 border-gray-300 border rounded-md m-auto mt-[10%]">
			<h1 className="text-2xl font-bold text-gray-800 mb-6">Vault</h1>
			<div className="flex flex-col gap-3 w-full">
				<FormInput placeholder="Email" value={username} onChange={setUsername} />
				<FormInput placeholder="Confirm Email" value={confirmUsername} onChange={setConfirmUsername} />
				<div className="flex flex-col gap-1.5 bg-red-50 border border-red-300 rounded-md px-3 py-2.5">
					<p className="text-xs font-bold text-red-700 uppercase tracking-wide flex gap-3">
						<CiWarning size={16} /> Remember <CiWarning size={16} />
					</p>
					<p className="text-xs text-red-600 leading-snug">This password locks all your credentials. It must be very strong - consider a passphrase like:</p>
					<p className="text-xs font-mono font-semibold text-red-700 bg-red-100 rounded px-2 py-1">dog-apple-doctor-mini-table-running</p>
				</div>
				<FormInput placeholder="Password" type="password" value={password} onChange={setPassword} />
				<FormInput placeholder="Confirm Password" type="password" value={confirmPassword} onChange={setConfirmPassword} />
				{errorMessage && <ErrorBox msg={errorMessage} />}
				<button onClick={onSignup} className="w-full py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
					Signup
				</button>
				<button onClick={onLogin} className="relative flex items-center justify-center w-full py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
					Login
					<BsBoxArrowUpRight size={14} className="absolute right-3" />
				</button>
			</div>
		</div>
	);
}
