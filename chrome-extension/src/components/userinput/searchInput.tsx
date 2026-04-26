interface Props {
	placeholder?: string;
	value: string;
	onChange: (value: string) => void;
	className?: string;
}

export function SearchInput({ placeholder = "Search...", value, onChange, className }: Props) {
	return (
		<div className={`relative w-full ${className ? ` ${className}` : ""}`}>
			<svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
				<circle cx="11" cy="11" r="8" />
				<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
			</svg>
			<input
				className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-md outline-none focus:border-gray-400 transition-colors placeholder:text-gray-400"
				placeholder={placeholder}
				type="text"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
		</div>
	);
}
