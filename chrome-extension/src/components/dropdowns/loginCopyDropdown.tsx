import { RefObject, useEffect, useRef, useState } from "react";
import { VaultItem } from "../../common/types.js";
import { decryptData } from "../../services/crypto.js";
import { Fetch2FA } from "../modals/fetch2FA.js";

interface Props {
	item: VaultItem;
	onClose: () => void;
	dropdownRef: RefObject<HTMLDivElement | null>;
	className?: string;
}

export function LoginCopyDropdown({ dropdownRef, item, onClose, className = "" }: Props) {
	const [requestWith2FA, setRequestWith2FA] = useState(false);
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (copied) {
			const timer = setTimeout(() => onClose(), 1000);
			return () => clearTimeout(timer);
		}
	}, [copied]);

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
		setCopied(true);
	};

	const copyUsername = () => {
		copyToClipboard(item.username);
		setCopied(true);
	};

	const copyPassword = async () => {
		if (item.twoFactorEnabled) {
			setRequestWith2FA(true);
		} else if (!item.password) {
			// Should not happen but should still be handled
			console.error("No password found for not 2FA protected item");
		} else {
			const password = await decryptData(item.password.encryptedPassword, item.password.iv, item.password.authTag);
			copyToClipboard(new TextDecoder().decode(password));
			setCopied(true);
		}
	};

	if (requestWith2FA) {
		return (
			<Fetch2FA
				onClose={() => {
					setRequestWith2FA(false);
				}}
				itemId={item.id}
				onSuccess={async (password) => {
					setRequestWith2FA(false);
					const pass = await decryptData(password.encryptedPassword, password.iv, password.authTag);
					copyToClipboard(new TextDecoder().decode(pass));
					setCopied(true);
				}}
			/>
		);
	}

	if (copied) {
		return (
			<div className={`absolute right-0 z-10 flex flex-col bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden ${className}`} ref={dropdownRef}>
				<p className="px-4 py-2 text-sm text-left">Copied</p>
			</div>
		);
	}

	return (
		<div className={`absolute right-0 z-10 flex flex-col bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden ${className}`} ref={dropdownRef}>
			<button
				className="px-4 py-2 text-sm text-left hover:bg-gray-100 whitespace-nowrap hover:cursor-pointer"
				onClick={() => {
					copyWebsite();
				}}
			>
				Website
			</button>
			<button
				className="px-4 py-2 text-sm text-left hover:bg-gray-100 whitespace-nowrap hover:cursor-pointer"
				onClick={() => {
					copyUsername();
				}}
			>
				Username
			</button>
			<button
				className="px-4 py-2 text-sm text-left hover:bg-gray-100 whitespace-nowrap hover:cursor-pointer"
				onClick={() => {
					copyPassword();
				}}
			>
				Password
			</button>
		</div>
	);
}
