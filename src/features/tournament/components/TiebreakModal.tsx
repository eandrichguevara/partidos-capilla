"use client";

import type { LeaderboardEntry } from "@/domain/types";

interface TiebreakModalProps {
	isOpen: boolean;
	tiedTeams: LeaderboardEntry[];
	onSelectWinner: (teamId: number) => void;
	onCancel: () => void;
}

export const TiebreakModal = ({
	isOpen,
	tiedTeams,
	onSelectWinner,
	onCancel,
}: TiebreakModalProps) => {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
			onClick={onCancel}
		>
			<div
				className="bg-gray-800 p-6 rounded-xl max-w-md w-full"
				onClick={(e) => e.stopPropagation()}
			>
				<h2 className="text-2xl font-bold text-white mb-4 text-center">
					⚽ Desempate Necesario
				</h2>

				<div className="bg-gray-700 p-4 rounded-lg mb-4">
					<p className="text-white text-sm mb-3">
						Los siguientes equipos están empatados en puntos y victorias por
						gol:
					</p>

					<div className="space-y-2 mb-4">
						{tiedTeams.map((entry) => (
							<div
								key={entry.team.id}
								className="flex items-center gap-2 bg-gray-600 p-2 rounded"
							>
								<div
									className="w-4 h-4 rounded-full"
									style={{ backgroundColor: entry.team.color }}
								/>
								<span className="text-white font-semibold">
									{entry.team.name}
								</span>
								<span className="text-gray-300 text-sm ml-auto">
									{entry.points} pts, {entry.winsByGoal} goles
								</span>
							</div>
						))}
					</div>

					<p className="text-yellow-300 text-sm text-center">
						💡 Sugerencia: Juega un partido de desempate o tanda de penales
					</p>
				</div>

				<div className="mb-4">
					<p className="text-white font-semibold mb-2 text-center">
						¿Quién ganó el desempate?
					</p>
					<div className="space-y-2">
						{tiedTeams.map((entry) => (
							<button
								key={entry.team.id}
								onClick={() => onSelectWinner(entry.team.id)}
								className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
							>
								<div
									className="w-5 h-5 rounded-full"
									style={{ backgroundColor: entry.team.color }}
								/>
								<span>{entry.team.name}</span>
							</button>
						))}
					</div>
				</div>

				<button
					onClick={onCancel}
					className="w-full bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition"
				>
					Cancelar
				</button>
			</div>
		</div>
	);
};
