import { useState } from "react";
import Modal from "../modal.js";

interface Props {
	onClose: () => void;
}

export function CreateNewLogin({ onClose }: Props) {
	const [website, setWebsite] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	return (
		<Modal onClose={onClose}>
			<div className="flex flex-col gap-3 bg-white rounded-xl p-6 w-150 shadow-lg">
				<h2 className="text-lg font-semibold text-gray-800">New Login</h2>
				<input
					className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400"
					placeholder="Website URL"
					value={website}
					onChange={(e) => {
						setWebsite(e.target.value);
					}}
					type="text"
				/>
				<input
					className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400"
					placeholder="Username / Email"
					value={username}
					onChange={(e) => {
						setUsername(e.target.value);
					}}
					type="text"
				/>
				<input
					className="px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400"
					placeholder="Password"
					value={password}
					onChange={(e) => {
						setPassword(e.target.value);
					}}
					type="password"
				/>
				<button onClick={async () => {}} className="py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
					Create
				</button>
			</div>
		</Modal>
	);
}
