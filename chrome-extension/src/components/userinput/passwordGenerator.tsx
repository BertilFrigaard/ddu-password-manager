import { useEffect, useState } from "react";

const LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";

function generatePassword(length: number, useLetters: boolean, useNumbers: boolean, useSymbols: boolean): string {
	let charset: string = "";
	if (useLetters) charset += LETTERS;
	if (useNumbers) charset += NUMBERS;
	if (useSymbols) charset += SYMBOLS;
	if (!charset) return "";
	const bytes = crypto.getRandomValues(new Uint8Array(length));
	return Array.from(bytes)
		.map((b) => charset[b % charset.length])
		.join("");
}

interface Props {
	setPassword: (password: string) => void;
}

export function PasswordGenerator({ setPassword }: Props) {
	const [passwordLength, setPasswordLength] = useState(20);
	const [includeNumbers, setIncludeNumbers] = useState(true);
	const [includeLetters, setIncludeLetters] = useState(true);
	const [includeSymbols, setIncludeSymbols] = useState(false);

	useEffect(() => {
		setPassword(generatePassword(passwordLength, includeLetters, includeNumbers, includeSymbols));
	}, []);

	return (
		<div className="p-3 border border-gray-200 rounded-md bg-gray-50 flex flex-col gap-3">
			<div className="flex flex-col gap-1">
				<div className="flex justify-between items-center">
					<label className="text-xs font-medium text-gray-600">Length</label>
					<span className="text-xs font-mono text-gray-700 bg-white border border-gray-200 rounded px-1.5 py-0.5 min-w-8 text-center">{passwordLength}</span>
				</div>
				<input
					type="range"
					min={4}
					max={30}
					value={passwordLength}
					onChange={(e) => {
						const newLen = Number(e.target.value);
						setPasswordLength(newLen);
						setPassword(generatePassword(newLen, includeLetters, includeNumbers, includeSymbols));
					}}
					className="w-full accent-gray-800 cursor-pointer"
				/>
			</div>
			<div className="flex gap-4">
				<label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
					<input
						type="checkbox"
						checked={includeLetters}
						onChange={(e) => {
							const val = e.target.checked;
							setIncludeLetters(val);
							setPassword(generatePassword(passwordLength, val, includeNumbers, includeSymbols));
						}}
						className="w-3.5 h-3.5 accent-gray-800 cursor-pointer"
					/>
					Include Letters
				</label>
				<label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
					<input
						type="checkbox"
						checked={includeNumbers}
						onChange={(e) => {
							const val = e.target.checked;
							setIncludeNumbers(val);
							setPassword(generatePassword(passwordLength, includeLetters, val, includeSymbols));
						}}
						className="w-3.5 h-3.5 accent-gray-800 cursor-pointer"
					/>
					Include Numbers
				</label>
				<label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer select-none">
					<input
						type="checkbox"
						checked={includeSymbols}
						onChange={(e) => {
							const val = e.target.checked;
							setIncludeSymbols(val);
							setPassword(generatePassword(passwordLength, includeLetters, includeNumbers, val));
						}}
						className="w-3.5 h-3.5 accent-gray-800 cursor-pointer"
					/>
					Include Symbols
				</label>
			</div>
		</div>
	);
}
