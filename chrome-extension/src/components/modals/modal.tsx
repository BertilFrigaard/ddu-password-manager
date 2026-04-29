import React from "react";
import { FaCross } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { IoClose } from "react-icons/io5";

interface ModalProps {
	onClose: () => void;
	children: React.ReactNode;
	title: string;
	closeOnOutsideClick?: boolean;
	size?: string;
}

export default function Modal({ onClose, children, title, closeOnOutsideClick = true, size = "text-xl" }: ModalProps) {
	return (
		<div
			className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
			onClick={() => {
				closeOnOutsideClick && onClose();
			}}
		>
			<div onClick={(e) => e.stopPropagation()} className="flex flex-col gap-3 bg-white rounded-xl p-6 w-160 shadow-lg mx-5 max-h-[calc(100vh-2rem)] overflow-y-auto">
				<div className="flex justify-between items-center">
					<h2 className={"font-semibold text-gray-800 " + size}>{title}</h2>
					<button className="btn hover:scale-115" onClick={onClose}>
						<IoMdClose size={20} />
					</button>
				</div>
				{children}
			</div>
		</div>
	);
}
