"use client";

import { FaPause, FaPlay, FaStop, FaFutbol } from "react-icons/fa";
import Timer from "@/components/Timer";
import type { Team } from "@/domain/types";
import { getFontById } from "@/domain/fonts";
import Image from "next/image";

interface CurrentMatchCardProps {
	currentMatch: { team1: Team; team2: Team } | null;
	defendingTeam: Team | null;
	timeLeft: number;
	isTimerRunning: boolean;
	fullDurationSeconds: number;
	onStartTimer: () => void;
	onPauseTimer: () => void;
	onResetTimer: () => void;
	onWin: (winnerId: number, reason: "goal" | "timeout") => void;
}

/**
 * Calcula el tamaño de fuente para que el texto siempre ocupe aproximadamente 220px de ancho.
 * Estima el ancho del texto basándose en la cantidad de caracteres y ajusta el tamaño en consecuencia.
 */
const getDynamicFontSize = (
	name: string,
	fontFamily?: string
): { fontSize: string; width: string; display: string } => {
	const length = name.length;

	// Estimación aproximada: caracteres anchos promedio por fuente
	// Las fuentes condensadas tienen un ratio más alto (más caracteres por pixel)
	// Las fuentes anchas tienen un ratio más bajo (menos caracteres por pixel)
	const condensedFonts = [
		"Bebas Neue",
		"Teko",
		"Oswald",
		"Saira Condensed",
		"Barlow Condensed",
		"Staatliches",
	];

	let charWidthRatio = 0.6; // Ratio por defecto (caracteres moderadamente anchos)

	if (fontFamily) {
		const isCondensed = condensedFonts.some((font) =>
			fontFamily.includes(font)
		);
		charWidthRatio = isCondensed ? 0.5 : 0.65; // Fuentes condensadas caben más caracteres
	}

	// Ancho objetivo en píxeles
	const targetWidth = 220;

	// Calculamos el tamaño de fuente necesario para alcanzar el ancho objetivo
	// fontSize = targetWidth / (length * charWidthRatio)
	const calculatedSize = targetWidth / (length * charWidthRatio);

	// Limitamos el tamaño entre 1rem (16px) y 4rem (64px) para evitar extremos
	const minSize = 16; // px
	const maxSize = 64; // px
	const finalSize = Math.max(minSize, Math.min(maxSize, calculatedSize));

	return {
		fontSize: `${finalSize}px`,
		width: `${targetWidth}px`,
		display: "inline-block",
	};
};

