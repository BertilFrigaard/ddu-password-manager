import { useEffect, useState } from "react";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { FormInput } from "../userinput/formInput.js";
import { Vault } from "../../common/types.js";
import { logout } from "../../services/authService.js";
import { ViewCredentials } from "./viewCredentials.js";
import Modal from "../modals/modal.js";
import { createVault, getVaults } from "../../services/vaultService.js";
import { useVaults } from "../../context/VaultContext.js";
import { useUser } from "../../context/UserContext.js";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { MdOutlineVpnKey } from "react-icons/md";
import { SettingsModal } from "../modals/settingsModal.js";
import { HelpModal } from "../modals/helpModal.js";
import { CreateFolder } from "../modals/createFolder.js";

export function Unlocked() {
	const { refreshUser } = useUser();
	const { vaults, refreshVaults } = useVaults();
	const [selected, setSelected] = useState<Vault | null>(null);
	const [showNewFolder, setShowNewFolder] = useState(false);
	const [showSettings, setShowSettings] = useState(false);
	const [showHelp, setShowHelp] = useState(false);

	useEffect(() => {
		refreshVaults();
	}, []);

	useEffect(() => {
		setSelected(vaults?.find((v) => v.id === selected?.id) ?? null);
	}, [vaults]);

	return (
		<div className="flex flex-col h-full min-h-screen bg-gray-50">
			<div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
				<div className="flex gap-20">
					<h1 className="text-xl font-bold text-gray-800 tracking-tight">DDU Vault</h1>
					<button
						onClick={async () => {
							setShowSettings(true);
						}}
						className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:cursor-pointer"
					>
						<FiSettings size={15} />
						Settings
					</button>
					<button
						onClick={async () => {
							setShowHelp(true);
						}}
						className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:cursor-pointer"
					>
						<IoIosHelpCircleOutline size={15} />
						Help
					</button>
				</div>
				<button
					onClick={async () => {
						await logout();
						refreshUser();
					}}
					className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:cursor-pointer"
				>
					<FiLogOut size={15} />
					Logout
				</button>
			</div>

			<div className="flex flex-1">
				<aside className="flex flex-col gap-1 p-3 bg-white border-r border-gray-200 w-44 shrink-0">
					<div className="flex items-center space-x-5 px-3 py-2 border-b border-gray-800">
						<h2 className="text-lg font-bold text-gray-700 tracking-wide">Folders</h2>
					</div>
					<div className="flex flex-col flex-1 gap-2 mt-4">
						<button
							onClick={() => {
								setSelected(null);
							}}
							className={(selected === null && "bg-gray-200 ") + " w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors hover:cursor-pointer"}
						>
							Your Logins
						</button>
						{vaults &&
							vaults.map((v) => (
								<button
									onClick={() => {
										setSelected(v);
									}}
									key={v.id}
									className={(v == selected && "bg-gray-200 ") + " w-full text-left px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-gray-100 transition-colors hover:cursor-pointer"}
								>
									{v.name}
								</button>
							))}
						<button
							onClick={() => {
								setShowNewFolder(true);
							}}
							className="w-full py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
						>
							New Folder
						</button>
					</div>
				</aside>

				<div className="flex-1">
					<ViewCredentials selectVault={selected} />
				</div>
			</div>

			{showSettings && (
				<SettingsModal
					onClose={() => {
						setShowSettings(false);
					}}
				/>
			)}

			{showHelp && (
				<HelpModal
					onClose={() => {
						setShowHelp(false);
					}}
				/>
			)}

			{showNewFolder && (
				<CreateFolder
					onClose={() => {
						setShowNewFolder(false);
					}}
				/>
			)}
		</div>
	);
}
