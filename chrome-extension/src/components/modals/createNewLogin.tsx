import { useState } from "react";
import Modal from "./modal.js";
import { FormInput } from "../userinput/formInput.js";
import { FaRegEye, FaRegEyeSlash, FaChevronDown } from "react-icons/fa";
import { PasswordGenerator } from "../userinput/passwordGenerator.js";

interface Props {
	onClose: () => void;
}

export function CreateNewLogin({ onClose }: Props) {
	const [website, setWebsite] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showGenerator, setShowGenerator] = useState(false);

	const onCreate = async () => {};

	return (
		<Modal onClose={onClose}>
			<div className="flex flex-col gap-3 bg-white rounded-xl p-6 w-150 shadow-lg">
				<h2 className="text-xl font-semibold text-gray-800">New Login</h2>
				<div className="flex flex-col gap-1">
					<label className="text-xs font-medium text-gray-600">Website URL</label>
					<FormInput placeholder="https://example.com" value={website} onChange={setWebsite} />
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs font-medium text-gray-600">Username</label>
					<FormInput placeholder="Username / Email" value={username} onChange={setUsername} />
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs font-medium text-gray-600">Password</label>
					<div className="flex gap-2 items-center">
						<div className="relative flex-1">
							<FormInput placeholder="Password" type={showPassword ? "text" : "password"} value={password} onChange={setPassword} />
							<button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:cursor-pointer" onClick={() => setShowPassword((v) => !v)}>
								{showPassword ? <FaRegEyeSlash size={14} /> : <FaRegEye size={14} />}
							</button>
						</div>
						<button
							type="button"
							onClick={() => {
								setShowGenerator((v) => !v);
							}}
							className="shrink-0 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
						>
							Generate
						</button>
					</div>
					{showGenerator && <PasswordGenerator setPassword={setPassword} />}
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs font-medium text-gray-600">Folder</label>
					<select name="" id="" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-gray-400 transition-colors text-gray-800 bg-white">
						<option value="">Vault</option>
						<option value="">School Logins</option>
						<option value="">Very Private</option>
					</select>
				</div>
				<button onClick={onCreate} className="py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
					Create
				</button>
			</div>
		</Modal>
	);
}
