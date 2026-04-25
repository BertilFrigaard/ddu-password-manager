import { RefObject, useEffect, useRef } from "react";
import { VaultItem } from "../../common/types.js";
import { decryptData } from "../../services/crypto.js";

interface Props {
	item: VaultItem;
	onClose: () => void;
	dropdownRef: RefObject<HTMLDivElement | null>;
	className?: string;
}

export function LoginCopyDropdown({ dropdownRef, item, onClose, className = "" }: Props) {
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				onClose();
			}
		};
		document.addEventListener("mouseup", handleClickOutside);
		// Once PopupUnlocked is not rendered anymore, remove the listener
		return () => document.removeEventListener("mouseup", handleClickOutside);
	}, []);

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
	};

	const copyWebsite = () => {
		copyToClipboard(item.website);
	};

	const copyUsername = () => {
		copyToClipboard(item.username);
	};

	const copyPassword = async () => {
		if (item.twoFactorEnabled) {
			console.error("NOT IMPLEMENTED 2FA REQUIRED");
		} else if (!item.password) {
			// Should not happen but should still be handled
			console.error("No password found for not 2FA protected item");
		} else {
			const password = await decryptData(item.password.encryptedPassword, item.password.iv, item.password.authTag);
			copyToClipboard(new TextDecoder().decode(password));
		}
	};

	return (
		<div className={`absolute right-0 z-10 flex flex-col bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden ${className}`} ref={dropdownRef}>
			<button
				className="px-4 py-2 text-sm text-left hover:bg-gray-100 whitespace-nowrap hover:cursor-pointer"
				onClick={() => {
					copyWebsite();
					onClose();
				}}
			>
				Website
			</button>
			<button
				className="px-4 py-2 text-sm text-left hover:bg-gray-100 whitespace-nowrap hover:cursor-pointer"
				onClick={() => {
					copyUsername();
					onClose();
				}}
			>
				Username
			</button>
			<button
				className="px-4 py-2 text-sm text-left hover:bg-gray-100 whitespace-nowrap hover:cursor-pointer"
				onClick={() => {
					copyPassword();
					onClose();
				}}
			>
				Password
			</button>
		</div>
	);
}
