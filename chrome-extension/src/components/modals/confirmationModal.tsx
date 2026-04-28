import Modal from "./modal.js";

interface Props {
	onClose: () => void;
	title: string;
	text: string;
	onSubmit: () => Promise<void> | void;
}

export function ConfirmationModal({ onClose, onSubmit, title, text }: Props) {
	return (
		<Modal onClose={onClose}>
			<div className="flex flex-col gap-3 bg-white rounded-xl p-6 w-150 shadow-lg">
				<h2 className="text-xl font-semibold text-gray-800">{title}</h2>
				<p>{text}</p>
				<div className="flex gap-3">
					<button onClick={onSubmit} className="py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
						Confirm
					</button>
					<button onClick={onClose} className="py-2 text-sm font-medium text-white bg-gray-800 rounded-md hover:bg-gray-700 transition-colors cursor-pointer">
						Cancel
					</button>
				</div>
			</div>
		</Modal>
	);
}
