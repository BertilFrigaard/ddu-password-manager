import { useEffect, useRef, useState } from "react";
import { FiCopy, FiEdit2 } from "react-icons/fi";
import { Vault, VaultItem } from "../../common/types.js";
import { getCredentials } from "../../store/store.js";
import { decryptData } from "../../services/crypto.js";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import Modal from "../modals/modal.js";
import { CreateNewLogin } from "../modals/createNewLogin.js";
import { SearchInput } from "../input/searchInput.js";

interface Props {
	selectVault: Vault | null;
}

export function ViewCredentials({ selectVault }: Props) {
	const [credentials, setCredentials] = useState<null | VaultItem[]>(null);
	const [searchText, setSearchText] = useState("");
	const [showingPassword, setShowingPassword] = useState<null | number>(null);
	const [decryptedPassword, setDecryptedPassword] = useState<null | string>(null);
	const [whileNewLogin, setWhileNewLogin] = useState<boolean>(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [selected, setSelected] = useState<null | VaultItem>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setSelected(null);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const updateCredentials = async () => {
		setCredentials(null);
		const credentials = await getCredentials(selectVault?.id);
		console.log(credentials);
		setCredentials(credentials);
	};

	useEffect(() => {
		updateCredentials();
	}, [selectVault]);

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

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	const copyWebsite = () => {
		if (selected) copyToClipboard(selected.website);
	};

	const copyUsername = () => {
		if (selected) copyToClipboard(selected.username);
	};

	const copyPassword = async () => {
		if (selected) {
			if (selected.twoFactorEnabled) {
				console.error("NOT IMPLEMENTED 2FA REQUIRED");
			} else if (!selected.password) {
				console.error("No password found for not 2FA protected item");
			} else {
				const password = await decryptData(selected.password.encryptedPassword, selected.password.iv, selected.password.authTag);
				copyToClipboard(new TextDecoder().decode(password));
			}
		}
	};
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
											<div className="absolute right-0 top-11 z-10 flex flex-col bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
												<button
													className="px-4 py-2 text-sm text-left hover:bg-gray-100 whitespace-nowrap hover:cursor-pointer"
													onClick={() => {
														copyWebsite();
														setSelected(null);
													}}
												>
													Website
												</button>
												<button
													className="px-4 py-2 text-sm text-left hover:bg-gray-100 whitespace-nowrap hover:cursor-pointer"
													onClick={() => {
														copyUsername();
														setSelected(null);
													}}
												>
													Username
												</button>
												<button
													className="px-4 py-2 text-sm text-left hover:bg-gray-100 whitespace-nowrap hover:cursor-pointer"
													onClick={() => {
														copyPassword();
														setSelected(null);
													}}
												>
													Password
												</button>
											</div>
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
