import { useEffect, useRef, useState } from "react";
import { FiCopy, FiEdit2 } from "react-icons/fi";
import { Vault, VaultItem } from "../../common/types.js";
import { decryptData } from "../../services/crypto.js";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { CreateNewLogin } from "../modals/createNewLogin.js";
import { SearchInput } from "../userinput/searchInput.js";
import { LoginCopyDropdown } from "../dropdowns/loginCopyDropdown.js";
import { useVaults } from "../../context/VaultContext.js";
import { selectCredentials } from "../../store/selectors.js";
import { Fetch2FA } from "../modals/2fa/fetch2FA.js";
import { EditLogin } from "../modals/editLogin.js";
import { EditFolder } from "../modals/editFolder.js";

interface Props {
	selectVault: Vault | null;
}

export function ViewCredentials({ selectVault }: Props) {
	const { vaults } = useVaults();
	const [searchText, setSearchText] = useState("");
	const [showingPassword, setShowingPassword] = useState<null | number>(null);
	const [decryptedPassword, setDecryptedPassword] = useState<null | string>(null);
	const [whileNewLogin, setWhileNewLogin] = useState<boolean>(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [selected, setSelected] = useState<null | VaultItem>(null);
	const [requestWith2FA, setRequestWith2FA] = useState(false);
	const [editItem, setEditItem] = useState<VaultItem | null>(null);
	const [whileEditFolder, setWhileEditFolder] = useState(false);

	const credentials = selectCredentials(vaults, selectVault?.id);

	useEffect(() => {
		setDecryptedPassword(null);
		setShowingPassword(null);
	}, [selectVault]);

	const updateDecryptedPassword = async () => {
		if (showingPassword == null) {
			setDecryptedPassword(null);
		} else {
			const item = credentials?.find((v) => v.id == showingPassword);
			if (!item) {
				console.error("Something went wrong, failed to find item to decrypt");
				setDecryptedPassword(null);
				return;
			}
			if (item.twoFactorEnabled) {
				setRequestWith2FA(true);
			} else {
				if (!item.password) {
					console.error("Password is null but 2fa is not enabled");
					return;
				}
				const passwordBytes = await decryptData(item.password.encryptedPassword, item.password.iv, item.password.authTag);
				setDecryptedPassword(new TextDecoder().decode(passwordBytes));
			}
		}
	};

	useEffect(() => {
		updateDecryptedPassword();
	}, [showingPassword]);

	return (
		<div className="px-10 py-5">
			{requestWith2FA && showingPassword && (
				<Fetch2FA
					onClose={() => {
						(setShowingPassword(null), setRequestWith2FA(false));
					}}
					onSuccess={async (password) => {
						const passwordBytes = await decryptData(password.encryptedPassword, password.iv, password.authTag);
						setDecryptedPassword(new TextDecoder().decode(passwordBytes));
						setRequestWith2FA(false);
					}}
					itemId={showingPassword}
				/>
			)}
			{whileEditFolder && selectVault && (
				<EditFolder
					onClose={() => {
						setWhileEditFolder(false);
					}}
					vault={selectVault}
				/>
			)}
			<div className="justify-between flex">
				<h2 className="text-3xl font-semibold mb-5">{selectVault ? selectVault.name : "Your Logins"}</h2>
				<div className="flex gap-5">
					<button
						onClick={() => {
							setWhileNewLogin(true);
						}}
						className="font-semibold flex gap-1 items-center justify-center hover:cursor-pointer h-10 px-3 text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
					>
						<FaPlus />
						New Login
					</button>
					{selectVault && (
						<button
							onClick={() => {
								setWhileEditFolder(true);
							}}
							className="border border-gray-500 font-semibold flex gap-1 items-center justify-center hover:cursor-pointer h-10 px-3 text-gray-800 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
						>
							<FiEdit2 />
							Edit Folder
						</button>
					)}
				</div>
			</div>
			<SearchInput value={searchText} onChange={setSearchText} className="mb-4" />
			<div className="flex flex-col gap-3 w-full">
				{!credentials && <p>Loading...</p>}
				{credentials &&
					credentials
						.filter((v) => v.username?.toLowerCase().includes(searchText.toLowerCase()) || v.website?.toLowerCase().includes(searchText.toLowerCase()))
						.map((item) => (
							<div key={item.id} className="flex w-full justify-between border border-gray-300 rounded-md px-5 py-1">
								<div className="flex flex-col gap-1 py-2">
									<p className="text-lg text-gray-800 font-bold">{item.website}</p>
									<p className="text-base text-gray-600">{item.username}</p>
								</div>
								<div className="flex gap-3 items-center">
									<button
										className="flex items-center justify-center hover:cursor-pointer bg-gray-200 hover:bg-gray-300 rounded h-10 px-3 gap-1"
										onClick={() => {
											if (item.id == showingPassword) {
												setShowingPassword(null);
											} else {
												setShowingPassword(item.id);
											}
										}}
									>
										{showingPassword == item.id ? (
											<>
												<FaRegEyeSlash size={14} />
												Password
											</>
										) : (
											<>
												<FaRegEye size={14} />
												Password
											</>
										)}
									</button>
									{showingPassword == item.id && decryptedPassword && !requestWith2FA && (
										<div className="flex items-center justify-center bg-white rounded h-10 px-3">
											<p>{decryptedPassword}</p>
										</div>
									)}
									<div className="relative" ref={selected?.id === item.id ? dropdownRef : null}>
										<button className="flex items-center justify-center hover:cursor-pointer bg-gray-200 hover:bg-gray-300 rounded h-10 px-3 gap-1" onClick={() => setSelected((prev) => (prev?.id === item.id ? null : item))}>
											<FiCopy size={14} />
											Copy
										</button>
										{selected?.id === item.id && (
											<LoginCopyDropdown
												dropdownRef={dropdownRef}
												item={item}
												onClose={() => {
													setSelected(null);
												}}
												className="top-12"
											/>
										)}
									</div>
									<button
										className="flex items-center justify-center hover:cursor-pointer bg-gray-200 hover:bg-gray-300 rounded h-10 px-3 gap-1"
										onClick={() => {
											setEditItem(item);
										}}
									>
										<FiEdit2 size={14} />
										Edit
									</button>
								</div>
							</div>
						))}{" "}
			</div>
			{whileNewLogin && (
				<CreateNewLogin
					onClose={() => {
						setWhileNewLogin(false);
					}}
				/>
			)}
			{editItem && (
				<EditLogin
					onClose={() => {
						setEditItem(null);
					}}
					vaultItem={editItem}
				/>
			)}
		</div>
	);
}
