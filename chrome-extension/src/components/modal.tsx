import React from "react";

interface ModalProps {
	onClose: () => void;
	children: React.ReactNode;
}

export default function Modal({ onClose, children }: ModalProps) {
	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
			<div onClick={(e) => e.stopPropagation()}>{children}</div>
		</div>
	);
}