export const CurrentMatchCard = ({
	currentMatch,
	defendingTeam,
	timeLeft,
	isTimerRunning,
	fullDurationSeconds,
	onStartTimer,
	onPauseTimer,
	onResetTimer,
	onWin,
}: CurrentMatchCardProps) => {
	if (!currentMatch) {
		return (
			<div className="w-full bg-gray-800 rounded-lg p-6 mb-6">
				<h2 className="text-2xl font-semibold mb-4 text-center">
					Partido Actual
				</h2>
				<p className="text-center">Esperando equipos para comenzar...</p>
			</div>
		);
	}

	return (
		<div className="w-full bg-gray-800 rounded-lg p-6 mb-6">
			<h2 className="text-2xl font-semibold mb-4 text-center">
				Partido Actual
			</h2>
			<div className="flex flex-col items-center">
				{/* Madden NFL Style Match Display */}
				<div className="relative w-full mb-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl border-2 border-slate-700 py-8 px-4">
					{/* Background pattern */}
					<div className="absolute inset-0 opacity-10">
						<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%,rgba(255,255,255,0.1))] bg-[length:20px_20px]"></div>
					</div>

					{/* Top accent bar */}
					<div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>

					<div className="relative flex flex-col items-center justify-center min-h-[240px]">
						{/* Team 1 - Top Left */}
						<div
							key={`team1-${currentMatch.team1.id}`}
							className="absolute top-0 left-0 flex items-center gap-2 animate-[maddenSlideInLeft_0.8s_ease-out]"
						>
							{/* Logo que sale del contenedor */}
							{currentMatch.team1.logo && (
								<div className="relative w-32 h-32 sm:w-40 sm:h-40 -ml-8 -mt-8">
									<div
										className="absolute inset-0 transition-all duration-300"
										style={{
											filter:
												defendingTeam?.id === currentMatch.team1.id
													? "drop-shadow(0 0 2px white) drop-shadow(0 0 2px white) drop-shadow(0 0 30px rgba(250,204,21,0.6))"
													: "drop-shadow(0 0 2px white) drop-shadow(0 0 2px white)",
										}}
									>
										<Image
											src={currentMatch.team1.logo}
											alt={currentMatch.team1.name}
											fill
											className="object-contain"
											priority
										/>
									</div>
								</div>
							)}

							{/* Team Name */}
							<div className="ml-0">
								<h3
									className="font-black tracking-tight"
									style={{
										...getDynamicFontSize(
											currentMatch.team1.name,
											currentMatch.team1.font
												? getFontById(currentMatch.team1.font)?.fontFamily
												: undefined
										),
										color: currentMatch.team1.color,
										textShadow: `0 2px 10px ${currentMatch.team1.color}60, 0 0 20px ${currentMatch.team1.color}40, 2px 2px 4px rgba(0,0,0,0.8)`,
										WebkitTextStroke: "1px rgba(0,0,0,0.5)",
										fontFamily: currentMatch.team1.font
											? getFontById(currentMatch.team1.font)?.fontFamily
											: undefined,
										textAlign: "center",
									}}
								>
									{currentMatch.team1.name}
								</h3>
							</div>
						</div>

						{/* VS Central */}
						<div className="flex flex-col items-center justify-center z-10">
							<span className="text-4xl font-black text-emerald-400 tracking-widest drop-shadow-[0_2px_10px_rgba(52,211,153,0.5)]">
								VS
							</span>
						</div>

						{/* Team 2 - Bottom Right */}
						<div
							key={`team2-${currentMatch.team2.id}`}
							className="absolute bottom-0 right-0 flex items-center gap-2 justify-end animate-[maddenSlideInRight_0.8s_ease-out]"
						>
							{/* Team Name */}
							<div className="mr-0 text-right">
								<h3
									className="font-black tracking-tight"
									style={{
										...getDynamicFontSize(
											currentMatch.team2.name,
											currentMatch.team2.font
												? getFontById(currentMatch.team2.font)?.fontFamily
												: undefined
										),
										color: currentMatch.team2.color,
										textShadow: `0 2px 10px ${currentMatch.team2.color}60, 0 0 20px ${currentMatch.team2.color}40, 2px 2px 4px rgba(0,0,0,0.8)`,
										WebkitTextStroke: "1px rgba(0,0,0,0.5)",
										fontFamily: currentMatch.team2.font
											? getFontById(currentMatch.team2.font)?.fontFamily
											: undefined,
										textAlign: "center",
									}}
								>
									{currentMatch.team2.name}
								</h3>
							</div>

							{/* Logo que sale del contenedor */}
							{currentMatch.team2.logo && (
								<div className="relative w-32 h-32 sm:w-40 sm:h-40 -mr-8 -mb-8">
									<div
										className="absolute inset-0 transition-all duration-300"
										style={{
											filter:
												defendingTeam?.id === currentMatch.team2.id
													? "drop-shadow(0 0 2px white) drop-shadow(0 0 2px white) drop-shadow(0 0 30px rgba(250,204,21,0.6))"
													: "drop-shadow(0 0 2px white) drop-shadow(0 0 2px white)",
										}}
									>
										<Image
											src={currentMatch.team2.logo}
											alt={currentMatch.team2.name}
											fill
											className="object-contain"
											priority
										/>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Bottom accent bar */}
					<div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
				</div>
				<Timer />
				<div className="mt-4 flex w-full justify-around gap-3">
					<button
						onClick={onStartTimer}
						disabled={isTimerRunning || timeLeft === 0}
						className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
							isTimerRunning || timeLeft === 0
								? "bg-emerald-700/40 text-emerald-200/60"
								: "bg-emerald-500 hover:bg-emerald-600 text-white"
						}`}
					>
						<FaPlay aria-hidden className="h-6 w-6" />
						<span className="sr-only">Iniciar</span>
					</button>
					<button
						onClick={onPauseTimer}
						disabled={!isTimerRunning}
						className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
							!isTimerRunning
								? "bg-amber-600/40 text-amber-200/60"
								: "bg-amber-500 hover:bg-amber-600 text-white"
						}`}
					>
						<FaPause aria-hidden className="h-6 w-6" />
						<span className="sr-only">Pausar</span>
					</button>
					<button
						onClick={onResetTimer}
						disabled={!isTimerRunning && timeLeft === fullDurationSeconds}
						className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition focus:outline-none focus:ring-2 focus:ring-rose-300 ${
							!isTimerRunning && timeLeft === fullDurationSeconds
								? "bg-rose-700/40 text-rose-200/60"
								: "bg-rose-500 hover:bg-rose-600 text-white"
						}`}
					>
						<FaStop aria-hidden className="h-6 w-6" />
						<span className="sr-only">Detener</span>
					</button>
				</div>
				<div className="mt-4 w-full">
					<h3 className="text-lg font-semibold mb-2 text-center">
						Marcar Ganador:
					</h3>
					<div className="flex justify-around gap-3">
						<button
							onClick={() => onWin(currentMatch.team1.id, "goal")}
							className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-xl text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-black/20 transition hover:brightness-110"
							style={{ backgroundColor: currentMatch.team1.color }}
						>
							<FaFutbol aria-hidden className="text-5xl" />
							<span>Gol</span>
							<span className="text-center leading-tight text-xs font-semibold normal-case">
								{currentMatch.team1.name}
							</span>
						</button>
						<button
							onClick={() => onWin(currentMatch.team2.id, "goal")}
							className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-xl text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-black/20 transition hover:brightness-110"
							style={{ backgroundColor: currentMatch.team2.color }}
						>
							<FaFutbol aria-hidden className="text-5xl" />
							<span>Gol</span>
							<span className="text-center leading-tight text-xs font-semibold normal-case">
								{currentMatch.team2.name}
							</span>
						</button>
					</div>
					<div className="flex justify-around gap-3 mt-8">
						{/* Primer partido: ambos equipos pueden ganar por timeout */}
						{!defendingTeam && (
							<>
								<button
									onClick={() => onWin(currentMatch.team1.id, "timeout")}
									className="rounded-lg px-4 py-2 font-semibold text-white shadow-md shadow-black/20 transition hover:brightness-110"
									style={{ backgroundColor: currentMatch.team1.color }}
								>
									Timeout {currentMatch.team1.name}
								</button>
								<button
									onClick={() => onWin(currentMatch.team2.id, "timeout")}
									className="rounded-lg px-4 py-2 font-semibold text-white shadow-md shadow-black/20 transition hover:brightness-110"
									style={{ backgroundColor: currentMatch.team2.color }}
								>
									Timeout {currentMatch.team2.name}
								</button>
							</>
						)}
						{/* Después del primer partido: solo el retador puede ganar por timeout */}
						{defendingTeam && (
							<>
								{defendingTeam.id !== currentMatch.team1.id && (
									<button
										onClick={() => onWin(currentMatch.team1.id, "timeout")}
										className="rounded-lg px-4 py-2 font-semibold text-white shadow-md shadow-black/20 transition hover:brightness-110"
										style={{ backgroundColor: currentMatch.team1.color }}
									>
										Timeout {currentMatch.team1.name}
									</button>
								)}
								{defendingTeam.id !== currentMatch.team2.id && (
									<button
										onClick={() => onWin(currentMatch.team2.id, "timeout")}
										className="rounded-lg px-4 py-2 font-semibold text-white shadow-md shadow-black/20 transition hover:brightness-110"
										style={{ backgroundColor: currentMatch.team2.color }}
									>
										Timeout {currentMatch.team2.name}
									</button>
								)}
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};
