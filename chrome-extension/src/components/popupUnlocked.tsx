import { logout } from "../services/authService.js";

interface Props {
	onRefresh: () => void;
}

export function PopupUnlocked({ onRefresh }: Props) {
	return (
		<div>
			<h1>Unlocked</h1>
			<button
				onClick={async () => {
					await logout();
					onRefresh();
				}}
			>
				Logout
			</button>
			<button onClick={onRefresh}>Refresh</button>
		</div>
	);
}
