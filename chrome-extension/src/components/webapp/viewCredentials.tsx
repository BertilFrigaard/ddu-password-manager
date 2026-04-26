import { useEffect, useRef, useState } from "react";
import { FiCopy, FiEdit2 } from "react-icons/fi";
import { Vault, VaultItem } from "../../common/types.js";
import { getCredentials } from "../../store/store.js";
import { decryptData } from "../../services/crypto.js";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import Modal from "../modals/modal.js";
import { CreateNewLogin } from "../modals/createNewLogin.js";
import { SearchInput } from "../userinput/searchInput.js";
import { LoginCopyDropdown } from "../dropdowns/loginCopyDropdown.js";
import { useVaults } from "../../context/VaultContext.js";
import { selectCredentials } from "../../store/selectors.js";

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

	const credentials = selectCredentials(vaults, selectVault?.id);

	const updateDecryptedPassword = async () => {
		if (showingPassword == null) {
			setDecryptedPassword(null);
		} else {
			const password = credentials?.find((v) => v.id == showingPassword)?.password;
			if (!password) {
				console.error("Something went wrong, failed to find item to decrypt");
				setDecryptedPassword(null);
				return;
			}
			const passwordBytes = await decryptData(password.encryptedPassword, password.iv, password.authTag);
			setDecryptedPassword(new TextDecoder().decode(passwordBytes));
		}
	};

	useEffect(() => {
		updateDecryptedPassword();
	}, [showingPassword]);

	const onEditCredential = async (id: number) => {};

	return (
		<div className="px-10 py-5">
			<div className="justify-between flex">
				<h2 className="text-3xl font-semibold mb-5">{selectVault ? selectVault.name : "Your Logins"}</h2>
				<button
					onClick={() => {
						setWhileNewLogin(true);
					}}
					className="font-semibold flex gap-1 items-center justify-center hover:cursor-pointer h-10 px-3 text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer"
				>
					<FaPlus />
					New Login
				</button>
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
											if (item.twoFactorEnabled) {
												console.error("NOT IMPLEMENTED 2FA yet");
											} else {
												setShowingPassword((id) => {
													return id == item.id ? null : item.id;
												});
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
									{showingPassword == item.id && decryptedPassword && (
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
											onEditCredential(item.id);
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
		</div>
	);
}
