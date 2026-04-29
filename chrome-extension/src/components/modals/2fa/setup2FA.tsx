import { useEffect, useState } from "react";
import { FormInput } from "../../userinput/formInput.js";
import Modal from "../modal.js";
import { enableTwoFactorAuthentication, getTwoFactorAuthenticationQRCode } from "../../../services/authService.js";
import { useUser } from "../../../context/UserContext.js";
import LoadingSpinner from "../../info/loadingSpinner.js";

interface Props {
	onClose: () => void;
}

export function Setup2FA({ onClose }: Props) {
	const { user, refreshUser } = useUser();
	const [token, setToken] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [qrCode, setQrCode] = useState<string | null>(null);

	useEffect(() => {
		const fetchCode = async () => {
			setIsLoading(true);
			await new Promise((resolve) => setTimeout(resolve, 0));
			const code = await getTwoFactorAuthenticationQRCode();
			setQrCode(code);
			setIsLoading(false);
		};
		fetchCode();
	}, []);

	const submitToken = async () => {
		setIsLoading(true);

		await new Promise((resolve) => setTimeout(resolve, 0));
		try {
			await enableTwoFactorAuthentication(token);
			await refreshUser();
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		}
		setIsLoading(false);
	};

	if (user?.twoFactorEnabled) {
		return (
			<Modal title="Setup Two Factor Authentication" onClose={onClose}>
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
			</Modal>
		);
	} else {
		return (
			<Modal title="Setup Two Factor Authentication" onClose={onClose} closeOnOutsideClick={false}>
				<ol className="list-disc list-outside pl-5 space-y-2">
					<li>
						Download an Authenticator app on your phone. We recommend <span className="italic">Google Authenticator</span> which you can get for{" "}
						<a className="underline cursor-pointer" href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2">
							Android
						</a>{" "}
						and{" "}
						<a className="underline cursor-pointer" href="https://apps.apple.com/us/app/google-authenticator/id388497605">
							IOS
						</a>
					</li>
					<li>Scan the QR-Code below with your Authenticator app</li>
					<li>Enter the token from your Authenticator app below</li>
					<li>
						Press the <span className="italic">Enable Two Factor Authentication</span> button
					</li>
				</ol>
				<div className="flex flex-col gap-1">{qrCode && <img src={qrCode} />}</div>
				<div>{error && !isLoading && <p className="text-danger">{error}</p>}</div>
				<div>{isLoading && <LoadingSpinner />}</div>
				<div className="flex flex-col gap-1">
					<div className="mb-3">
						<label className="text-xs font-medium text-gray-600">Two-Factor-Authentication Token</label>
						<FormInput placeholder="Token" value={token} onChange={setToken} />
					</div>
					<button
						type="button"
						onClick={() => {
							submitToken();
						}}
						className="btn-primary"
					>
						Enable Two Factor Authentication
					</button>
				</div>
			</Modal>
		);
	}
}
