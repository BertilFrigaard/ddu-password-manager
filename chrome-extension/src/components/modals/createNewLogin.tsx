import { useState } from "react";
import Modal from "./modal.js";
import { FormInput } from "../input/formInput.js";

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
				<FormInput placeholder="Website URL" value={website} onChange={setWebsite} />
				<FormInput placeholder="Username / Email" value={username} onChange={setUsername} />
				<FormInput placeholder="Password" type="password" value={password} onChange={setPassword} />
				<button onClick={async () => {}} className="py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
					Create
				</button>
			</div>
		</Modal>
	);
}
