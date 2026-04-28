import { IconType } from "react-icons";

interface IconGhostButtonProps {
	icon: IconType;
	label: string;
	onClick: () => void;
}

export function IconGhostButton({ icon: Icon, label, onClick }: IconGhostButtonProps) {
	return (
		<button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 rounded-lg hover:cursor-pointer hover:text-gray-900">
			<Icon size={15} />
			{label}
		</button>
	);
}
