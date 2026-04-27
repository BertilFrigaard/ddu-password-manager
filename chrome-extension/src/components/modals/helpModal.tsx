import Modal from "./modal.js";

interface Props {
	onClose: () => void;
}

export function HelpModal({ onClose }: Props) {
	return (
		<Modal onClose={onClose}>
			<div className="flex flex-col gap-3 bg-white rounded-xl p-6 w-150 shadow-lg">
				<h2 className="text-xl font-semibold text-gray-800">Help</h2>
			</div>
		</Modal>
	);
}
