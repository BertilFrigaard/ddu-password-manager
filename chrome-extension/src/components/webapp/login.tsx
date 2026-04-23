import { useState } from "react";
import { login } from "../../services/authService.js";

interface Props {
	onRefresh: () => void;
}

export function Login({ onRefresh }: Props) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const onLogin = async () => {
		await login(username, password);
		onRefresh();
	};

	return (
		<div>
			<h1>Login</h1>
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
		</div>
	);
}
