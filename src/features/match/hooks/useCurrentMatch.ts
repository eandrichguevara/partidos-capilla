import {
	useGameStore,
	useCurrentMatch as useCurrentMatchDerived,
	useDefendingTeam,
} from "@/store/gameStore";

/**
 * Hook para manejar el partido actual y sus controles
 */
export const useCurrentMatch = () => {
	const currentMatch = useCurrentMatchDerived();
	const defendingTeam = useDefendingTeam();
	const timeLeft = useGameStore((state) => state.timeLeft);
	const isTimerRunning = useGameStore((state) => state.isTimerRunning);
	const matchDuration = useGameStore((state) => state.matchDuration);

	const startTimer = useGameStore((state) => state.startTimer);
	const pauseTimer = useGameStore((state) => state.pauseTimer);
	const resetTimer = useGameStore((state) => state.resetTimer);
	const endMatch = useGameStore((state) => state.endMatch);

	const fullDurationSeconds = matchDuration * 60;

	const handleWin = (winnerId: number, reason: "goal" | "timeout") => {
		if (currentMatch) {
			endMatch(winnerId, reason);
		}
	};

	return {
		currentMatch,
		defendingTeam,
		timeLeft,
		isTimerRunning,
		fullDurationSeconds,
		startTimer,
		pauseTimer,
		resetTimer,
		handleWin,
	};
};
