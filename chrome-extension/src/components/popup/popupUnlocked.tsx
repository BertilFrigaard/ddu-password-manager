import { useEffect, useRef, useState } from "react";
import { FiCopy, FiEdit2, FiExternalLink, FiLogOut, FiRefreshCw } from "react-icons/fi";
import { SearchInput } from "../userinput/searchInput.js";
import { logout } from "../../services/authService.js";
import { getCredentials } from "../../store/store.js";
import { ItemPassword, VaultItem } from "../../common/types.js";
import { decryptData } from "../../services/crypto.js";
import { LoginCopyDropdown } from "../dropdowns/loginCopyDropdown.js";
import { useUser } from "../../context/UserContext.js";
import { useVaults } from "../../context/VaultContext.js";
import { selectCredentials } from "../../store/selectors.js";
import { FaFill } from "react-icons/fa";
import { CustomRequest2FA } from "../modals/2fa/customRequest2FA.js";
import { Fetch2FA } from "../modals/2fa/fetch2FA.js";
import { FaPlus } from "react-icons/fa6";
import { IconGhostButton } from "../userinput/buttons/iconGhostButton.js";

export function PopupUnlocked() {
	const { refreshUser } = useUser();
	const { vaults, refreshVaults } = useVaults();
	const [searchText, setSearchText] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [selected, setSelected] = useState<null | VaultItem>(null);
	const [suggestions, setSuggestions] = useState<VaultItem[]>([]);
	const [autofill2FA, setAutofill2FA] = useState<VaultItem | null>(null);

	const credentials = selectCredentials(vaults);

	const onWebapp = () => {
		chrome.tabs.create({ url: chrome.runtime.getURL("public/mainpage.html") });
		window.close();
	};

	const onEditCredential = (id: number) => {
		chrome.tabs.create({ url: chrome.runtime.getURL("public/mainpage.html?openView=edit&credentialId=" + id) });
		window.close();
	};

	const onNewCredential = () => {
		chrome.tabs.create({ url: chrome.runtime.getURL("public/mainpage.html?openView=new") });
		window.close();
	};

	const autofill = async (username: string, password: ItemPassword) => {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		if (!tab.id) return;
		await chrome.tabs.sendMessage(tab.id, {
			type: "AUTOFILL",
			tabId: tab.id,
			username: username,
			password: new TextDecoder().decode(await decryptData(password.encryptedPassword, password.iv, password.authTag)),
		});
		window.close();
	};

	useEffect(() => {
		const checkTab = async () => {
			const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
			if (!tab.url) return;

			let currentHost: string;
			try {
				currentHost = new URL(tab.url).hostname;
			} catch {
				return;
			}

			const matching = credentials.filter((c) => {
				try {
					return c.website && new URL(c.website).hostname === currentHost;
				} catch {
					return false;
				}
			});

			setSuggestions(matching);
		};
		checkTab();
	}, [credentials]);

	return (
		<div className="flex flex-col items-center justify-center w-80 min-h-90 max-h-110 px-6 py-3 bg-white">
			{autofill2FA && (
				<Fetch2FA
					itemId={autofill2FA.id}
					onClose={() => {
						setAutofill2FA(null);
					}}
					onSuccess={async (password) => {
						await autofill(autofill2FA.username, password);
					}}
				/>
			)}
			<div className="flex items-center justify-between w-full mb-3">
				<h1 className="text-2xl font-bold text-gray-800">Vault</h1>
				<IconGhostButton
					label="Logout"
					onClick={async () => {
						await logout();
						refreshUser();
					}}
					icon={FiLogOut}
				/>
			</div>
			<SearchInput value={searchText} onChange={setSearchText} className="mb-4" />
			{suggestions &&
				!searchText &&
				suggestions.length > 0 &&
				suggestions.map((item) => (
					<div className="flex flex-1 flex-col gap-3 w-full overflow-y-scroll mb-4">
						<div key={item.id} className="flex gap-3 w-full justify-between border border-gray-300 rounded-md px-3 py-1">
							<div className="min-w-0 overflow-hidden">
								<p className="text-sm text-gray-800 font-semibold truncate">{item.website}</p>
								<p className="text-sm text-gray-600 truncate">{item.username}</p>
							</div>
							<div className="relative items-center my-auto" ref={selected?.id === item.id ? dropdownRef : null}>
								<button
									onClick={async () => {
										if (item.twoFactorEnabled) {
											setAutofill2FA(item);
										} else {
											if (!item.password) {
												console.error("item password not set for non 2FA item, should not happen");
												return;
											}
											await autofill(item.username, item.password);
										}
									}}
									className="flex gap-1 hover:cursor-pointer"
								>
									<FaFill size={14} />
									Autofill
								</button>
							</div>
						</div>
					</div>
				))}
			<div className="flex flex-1 flex-col gap-3 w-full overflow-y-auto">
				{!credentials && <p className="m-auto text-sm text-gray-400 italic text-center py-4">Loading...</p>}
				{credentials && credentials.length <= 0 && <p className="m-auto text-sm text-gray-400 italic text-center py-4">No logins yet</p>}
				{credentials &&
					credentials.length > 0 &&
					credentials
						.filter((v) => v.username?.toLowerCase().includes(searchText.toLowerCase()) || v.website?.toLowerCase().includes(searchText.toLowerCase()))
						.map((item) => (
							<div key={item.id} className="flex gap-2 w-full justify-between border border-gray-300 rounded-md px-3 py-1">
								<div className="min-w-0 overflow-hidden">
									<p className="text-sm text-gray-800 font-semibold truncate">{item.website}</p>
									<p className="text-sm text-gray-600 truncate">{item.username}</p>
								</div>
								<div className="flex gap-3">
									<div className="relative items-center my-auto" ref={selected?.id === item.id ? dropdownRef : null}>
										<button
											onClick={() => {
												setSelected((v) => (v == item ? null : item));
											}}
											className="flex gap-1 hover:cursor-pointer"
										>
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
											/>
										)}
									</div>
									<button
										className="flex items-center gap-1 hover:cursor-pointer"
										onClick={() => {
											onEditCredential(item.id);
										}}
									>
										<FiEdit2 size={14} />
										Edit
									</button>
								</div>
							</div>
						))}
			</div>
			<div className="mt-2 flex justify-between w-full">
				<IconGhostButton
					label="Open App"
					onClick={() => {
						onNewCredential();
					}}
					icon={FiExternalLink}
				/>
				<IconGhostButton
					label="New Login"
					onClick={() => {
						onNewCredential();
					}}
					icon={FaPlus}
				/>
			</div>
		</div>
	);
}
