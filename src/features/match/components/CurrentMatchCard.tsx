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
				<div className="flex justify-around w-full text-2xl font-bold mb-4">
					<span
						className={`transition ${
							defendingTeam?.id === currentMatch.team1.id
								? "underline decoration-4 underline-offset-8"
								: ""
						}`}
						style={{ color: currentMatch.team1.color }}
					>
						{currentMatch.team1.name}
					</span>
					<span className="text-gray-300">vs</span>
					<span
						className={`transition ${
							defendingTeam?.id === currentMatch.team2.id
								? "underline decoration-4 underline-offset-8"
								: ""
						}`}
						style={{ color: currentMatch.team2.color }}
					>
						{currentMatch.team2.name}
					</span>
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
					<div className="flex justify-around mt-8">
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
					</div>
				</div>
			</div>
		</div>
	);
};
