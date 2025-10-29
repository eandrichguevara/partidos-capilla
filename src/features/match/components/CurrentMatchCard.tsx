"use client";

import { FaPause, FaPlay, FaStop, FaFutbol } from "react-icons/fa";
import Timer from "@/components/Timer";
import type { Team } from "@/domain/types";

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
 * Calcula el tamaño de fuente dinámico basado en la longitud del nombre
 * Usa clamp() para que el texto se ajuste fluidamente al espacio disponible
 */
const getDynamicFontSize = (name: string): { fontSize: string } => {
	const length = name.length;

	// Calculamos un tamaño base que decrece con la longitud
	// Fórmula: tamaño máximo - (longitud * factor de reducción)
	let minSize: number;
	let maxSize: number;

	if (length <= 5) {
		minSize = 2.5; // 2.5rem
		maxSize = 4; // 4rem
	} else if (length <= 8) {
		minSize = 2;
		maxSize = 3.5;
	} else if (length <= 12) {
		minSize = 1.5;
		maxSize = 2.5;
	} else if (length <= 16) {
		minSize = 1.25;
		maxSize = 2;
	} else {
		// Para nombres muy largos
		minSize = 1;
		maxSize = 1.5;
	}

	// clamp(min, preferred, max) - el texto se ajustará entre min y max
	// Usamos vw (viewport width) para que sea responsive
	return {
		fontSize: `clamp(${minSize}rem, ${maxSize * 0.8}vw, ${maxSize}rem)`,
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
				{/* Versus estilo juego de pelea */}
				<div className="relative w-full mb-6 py-8 px-4 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl border-2 border-yellow-500/50 shadow-2xl overflow-visible">
					{/* Efectos de fondo */}
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent pointer-events-none rounded-xl"></div>
					<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse pointer-events-none"></div>
					<div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent animate-pulse pointer-events-none"></div>

					<div className="relative flex flex-col items-center justify-center min-h-[160px] pointer-events-none">
						{/* Equipo 1 - Arriba Izquierda */}
						<div
							key={currentMatch.team1.id}
							className="absolute top-0 left-0 flex flex-col items-start max-w-[45%] animate-[slideInLeft_0.6s_ease-out]"
						>
							<div
								className={`relative font-black tracking-wider transform transition-all duration-300 hover:scale-105 whitespace-nowrap ${
									defendingTeam?.id === currentMatch.team1.id
										? "animate-pulse"
										: ""
								}`}
								style={{
									...getDynamicFontSize(currentMatch.team1.name),
									color: currentMatch.team1.color,
									textShadow: `0 0 20px ${currentMatch.team1.color}80, 0 0 40px ${currentMatch.team1.color}40, 2px 2px 4px rgba(0,0,0,0.8)`,
									WebkitTextStroke: "1px rgba(0,0,0,0.5)",
								}}
							>
								{currentMatch.team1.name}
							</div>
						</div>

						{/* VS Central */}
						<div className="flex flex-col items-center justify-center z-10">
							<span
								className="text-2xl sm:text-3xl font-black tracking-widest whitespace-nowrap"
								style={{
									color: "#fbbf24",
									textShadow:
										"0 0 20px rgba(251, 191, 36, 0.6), 2px 2px 4px rgba(0,0,0,0.8)",
									WebkitTextStroke: "1px rgba(0,0,0,0.5)",
								}}
							>
								VS
							</span>
						</div>

						{/* Equipo 2 - Abajo Derecha */}
						<div
							key={currentMatch.team2.id}
							className="absolute bottom-0 right-0 flex flex-col items-end max-w-[45%] animate-[slideInRight_0.6s_ease-out]"
						>
							<div
								className={`relative font-black tracking-wider transform transition-all duration-300 hover:scale-105 whitespace-nowrap ${
									defendingTeam?.id === currentMatch.team2.id
										? "animate-pulse"
										: ""
								}`}
								style={{
									...getDynamicFontSize(currentMatch.team2.name),
									color: currentMatch.team2.color,
									textShadow: `0 0 20px ${currentMatch.team2.color}80, 0 0 40px ${currentMatch.team2.color}40, 2px 2px 4px rgba(0,0,0,0.8)`,
									WebkitTextStroke: "1px rgba(0,0,0,0.5)",
								}}
							>
								{currentMatch.team2.name}
							</div>
						</div>
					</div>
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
