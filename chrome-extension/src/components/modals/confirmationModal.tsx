import Modal from "./modal.js";

interface Props {
	onClose: () => void;
	title: string;
	text: string;
	onSubmit: () => Promise<void> | void;
}

export function ConfirmationModal({ onClose, onSubmit, title, text }: Props) {
	return (
		<Modal title={title} onClose={onClose}>
			<p>{text}</p>
			<div className="flex gap-3">
				<button onClick={onSubmit} className="btn-primary px-3">
					Confirm
				</button>
				<button onClick={onClose} className="btn-secondary px-3">
					Cancel
				</button>
			</div>
		</Modal>
	);
}
