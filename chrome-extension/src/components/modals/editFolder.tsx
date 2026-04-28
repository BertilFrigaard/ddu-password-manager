import { useState } from "react";
import { FormInput } from "../userinput/formInput.js";
import Modal from "./modal.js";
import { createVault, getVaults, updateVault } from "../../services/vaultService.js";
import { useVaults } from "../../context/VaultContext.js";
import { useUser } from "../../context/UserContext.js";
import { Setup2FA } from "./2fa/setup2FA.js";
import { Vault } from "../../common/types.js";
import { CustomRequest2FA } from "./2fa/customRequest2FA.js";

interface Props {
	onClose: () => void;
	vault: Vault;
}

export function EditFolder({ onClose, vault }: Props) {
	const { refreshVaults } = useVaults();
	const { user } = useUser();
	const [newFolderName, setNewFolderName] = useState<string>(vault.name);
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(vault.twoFactorEnabled);
	const [setup2FA, setSetup2FA] = useState(false);
	const [requestWith2FA, setRequestWith2FA] = useState(false);

	const onEdit = async (token?: string) => {
		await updateVault(vault.id, newFolderName, twoFactorEnabled, token);
		await getVaults();
		await refreshVaults();
		onClose();
	};

	if (setup2FA) {
		return (
			<Setup2FA
				onClose={() => {
					setSetup2FA(false);
				}}
			/>
		);
	}
	if (requestWith2FA) {
		return (
			<CustomRequest2FA
				onClose={() => {
					setRequestWith2FA(false);
				}}
				onSubmit={onEdit}
				description="WARNING: By turning off 2FA for this folder, all the items in the folder might lose 2FA protection. "
			/>
		);
	}
	return (
		<Modal onClose={onClose}>
			<div className="flex flex-col gap-3 bg-white rounded-xl p-6 w-120 shadow-lg">
				<h2 className="text-lg font-semibold text-gray-800">Edit Folder</h2>
				<FormInput placeholder="Folder name" value={newFolderName} onChange={setNewFolderName} />
				<div className="flex flex-col gap-1">
					<label className="text-xs font-medium text-gray-600">Two Factor Authentication</label>
					{user?.twoFactorEnabled ? (
						<label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-800 border border-gray-200 rounded-md cursor-pointer select-none hover:bg-gray-50 transition-colors">
							<input
								type="checkbox"
								checked={twoFactorEnabled}
								onChange={(e) => {
									setTwoFactorEnabled(e.target.checked);
								}}
								className="w-3.5 h-3.5 accent-gray-800 cursor-pointer"
							/>
							Protect with 2FA
						</label>
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
				<button
					onClick={async () => {
						if (newFolderName !== vault.name || twoFactorEnabled !== vault.twoFactorEnabled) {
							if (!twoFactorEnabled && vault.twoFactorEnabled) {
								setRequestWith2FA(true);
							} else {
								onEdit();
							}
						} else {
							onClose();
						}
					}}
					className="py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
				>
					Update
				</button>
			</div>
		</Modal>
	);
}
