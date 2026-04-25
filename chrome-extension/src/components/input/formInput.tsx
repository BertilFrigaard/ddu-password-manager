interface Props {
	placeholder: string;
	value: string;
	onChange: (value: string) => void;
	type?: "text" | "password" | "email";
}

export function FormInput({ placeholder, value, onChange, type = "text" }: Props) {
	return (
		<input
			className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400"
			placeholder={placeholder}
			type={type}
			value={value}
			onChange={(e) => onChange(e.target.value)}
		/>
	);
}
