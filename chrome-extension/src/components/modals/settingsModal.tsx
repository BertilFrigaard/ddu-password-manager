import Modal from "./modal.js";
import { useUser } from "../../context/UserContext.js";
import { useState } from "react";
import { Setup2FA } from "./setup2FA.js";

interface Props {
	onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
	const { user } = useUser();
	const [setup2FA, setSetup2FA] = useState(false);

	console.log(user?.twoFactorEnabled);

	if (setup2FA) {
		return <Setup2FA onClose={onClose} />;
	} else {
		return (
			<Modal onClose={onClose}>
				<div className="flex flex-col gap-3 bg-white rounded-xl p-6 w-150 shadow-lg">
					<h2 className="text-xl font-semibold text-gray-800">Settings</h2>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Two Factor Authentication</label>
						{user?.twoFactorEnabled ? (
							<div className="flex items-center gap-2">
								<span className="px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md">Two-Factor Authentication is enabled</span>
							</div>
						) : (
							<div className="flex gap-2 items-center">
								<button
									type="button"
									onClick={() => {
										setSetup2FA(true);
									}}
									className="shrink-0 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
								>
									Enable Two-Factor-Authentication
								</button>
							</div>
						)}
					</div>
				</div>
			</Modal>
		);
	}
}
