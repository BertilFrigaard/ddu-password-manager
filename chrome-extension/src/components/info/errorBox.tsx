interface Props {
	msg: string;
}

export function ErrorBox({ msg }: Props) {
	return (
		<div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-md px-3 py-2.5 w-full">
			<p className="text-sm text-red-700">{msg}</p>
		</div>
	);
}
