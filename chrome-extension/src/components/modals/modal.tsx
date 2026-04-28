import React from "react";

interface ModalProps {
	onClose: () => void;
	children: React.ReactNode;
	title: string;
}

export default function Modal({ onClose, children, title }: ModalProps) {
	return (
		<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
			<div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-3 bg-white rounded-xl p-6 w-120 shadow-lg mx-5">
				<h2 className="text-lg font-semibold text-gray-800">{title}</h2>
				{children}
			</div>
		</div>
	);
}
