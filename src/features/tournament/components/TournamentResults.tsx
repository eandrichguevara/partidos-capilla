"use client";

import { FaTrophy, FaMedal, FaAward, FaFutbol, FaClock } from "react-icons/fa";
import type { LeaderboardEntry } from "@/domain/types";

interface TournamentResultsProps {
	champion: LeaderboardEntry;
	podium: LeaderboardEntry[];
	totalMatches?: number;
}

export const TournamentResults = ({
	champion,
	podium,
	totalMatches,
}: TournamentResultsProps) => {
	const now = new Date();
	const dateStr = now.toLocaleDateString("es-ES", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	// Calcular total de partidos si no se proporciona
	const matches =
		totalMatches ??
		podium.reduce((sum, entry) => sum + entry.gamesPlayed, 0) / 2;

	return (
		<div
			id="tournament-results"
			className="relative w-full max-w-md mx-auto p-6 overflow-hidden"
			style={{
				background:
					"linear-gradient(135deg, #312e81 0%, #6b21a8 50%, #831843 100%)",
				borderRadius: "20px",
			}}
		>
			{/* Content */}
			<div className="relative">
				{/* Header */}
				<div className="text-center mb-5">
					<h1 className="text-4xl font-black text-white mb-3">
						🏆 Gol y te Quedas
					</h1>
					<div
						className="text-base font-semibold py-2 px-4 mx-auto"
						style={{
							backgroundColor: "rgba(99, 102, 241, 0.4)",
							borderRadius: "10px",
							maxWidth: "fit-content",
						}}
					>
						<p className="text-indigo-100">Torneo Finalizado</p>
					</div>
					<p className="text-sm text-indigo-200 mt-2">{dateStr}</p>
				</div>

				{/* Champion Card */}
				<div
					className="p-5 mb-5"
					style={{
						background: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
						borderRadius: "16px",
					}}
				>
					<div className="flex items-center justify-center gap-3 mb-4">
						<FaTrophy className="text-5xl text-yellow-900" />
					</div>
					<h2 className="text-center text-xl font-black text-yellow-900 mb-3">
						CAMPEÓN
					</h2>
					<div className="text-center">
						<div className="flex items-center justify-center gap-3 mb-2">
							<div
								className="inline-flex h-7 w-7"
								style={{
									backgroundColor: champion.team.color,
									borderRadius: "50%",
								}}
							/>
							<h3 className="text-2xl font-black text-yellow-900">
								{champion.team.name}
							</h3>
						</div>
						<div className="flex items-center justify-center gap-4 mt-3">
							<div className="text-center">
								<p className="text-3xl font-black text-yellow-900">
									{champion.points}
								</p>
								<p className="text-xs font-bold text-yellow-800 uppercase">
									Puntos
								</p>
							</div>
							<div className="text-center">
								<p className="text-3xl font-black text-yellow-900">
									{champion.winsByGoal}
								</p>
								<p className="text-xs font-bold text-yellow-800 uppercase">
									Goles
								</p>
							</div>
							<div className="text-center">
								<p className="text-3xl font-black text-yellow-900">
									{champion.gamesPlayed}
								</p>
								<p className="text-xs font-bold text-yellow-800 uppercase">
									Partidos
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Podium */}
				{podium.length > 1 && (
					<div className="space-y-2 mb-5">
						{podium.slice(1).map((entry, index) => {
							const position = index + 2;
							const bgGradient =
								position === 2
									? "linear-gradient(90deg, #d1d5db 0%, #9ca3af 100%)"
									: "linear-gradient(90deg, #b45309 0%, #92400e 100%)";
							const textColor =
								position === 2 ? "text-gray-800" : "text-amber-100";
							const Icon = position === 2 ? FaMedal : FaAward;
							return (
								<div
									key={entry.team.id}
									className="p-3"
									style={{
										background: bgGradient,
										borderRadius: "12px",
									}}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<Icon className={`text-xl ${textColor}`} />
											<div
												className="inline-flex h-5 w-5"
												style={{
													backgroundColor: entry.team.color,
													borderRadius: "50%",
												}}
											/>
											<div>
												<h4 className={`text-base font-bold ${textColor}`}>
													{entry.team.name}
												</h4>
												<p className={`text-xs ${textColor} opacity-80`}>
													Puesto {position}
												</p>
											</div>
										</div>
										<div className="text-right">
											<p className={`text-xl font-black ${textColor}`}>
												{entry.points}
											</p>
											<p className={`text-xs ${textColor} opacity-80`}>pts</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Stats */}
				<div
					className="p-3 mb-3"
					style={{
						backgroundColor: "rgba(255, 255, 255, 0.15)",
						borderRadius: "12px",
					}}
				>
					<div className="flex items-center justify-around">
						<div className="text-center">
							<FaFutbol className="text-2xl text-emerald-300 mx-auto mb-1" />
							<p className="text-xl font-bold text-white">{matches}</p>
							<p className="text-xs text-indigo-200 uppercase">Partidos</p>
						</div>
						<div className="text-center">
							<FaClock className="text-2xl text-amber-300 mx-auto mb-1" />
							<p className="text-xl font-bold text-white">
								{champion.winsByTimeout}
							</p>
							<p className="text-xs text-indigo-200 uppercase">Timeouts</p>
						</div>
						<div className="text-center">
							<FaTrophy className="text-2xl text-yellow-300 mx-auto mb-1" />
							<p className="text-xl font-bold text-white">
								{champion.winsByGoal}
							</p>
							<p className="text-xs text-indigo-200 uppercase">Victorias</p>
						</div>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-3">
					<p className="text-xs text-indigo-200">
						Creado con Gol y te Quedas App
					</p>
				</div>
			</div>
		</div>
	);
};
