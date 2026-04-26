import { useEffect, useRef, useState } from "react";
import { FiCopy, FiEdit2, FiExternalLink, FiLogOut, FiRefreshCw } from "react-icons/fi";
import { SearchInput } from "../userinput/searchInput.js";
import { logout } from "../../services/authService.js";
import { getCredentials } from "../../store/store.js";
import { VaultItem } from "../../common/types.js";
import { decryptData } from "../../services/crypto.js";
import { LoginCopyDropdown } from "../dropdowns/loginCopyDropdown.js";
import { useUser } from "../../context/UserContext.js";
import { useVaults } from "../../context/VaultContext.js";
import { selectCredentials } from "../../store/selectors.js";

export function PopupUnlocked() {
	const { refreshUser } = useUser();
	const { vaults, refreshVaults } = useVaults();
	const [searchText, setSearchText] = useState("");
	const dropdownRef = useRef<HTMLDivElement>(null);
	const [selected, setSelected] = useState<null | VaultItem>(null);

	const credentials = selectCredentials(vaults);

	const onWebapp = async () => {
		chrome.tabs.create({ url: chrome.runtime.getURL("public/mainpage.html") });
		document.close();
	};

	const onEditCredential = async (id: number) => {
		chrome.tabs.create({ url: chrome.runtime.getURL("public/mainpage.html?openView=edit&credentialId=" + id) });
		document.close();
	};

	return (
		<div className="flex flex-col items-center justify-center w-80 min-h-90 max-h-110 px-6 py-3 bg-white">
			<div className="flex items-center justify-between w-full mb-3">
				<h1 className="text-2xl font-bold text-gray-800">Vault</h1>
				<button
					className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
					onClick={async () => {
						await logout();
						refreshUser();
					}}
				>
					<FiLogOut size={14} />
					Logout
				</button>
			</div>
			<SearchInput value={searchText} onChange={setSearchText} className="mb-4" />
			<div className="flex flex-1 flex-col gap-3 w-full overflow-y-scroll">
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
			<div className="mt-5 flex justify-between w-full">
				<button onClick={onWebapp} className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center gap-1">
					<FiExternalLink size={12} />
					Open web app
				</button>
				<button
					className="flex items-center gap-1 hover:cursor-pointer"
					onClick={() => {
						// TODO: Get updates from server
						refreshVaults();
					}}
				>
					<FiRefreshCw size={14} />
					Refresh
				</button>
			</div>
		</div>
	);
}
