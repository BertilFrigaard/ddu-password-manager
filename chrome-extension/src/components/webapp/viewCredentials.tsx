import { useEffect, useState } from "react";
import { FiCopy, FiEdit2, FiSearch } from "react-icons/fi";
import { VaultItem } from "../../common/types.js";
import { getCredentials } from "../../store/store.js";
import { decryptData } from "../../services/crypto.js";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";

interface Props {
	selectVault: number | null;
}

export function ViewCredentials({ selectVault }: Props) {
	const [credentials, setCredentials] = useState<null | VaultItem[]>(null);
	const [searchText, setSearchText] = useState("");
	const [selected, setSelected] = useState<null | VaultItem>(null);
	const [showingPassword, setShowingPassword] = useState<null | number>(null);
	const [decryptedPassword, setDecryptedPassword] = useState<null | string>(null);

	const updateCredentials = async () => {
		setCredentials(null);
		const credentials = await getCredentials(selectVault);
		setCredentials(credentials);
	};

	useEffect(() => {
		updateCredentials();
	}, []);

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
			<h2 className="text-3xl font-semibold mb-5">Your Logins</h2>
			<div className="relative w-full mb-4">
				<FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
				<input
					onChange={(e) => {
						setSearchText(e.target.value);
					}}
					type="text"
					placeholder="Search..."
					className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-gray-500"
				/>
			</div>
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
									<button
										className="flex items-center justify-center hover:cursor-pointer bg-gray-200 hover:bg-gray-300 rounded h-10 px-3 gap-1"
										onClick={() => {
											setSelected(item);
										}}
									>
										<FiCopy size={14} />
										Copy
									</button>
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
		</div>
	);
}
