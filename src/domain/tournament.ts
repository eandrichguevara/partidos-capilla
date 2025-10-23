import type { LeaderboardEntry } from "./types";

/**
 * Obtiene el campeón del torneo (primer lugar en el leaderboard)
 */
export const getTournamentWinner = (
	leaderboard: LeaderboardEntry[]
): LeaderboardEntry | null => {
	if (leaderboard.length === 0) {
		return null;
	}
	return leaderboard[0];
};

/**
 * Obtiene el podio completo (top 3)
 */
export const getPodium = (
	leaderboard: LeaderboardEntry[]
): LeaderboardEntry[] => {
	return leaderboard.slice(0, 3);
};

/**
 * Verifica si hay suficientes partidos para considerar un torneo válido
 */
export const isValidTournament = (matchCount: number): boolean => {
	return matchCount >= 3;
};
