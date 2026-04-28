import { ReactNode } from "react";
import Modal from "./modal.js";

interface Props {
	onClose: () => void;
	title: string;
	children: ReactNode;
	onSubmit: () => Promise<void> | void;
}

export function ConfirmationModal({ onClose, onSubmit, title, children }: Props) {
	return (
		<Modal title={title} onClose={onClose}>
			{children}
			<div className="flex gap-3">
				<button onClick={onSubmit} className="btn-primary px-3 w-full">
					Confirm
				</button>
				<button onClick={onClose} className="btn-secondary px-3 w-full">
					Cancel
				</button>
			</div>
		</Modal>
	);
}
