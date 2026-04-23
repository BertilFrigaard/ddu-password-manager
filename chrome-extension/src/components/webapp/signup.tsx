import { useState } from "react";
import { login, signup } from "../../services/authService.js";

interface Props {
	onRefresh: () => void;
}

export function Signup({ onRefresh }: Props) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const onSignup = async () => {
		await signup(username, password);
		await login(username, password);
		onRefresh();
	};

	return (
		<div>
			<h1>Signup</h1>
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
			<button onClick={onSignup}>Signup</button>
		</div>
	);
}
