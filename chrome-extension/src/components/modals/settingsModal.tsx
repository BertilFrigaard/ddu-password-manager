import Modal from "./modal.js";
import { useUser } from "../../context/UserContext.js";
import { useState } from "react";
import { Setup2FA } from "./2fa/setup2FA.js";
import { FormInput } from "../userinput/formInput.js";
import { deleteAccount } from "../../services/authService.js";
import LoadingSpinner from "../info/loadingSpinner.js";

interface Props {
	onClose: () => void;
}

export function SettingsModal({ onClose }: Props) {
	const { user, refreshUser } = useUser();
	const [setup2FA, setSetup2FA] = useState(false);
	const [deleteAccountModal, setDeleteAccountModal] = useState(false);
	const [deleteMasterPassword, setDeleteMasterPassword] = useState("");
	const [deleteToken, setDeleteToken] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const confirmDelete = async () => {
		if (!deleteMasterPassword || (!deleteToken && user?.twoFactorEnabled)) {
			setError("You must enter both master password and 2FA token.");
			return;
		}

		if (!user) {
			setError("Something went wrong. User is not in session. Try relogging.");
			return;
		}

		setError("");
		setIsLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 0));
		try {
			await deleteAccount(user.email, deleteMasterPassword, user.twoFactorEnabled ? deleteToken : null);
			await refreshUser();
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		}
		setIsLoading(false);
	};

	if (deleteAccountModal) {
		return (
			<Modal
				title="Confirm Delete Account"
				onClose={() => {
					setDeleteAccountModal(false);
				}}
			>
				<div className="box-warning">
					<p className="text-base font-bold">Warning</p>
					<p className="text-sm">
						You are about to <span className="font-semibold text-red-900">permanently delete</span> your account. You will lose all your logins, and it cannot be undone! If you wish to proceed, enter the following information.
					</p>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs font-medium text-gray-600">Master Password</label>
					<FormInput placeholder="Master Password" value={deleteMasterPassword} type="password" onChange={setDeleteMasterPassword} />
				</div>
				{user?.twoFactorEnabled && (
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">2FA Token</label>
						<FormInput placeholder="2FA Token" value={deleteToken} type="password" onChange={setDeleteToken} />
					</div>
				)}
				{isLoading && <LoadingSpinner />}
				{error && !isLoading && <p className="text-danger">{error}</p>}
				<button onClick={confirmDelete} disabled={isLoading} className="btn-danger w-full">
					Delete
				</button>
			</Modal>
		);
	}

	if (setup2FA) {
		return (
			<Setup2FA
				onClose={() => {
					setSetup2FA(false);
				}}
			/>
		);
	}

	return (
		<Modal title="Settings" onClose={onClose}>
			<div className="flex flex-col gap-1">
				<label className="text-xs font-medium text-gray-600">Two Factor Authentication</label>
				{user?.twoFactorEnabled ? (
					<div className="flex items-center gap-2">
						<span className="box-success">Two-Factor Authentication is enabled</span>
					</div>
				) : (
					<div className="flex gap-2 items-center">
						<button
							type="button"
							onClick={() => {
								setSetup2FA(true);
							}}
							className="btn-sm-light"
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
						disabled={isLoading}
						className="btn-danger w-full"
					>
						Delete Account
					</button>
				</div>
			</div>
		</Modal>
	);
}
