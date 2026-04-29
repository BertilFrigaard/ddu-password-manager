import { useEffect, useState } from "react";
import { FormInput } from "../../userinput/formInput.js";
import Modal from "../modal.js";
import { useUser } from "../../../context/UserContext.js";
import { getCredentialWithTwoFactorAuthentication } from "../../../services/credentialService.js";
import { ItemPassword } from "../../../common/types.js";
import LoadingSpinner from "../../info/loadingSpinner.js";

interface Props {
	onClose: () => void;
	itemId: number;
	onSuccess: (password: ItemPassword) => void;
}

export function Fetch2FA({ onClose, onSuccess, itemId }: Props) {
	const { user } = useUser();
	const [token, setToken] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const submitToken = async () => {
		setLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 0));
		try {
			onSuccess(await getCredentialWithTwoFactorAuthentication(itemId, token));
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		}
		setLoading(false);
	};

	if (user?.twoFactorEnabled) {
		return (
			<Modal title="Two Factor Authentication" onClose={onClose}>
				<p>This login is protected by Two Factor Authentication. Please enter the token from your authenticator app and confirm.</p>
				<div className="flex flex-col gap-1">
					<label className="text-xs font-medium text-gray-600">Two-Factor-Authentication Token</label>
					<FormInput placeholder="Token" value={token} onChange={setToken} />
					<div>{loading && <LoadingSpinner />}</div>
					{error && !loading && <p className="text-danger">{error}</p>}
					<button
						type="button"
						disabled={loading}
						onClick={() => {
							submitToken();
						}}
						className="btn-primary"
					>
						Confirm
					</button>
				</div>
			</Modal>
		);
	} else {
		onClose();
		return <></>;
	}
}
