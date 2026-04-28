import { useEffect, useState } from "react";
import Modal from "./modal.js";
import { FormInput } from "../userinput/formInput.js";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { PasswordGenerator } from "../userinput/passwordGenerator.js";
import { updateCredential } from "../../services/credentialService.js";
import { useVaults } from "../../context/VaultContext.js";
import { useUser } from "../../context/UserContext.js";
import { getVaults } from "../../services/vaultService.js";
import { Setup2FA } from "./2fa/setup2FA.js";
import { VaultItem } from "../../common/types.js";
import { decryptData } from "../../services/crypto.js";
import { Fetch2FA } from "./2fa/fetch2FA.js";
import { CustomRequest2FA } from "./2fa/customRequest2FA.js";

interface Props {
	onClose: () => void;
	vaultItem: VaultItem;
}

export function EditLogin({ onClose, vaultItem }: Props) {
	const { vaults, refreshVaults } = useVaults();
	const sourceVault = vaults?.find((v) => v.items.some((item) => item.id === vaultItem.id));

	const { user } = useUser();
	const [website, setWebsite] = useState(vaultItem.website);
	const [username, setUsername] = useState(vaultItem.username);
	const [originalPassword, setOriginalPassword] = useState("");
	const [password, setPassword] = useState("");
	const [vaultId, setVaultId] = useState<number>(sourceVault?.id ?? user?.defaultVault ?? vaults?.[0]?.id ?? 0);
	const vault = vaults?.find((v) => v.id == vaultId);

	const [showPassword, setShowPassword] = useState(false);
	const [showGenerator, setShowGenerator] = useState(false);
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(vaultItem.twoFactorEnabled);
	const [setup2FA, setSetup2FA] = useState(false);
	const [requestWith2FA, setRequestWith2FA] = useState<"none" | "password" | "update">("none");

	useEffect(() => {
		const loadPassword = async (encryptedPassword: string, iv: string, authTag: string) => {
			const decrypted = await decryptData(encryptedPassword, iv, authTag);
			const p = new TextDecoder().decode(decrypted);
			setPassword(p);
			setOriginalPassword(p);
		};
		if (vaultItem.twoFactorEnabled) {
			setRequestWith2FA("password");
		} else {
			const pass = vaultItem.password;
			if (!pass) {
				return;
			}
			loadPassword(pass.encryptedPassword, pass.iv, pass.authTag);
		}
	}, [vaultItem]);

	const onUpdate = async (token?: string | undefined) => {
		try {
			await updateCredential(vaultItem.id, website, username, twoFactorEnabled, vaultId === sourceVault?.id ? undefined : vaultId, originalPassword === password ? undefined : password, token);
			await getVaults();
			await refreshVaults();
		} catch (e) {
			console.error(e);
		}
		onClose();
	};

	if (requestWith2FA === "password") {
		return (
			<Fetch2FA
				onClose={onClose}
				onSuccess={async (pass) => {
					const decrypted = await decryptData(pass.encryptedPassword, pass.iv, pass.authTag);
					setPassword(new TextDecoder().decode(decrypted));
					setRequestWith2FA("none");
				}}
				itemId={vaultItem.id}
			/>
		);
	} else if (requestWith2FA === "update") {
		return (
			<CustomRequest2FA
				onClose={() => {
					setRequestWith2FA("none");
				}}
				onSubmit={async (token) => {
					await onUpdate(token);
				}}
				description="This is a critical update. You will need to enter your 2FA token to confirm this."
			/>
		);
	}

	if (setup2FA) {
		return <Setup2FA onClose={onClose} />;
	} else {
		return (
			<Modal onClose={onClose}>
				<div className="flex flex-col gap-3 bg-white rounded-xl p-6 w-150 shadow-lg">
					<h2 className="text-xl font-semibold text-gray-800">Edit Login</h2>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Website URL</label>
						<FormInput placeholder="https://example.com" value={website} onChange={setWebsite} />
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Username</label>
						<FormInput placeholder="Username / Email" value={username} onChange={setUsername} />
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Password</label>
						<div className="flex gap-2 items-center">
							<div className="relative flex-1">
								<FormInput placeholder="Password" type={showPassword ? "text" : "password"} value={password} onChange={setPassword} />
								<button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 hover:cursor-pointer" onClick={() => setShowPassword((v) => !v)}>
									{showPassword ? <FaRegEyeSlash size={14} /> : <FaRegEye size={14} />}
								</button>
							</div>
							<button
								type="button"
								onClick={() => {
									setShowGenerator((v) => !v);
								}}
								className="shrink-0 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
							>
								Generate
							</button>
						</div>
						{showGenerator && <PasswordGenerator setPassword={setPassword} />}
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Folder</label>
						<select
							value={vaultId}
							onChange={(e) => {
								setVaultId(Number(e.target.value));
							}}
							name=""
							id=""
							className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-gray-400 transition-colors text-gray-800 bg-white"
						>
							{vaults &&
								vaults.map((v) => (
									<option key={v.id} value={v.id}>
										{v.name}
									</option>
								))}
						</select>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Two Factor Authentication</label>
						{vault?.twoFactorEnabled ? (
							<div className="flex items-center gap-2">
								<span className="px-3 py-2 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md">Two-Factor Authentication is enabled on folder</span>
							</div>
						) : user?.twoFactorEnabled ? (
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
						onClick={() => {
							if ((vaultItem.twoFactorEnabled && !twoFactorEnabled) || (sourceVault?.twoFactorEnabled && !vault?.twoFactorEnabled)) {
								setRequestWith2FA("update");
							} else {
								onUpdate();
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
}
