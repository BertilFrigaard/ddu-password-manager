import Modal from "./modal.js";

interface Props {
	onClose: () => void;
}

export function HelpModal({ onClose }: Props) {
	return (
		<Modal title="Help" onClose={onClose}>
			<p>Help here</p>
		</Modal>
	);
}
