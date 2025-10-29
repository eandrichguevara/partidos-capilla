"use client";

import { FaTrophy, FaMedal, FaAward, FaFutbol, FaClock } from "react-icons/fa";
import type { LeaderboardEntry } from "@/domain/types";
import Image from "next/image";

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
			className="relative w-full max-w-2xl mx-auto overflow-y-auto"
			style={{
				background: "linear-gradient(180deg, #0a0e27 0%, #1a1f3a 50%, #0f1729 100%)",
				borderRadius: "24px",
				maxHeight: "80vh",
				border: "3px solid #2563eb",
				boxShadow: "0 0 40px rgba(37, 99, 235, 0.5), inset 0 0 60px rgba(0, 0, 0, 0.5)",
			}}
		>
			{/* Animated Background Effect */}
			<div className="absolute inset-0 opacity-10 pointer-events-none">
				<div className="absolute inset-0" style={{
					background: "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)",
				}} />
			</div>

			{/* Content */}
			<div className="relative z-10 p-6">
				{/* Header with Trophy Icon */}
				<div className="text-center mb-4 relative">
					<div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-3">
						<div className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg shadow-yellow-500/50" style={{
							background: "linear-gradient(to bottom right, #facc15, #eab308, #ca8a04)",
							border: "3px solid #fbbf24",
						}}>
							<FaTrophy className="text-2xl text-yellow-900" />
						</div>
					</div>
					<div className="pt-10">
						<div className="inline-block px-4 py-1 mb-2" style={{
							background: "linear-gradient(90deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)",
							borderRadius: "6px",
							border: "2px solid #60a5fa",
							boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
						}}>
							<p className="text-xs font-black text-blue-100 tracking-widest uppercase">
								Torneo Finalizado
							</p>
						</div>
						<h1 className="text-3xl font-black text-white mb-1" style={{
							textShadow: "0 0 20px rgba(59, 130, 246, 0.8), 0 4px 8px rgba(0, 0, 0, 0.8)",
							letterSpacing: "1px",
						}}>
							GOL Y TE QUEDAS
						</h1>
						<p className="text-xs text-blue-300 font-semibold">{dateStr}</p>
					</div>
				</div>

				{/* Champion Card - Madden Style */}
				<div className="mb-4 relative">
					{/* Champion Banner */}
					<div className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
						<div className="px-6 py-1" style={{
							background: "linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)",
							clipPath: "polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)",
							boxShadow: "0 4px 12px rgba(251, 191, 36, 0.6)",
						}}>
							<h2 className="text-center text-sm font-black text-yellow-900 tracking-widest">
								CAMPEÓN
							</h2>
						</div>
					</div>

					<div className="pt-3 p-5" style={{
						background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1e3a8a 100%)",
						borderRadius: "16px",
						border: "3px solid #fbbf24",
						boxShadow: "0 8px 24px rgba(251, 191, 36, 0.4), inset 0 2px 8px rgba(255, 255, 255, 0.1)",
					}}>
						<div className="flex items-center justify-center gap-6 mb-4">
							{/* Logo único centrado */}
							<div className="shrink-0">
								{champion.team.logo ? (
									<div className="relative w-24 h-24 rounded-full overflow-hidden" style={{
										border: "4px solid #fbbf24",
										boxShadow: "0 0 20px rgba(251, 191, 36, 0.6)",
										background: "#ffffff",
									}}>
										<Image
											src={champion.team.logo}
											alt={champion.team.name}
											fill
											className="object-contain p-2"
										/>
									</div>
								) : (
									<div className="w-24 h-24 rounded-full flex items-center justify-center" style={{
										backgroundColor: champion.team.color,
										border: "4px solid #fbbf24",
										boxShadow: "0 0 20px rgba(251, 191, 36, 0.6)",
									}}>
										<FaTrophy className="text-4xl text-white opacity-50" />
									</div>
								)}
							</div>

							{/* Info */}
							<div className="flex-1 text-left">
								<h3 className="text-3xl font-black text-white mb-3" style={{
									textShadow: "0 0 15px rgba(251, 191, 36, 0.8), 0 4px 8px rgba(0, 0, 0, 0.8)",
									letterSpacing: "0.5px",
								}}>
									{champion.team.name}
								</h3>
								
								{/* Stats Grid */}
								<div className="grid grid-cols-3 gap-2">
									<div className="px-2 py-1 rounded-lg text-center" style={{
										background: "rgba(251, 191, 36, 0.15)",
										border: "2px solid rgba(251, 191, 36, 0.3)",
									}}>
										<p className="text-2xl font-black text-yellow-400 leading-tight" style={{
											textShadow: "0 0 10px rgba(251, 191, 36, 0.8)",
										}}>
											{champion.points}
										</p>
										<p className="text-xs font-bold text-yellow-200 uppercase tracking-wide">
											Pts
										</p>
									</div>
									<div className="px-2 py-1 rounded-lg text-center" style={{
										background: "rgba(251, 191, 36, 0.15)",
										border: "2px solid rgba(251, 191, 36, 0.3)",
									}}>
										<p className="text-2xl font-black text-yellow-400 leading-tight" style={{
											textShadow: "0 0 10px rgba(251, 191, 36, 0.8)",
										}}>
											{champion.winsByGoal}
										</p>
										<p className="text-xs font-bold text-yellow-200 uppercase tracking-wide">
											Gol
										</p>
									</div>
									<div className="px-2 py-1 rounded-lg text-center" style={{
										background: "rgba(251, 191, 36, 0.15)",
										border: "2px solid rgba(251, 191, 36, 0.3)",
									}}>
										<p className="text-2xl font-black text-yellow-400 leading-tight" style={{
											textShadow: "0 0 10px rgba(251, 191, 36, 0.8)",
										}}>
											{champion.gamesPlayed}
										</p>
										<p className="text-xs font-bold text-yellow-200 uppercase tracking-wide">
											PJ
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Podium - Madden Style */}
				{podium.length > 1 && (
					<div className="space-y-2 mb-4">
						{podium.slice(1).map((entry, index) => {
							const position = index + 2;
							const bgGradient = position === 2
								? "linear-gradient(90deg, #374151 0%, #4b5563 50%, #374151 100%)"
								: "linear-gradient(90deg, #78350f 0%, #92400e 50%, #78350f 100%)";
							const borderColor = position === 2 ? "#9ca3af" : "#d97706";
							const textColor = position === 2 ? "text-gray-100" : "text-amber-100";
							const Icon = position === 2 ? FaMedal : FaAward;
							
							return (
								<div
									key={entry.team.id}
									className="p-3 relative"
									style={{
										background: bgGradient,
										borderRadius: "12px",
										border: `2px solid ${borderColor}`,
										boxShadow: `0 3px 10px ${position === 2 ? "rgba(156, 163, 175, 0.3)" : "rgba(217, 119, 6, 0.3)"}`,
									}}
								>
									{/* Position Badge */}
									<div className="absolute -top-2 left-3">
										<div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
											background: position === 2 
												? "linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%)" 
												: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
											border: `2px solid ${borderColor}`,
											boxShadow: `0 2px 6px ${position === 2 ? "rgba(156, 163, 175, 0.5)" : "rgba(217, 119, 6, 0.5)"}`,
										}}>
											<span className="text-sm font-black" style={{
												color: position === 2 ? "#1f2937" : "#451a03",
											}}>
												{position}°
											</span>
										</div>
									</div>

									<div className="flex items-center justify-between pl-8">
										<div className="flex items-center gap-3 flex-1">
											<Icon className={`text-xl ${textColor}`} />
											
											{/* Team Logo */}
											{entry.team.logo ? (
												<div className="relative w-12 h-12 rounded-full overflow-hidden" style={{
													border: `2px solid ${borderColor}`,
													background: "#ffffff",
													boxShadow: `0 0 10px ${position === 2 ? "rgba(156, 163, 175, 0.4)" : "rgba(217, 119, 6, 0.4)"}`,
												}}>
													<Image
														src={entry.team.logo}
														alt={entry.team.name}
														fill
														className="object-contain p-1"
													/>
												</div>
											) : (
												<div className="w-12 h-12 rounded-full" style={{
													backgroundColor: entry.team.color,
													border: `2px solid ${borderColor}`,
													boxShadow: `0 0 10px ${position === 2 ? "rgba(156, 163, 175, 0.4)" : "rgba(217, 119, 6, 0.4)"}`,
												}} />
											)}

											<div className="flex-1 min-w-0">
												<h4 className={`text-lg font-black ${textColor} truncate`} style={{
													textShadow: "0 2px 4px rgba(0, 0, 0, 0.5)",
												}}>
													{entry.team.name}
												</h4>
												<div className="flex gap-2 text-xs">
													<span className={`${textColor} opacity-80 font-semibold`}>
														{entry.winsByGoal} goles
													</span>
													<span className={`${textColor} opacity-80 font-semibold`}>
														{entry.gamesPlayed} PJ
													</span>
												</div>
											</div>
										</div>
										
										<div className="text-right shrink-0 ml-2">
											<p className={`text-3xl font-black ${textColor} leading-tight`} style={{
												textShadow: "0 2px 6px rgba(0, 0, 0, 0.6)",
											}}>
												{entry.points}
											</p>
											<p className={`text-xs ${textColor} opacity-80 font-bold uppercase`}>
												Pts
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}

				{/* Stats Footer - Madden Style */}
				<div className="grid grid-cols-3 gap-3 mb-4">
					<div className="p-3 rounded-xl text-center" style={{
						background: "linear-gradient(135deg, #065f46 0%, #047857 100%)",
						border: "2px solid #10b981",
						boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
					}}>
						<FaFutbol className="text-2xl text-emerald-300 mx-auto mb-1" />
						<p className="text-2xl font-black text-white leading-tight" style={{
							textShadow: "0 0 10px rgba(16, 185, 129, 0.8)",
						}}>
							{matches}
						</p>
						<p className="text-xs text-emerald-200 uppercase font-bold tracking-wider">
							Partidos
						</p>
					</div>
					<div className="p-3 rounded-xl text-center" style={{
						background: "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
						border: "2px solid #f59e0b",
						boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
					}}>
						<FaClock className="text-2xl text-amber-300 mx-auto mb-1" />
						<p className="text-2xl font-black text-white leading-tight" style={{
							textShadow: "0 0 10px rgba(245, 158, 11, 0.8)",
						}}>
							{champion.winsByTimeout}
						</p>
						<p className="text-xs text-amber-200 uppercase font-bold tracking-wider">
							Timeouts
						</p>
					</div>
					<div className="p-3 rounded-xl text-center" style={{
						background: "linear-gradient(135deg, #7c2d12 0%, #92400e 100%)",
						border: "2px solid #c2410c",
						boxShadow: "0 4px 12px rgba(194, 65, 12, 0.3)",
					}}>
						<FaTrophy className="text-2xl text-orange-300 mx-auto mb-1" />
						<p className="text-2xl font-black text-white leading-tight" style={{
							textShadow: "0 0 10px rgba(194, 65, 12, 0.8)",
						}}>
							{champion.winsByGoal}
						</p>
						<p className="text-xs text-orange-200 uppercase font-bold tracking-wider">
							Victorias
						</p>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center pt-3" style={{
					borderTop: "2px solid rgba(59, 130, 246, 0.3)",
				}}>
					<p className="text-xs text-blue-300 font-semibold tracking-wide">
						CREADO CON GOL Y TE QUEDAS APP
					</p>
				</div>
			</div>
		</div>
	);
};
