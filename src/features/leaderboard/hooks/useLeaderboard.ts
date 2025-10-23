import { useMemo } from "react";
import { useGameStore } from "@/store/gameStore";
import { calculateLeaderboard } from "@/domain/leaderboard";

/**
 * Hook para obtener la tabla de posiciones
 */
export const useLeaderboard = () => {
	const teams = useGameStore((state) => state.teams);
	const matchHistory = useGameStore((state) => state.matchHistory);

	const leaderboard = useMemo(
		() => calculateLeaderboard(teams, matchHistory),
		[teams, matchHistory]
	);

	return {
		leaderboard,
	};
};
