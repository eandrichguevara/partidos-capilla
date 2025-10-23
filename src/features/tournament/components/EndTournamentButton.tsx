"use client";

import { FaTrophy } from "react-icons/fa";

interface EndTournamentButtonProps {
	onClick: () => void;
	disabled?: boolean;
}

export const EndTournamentButton = ({
	onClick,
	disabled = false,
}: EndTournamentButtonProps) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`
        flex items-center gap-2 rounded-lg px-6 py-3 font-semibold 
        transition-all duration-200 shadow-lg
        ${
					disabled
						? "bg-gray-700 text-gray-400 cursor-not-allowed opacity-50"
						: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 hover:scale-105 hover:shadow-xl"
				}
      `}
			title={
				disabled
					? "Se necesitan al menos 3 partidos jugados"
					: "Ver resultados finales del torneo"
			}
		>
			<FaTrophy className="h-5 w-5" />
			<span>Finalizar Torneo</span>
		</button>
	);
};
