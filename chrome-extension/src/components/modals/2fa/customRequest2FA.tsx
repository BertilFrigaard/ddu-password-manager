import { useState } from "react";
import { FormInput } from "../../userinput/formInput.js";
import Modal from "../modal.js";
import { useUser } from "../../../context/UserContext.js";
import LoadingSpinner from "../../info/loadingSpinner.js";

interface Props {
	onClose: () => void;
	onSubmit: (token: string) => Promise<void>;
	description: string;
}

export function CustomRequest2FA({ onClose, onSubmit, description }: Props) {
	const { user } = useUser();
	const [token, setToken] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const submitToken = async () => {
		setIsLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 0));
		try {
			await onSubmit(token);
		} catch (e) {
			setError(e instanceof Error ? e.message : String(e));
		}
		setIsLoading(false);
	};

	if (user?.twoFactorEnabled) {
		return (
			<Modal title="Two Factor Authentication" onClose={onClose}>
				<p>{description}</p>
				<div>{error && !isLoading && <p className="text-danger">{error}</p>}</div>
				<div>{isLoading && <LoadingSpinner />}</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs font-medium text-gray-600">Two-Factor-Authentication Token</label>
					<FormInput placeholder="Token" value={token} onChange={setToken} />
					<button
						type="button"
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
