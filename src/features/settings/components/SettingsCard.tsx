"use client";

import { useState } from "react";

interface SettingsCardProps {
	matchDuration: number;
	onSetMatchDuration: (duration: number) => void;
}

export const SettingsCard = ({
	matchDuration,
	onSetMatchDuration,
}: SettingsCardProps) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="w-full bg-gray-800 rounded-lg mb-6">
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex w-full items-center justify-between px-6 py-4"
				aria-expanded={isOpen}
				aria-controls="settings-section"
			>
				<span className="text-2xl font-semibold">Configuración</span>
				<span className="text-2xl font-bold">{isOpen ? "-" : "+"}</span>
			</button>
			{isOpen && (
				<div
					id="settings-section"
					className="border-t border-gray-700 px-6 py-4"
				>
					<div className="flex items-center justify-between">
						<label htmlFor="duration" className="mr-4">
							Duración del Partido (min)
						</label>
						<select
							id="duration"
							value={matchDuration}
							onChange={(e) => onSetMatchDuration(Number(e.target.value))}
							className="bg-gray-700 text-white p-2 rounded-md"
						>
							<option value="3">3</option>
							<option value="4">4</option>
							<option value="5">5</option>
							<option value="6">6</option>
							<option value="7">7</option>
						</select>
					</div>
				</div>
			)}
		</div>
	);
};
