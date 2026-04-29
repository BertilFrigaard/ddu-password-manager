import Modal from "./modal.js";

interface Props {
	onClose: () => void;
}

const tips = [
	{
		title: "Use Strong Passwords",
		color: "bg-blue-50 border-blue-200",
		titleColor: "text-blue-800",
		items: ["Use our password generator", "Make passwords at least 15 characters", "Include symbols, letters, and numbers", "Never use personal information"],
	},
	{
		title: "Enable Two Factor Authentication",
		color: "bg-green-50 border-green-200",
		titleColor: "text-green-800",
		items: ["Enable 2FA in the settings", "Add 2FA to your most sensitive accounts", "Use with folders for organization"],
	},
	{
		title: "Organise with Folders",
		color: "bg-purple-50 border-purple-200",
		titleColor: "text-purple-800",
		items: ["Group related logins in folders", "Use folders for work vs. personal", "Rename folders to stay organised", "Enable 2FA on entire folders"],
	},
	{
		title: "Keep Your Account Safe",
		color: "bg-amber-50 border-amber-200",
		titleColor: "text-amber-800",
		items: ["Use a strong master password", "Don't share your master password", "Log out on shared computers"],
	},
];

export function TipsModal({ onClose }: Props) {
	return (
		<Modal title="Tips" onClose={onClose} size="text-2xl">
			<div className="grid grid-cols-2 gap-4">
				{tips.map((tip) => (
					<div key={tip.title} className={`flex flex-col gap-3 rounded-lg border p-5 ${tip.color}`}>
						<h2 className={`font-semibold text-base ${tip.titleColor}`}>{tip.title}</h2>
						<ul className="text-sm text-gray-600 list-disc ml-4 space-y-1">
							{tip.items.map((item) => (
								<li key={item}>{item}</li>
							))}
						</ul>
					</div>
				))}
			</div>
		</Modal>
	);
}
