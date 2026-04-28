import { useEffect, useState } from "react";
import { FormInput } from "../userinput/formInput.js";
import Modal from "./modal.js";
import { useUser } from "../../context/UserContext.js";

interface Props {
	onClose: () => void;
	onSubmit: (token: string) => Promise<void>;
	description: string;
}

export function CustomRequest2FA({ onClose, onSubmit, description }: Props) {
	const { user } = useUser();
	const [token, setToken] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const submitToken = async () => {
		setIsLoading(true);
		await onSubmit(token);
		setIsLoading(false);
	};

	if (user?.twoFactorEnabled) {
		return (
			<Modal onClose={onClose}>
				<div className="flex flex-col gap-3 bg-white rounded-xl p-6 max-w-150 mx-3 shadow-lg">
					<h2 className="text-xl font-semibold text-gray-800">Two-Factor-Authentication</h2>
					<p>{description}</p>
					{isLoading ? (
						<p>Loading...</p>
					) : (
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
								Confirm
							</button>
						</div>
					)}
				</div>
			</Modal>
		);
	} else {
		onClose();
		return <></>;
	}
}
