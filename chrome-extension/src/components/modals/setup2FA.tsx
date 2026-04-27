import { useEffect, useState } from "react";
import { FormInput } from "../userinput/formInput.js";
import Modal from "./modal.js";
import { enableTwoFactorAuthentication, getTwoFactorAuthenticationQRCode } from "../../services/authService.js";
import { useUser } from "../../context/UserContext.js";

interface Props {
	onClose: () => void;
}

export function Setup2FA({ onClose }: Props) {
	const { user, refreshUser } = useUser();
	const [token, setToken] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [qrCode, setQrCode] = useState<string | null>(null);

	useEffect(() => {
		const fetchCode = async () => {
			setIsLoading(true);
			const code = await getTwoFactorAuthenticationQRCode();
			setQrCode(code);
			setIsLoading(false);
		};
		fetchCode();
	}, []);

	const submitToken = async () => {
		await enableTwoFactorAuthentication(token);
		await refreshUser();
	};

	if (user?.twoFactorEnabled) {
		<Modal onClose={onClose}>
			<div className="flex flex-col gap-3 bg-white rounded-xl p-6 w-150 shadow-lg">
				<h2 className="text-xl font-semibold text-gray-800">Setup Two-Factor-Authentication</h2>
				<p>A little about 2FA</p>
				<div className="flex flex-col gap-1">
					<label className="text-xs font-medium text-gray-600">Two-Factor-Authentication is now setup</label>
					<button
						type="button"
						onClick={() => {
							onClose();
						}}
						className="shrink-0 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
					>
						Close
					</button>
				</div>
			</div>
		</Modal>;
	} else {
		return (
			<Modal onClose={() => {}}>
				<div className="flex flex-col gap-3 bg-white rounded-xl p-6 w-150 shadow-lg">
					<h2 className="text-xl font-semibold text-gray-800">Setup Two-Factor-Authentication</h2>
					<p>A little about 2FA</p>
					<div className="flex flex-col gap-1">{isLoading ? <p>Loading...</p> : qrCode && <img src={qrCode} />}</div>
					<div className="flex flex-col gap-1">
						<label className="text-xs font-medium text-gray-600">Two-Factor-Authentication Token</label>
						<FormInput placeholder="Token" value={token} onChange={setToken} />
						<button
							type="button"
							onClick={() => {
								submitToken();
							}}
							className="shrink-0 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
						>
							Enable Two-Factor-Authentication
						</button>
						<button
							type="button"
							onClick={() => {
								onClose();
							}}
							className="shrink-0 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
						>
							Cancel
						</button>
					</div>
				</div>
			</Modal>
		);
	}
}
