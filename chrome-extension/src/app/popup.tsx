import { createRoot } from "react-dom/client";
import { isUnlocked } from "../services/authService.js";
import { useEffect, useState } from "react";
import { PopupUnlocked } from "../components/popup/popupUnlocked.js";
import { PopupLocked } from "../components/popup/popupLocked.js";

function Popup() {
	const [unlocked, setUnlocked] = useState<boolean | null>(null);

	const refresh = async () => {
		setUnlocked(await isUnlocked());
	};

	useEffect(() => {
		refresh();
	}, []);

	if (unlocked === null) {
		return (
			<div>
				<p>Loading</p>
			</div>
		);
	}

	return unlocked ? <PopupUnlocked onRefresh={refresh} /> : <PopupLocked onRefresh={refresh} />;
}

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
