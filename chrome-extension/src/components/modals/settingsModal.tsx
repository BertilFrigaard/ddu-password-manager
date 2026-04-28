import Modal from "./modal.js";
import { useUser } from "../../context/UserContext.js";
import { useState } from "react";
import { Setup2FA } from "./2fa/setup2FA.js";
import { FormInput } from "../userinput/formInput.js";
import { deleteAccount } from "../../services/authService.js";

interface Props {
	onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
	const { user, refreshUser } = useUser();
	const [setup2FA, setSetup2FA] = useState(false);
	const [deleteAccountModal, setDeleteAccountModal] = useState(false);
	const [deleteMasterPassword, setDeleteMasterPassword] = useState("");
	const [deleteToken, setDeleteToken] = useState("");

	const confirmDelete = async () => {
		if (!deleteMasterPassword || (!deleteToken && user?.twoFactorEnabled)) {
			console.error("You must enter both 2FA token and master password");
			return;
		}

		if (!user) {
			console.error("Something went wrong. User is not in session. Try relogging.");
			return;
		}
		try {
			await deleteAccount(user.email, deleteMasterPassword, user.twoFactorEnabled ? deleteToken : null);
			await refreshUser();
		} catch (e) {
			console.error(e);
		}
	};

	if (deleteAccountModal) {
		return (
			<Modal
				title="Confirm Delete Account"
				onClose={() => {
					setDeleteAccountModal(false);
				}}
			>
				<div className="flex flex-col gap-3 bg-white rounded-xl p-6 w-120 shadow-lg">
					<h2 className="text-lg font-semibold text-gray-800">Confirm Delete Account</h2>
					<p>This will delete your account forever. If you confirm this, it cannot be undone.</p>
					<p>To confirm enter your master password below</p>
					<FormInput placeholder="Master Password" value={deleteMasterPassword} type="password" onChange={setDeleteMasterPassword} />
					{user?.twoFactorEnabled && (
						<div>
							<p>You have Two Factor Authentication activated, and thus you will have to authenticate inorder to delete your account. Please enter your 2FA token below</p>
							<FormInput placeholder="2FA Token" value={deleteToken} type="password" onChange={setDeleteToken} />
						</div>
					)}
					<button onClick={confirmDelete} className="py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
						Delete
					</button>
				</div>
			</Modal>
		);
	}

	if (setup2FA) {
		return <Setup2FA onClose={onClose} />;
	}

	return (
		<Modal title="Settings" onClose={onClose}>
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
			<div className="flex flex-col gap-1">
				<label className="text-xs font-medium text-gray-600">Delete Account</label>
				<div className="flex gap-2 items-center">
					<button
						type="button"
						onClick={() => {
							setDeleteAccountModal(true);
						}}
						className="shrink-0 px-3 py-2 text-xs font-medium text-gray-600 border border-error-dark bg-error rounded-md hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
					>
						Delete Account
					</button>
				</div>
			</div>
		</Modal>
	);
}
