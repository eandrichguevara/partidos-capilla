import type { LeaderboardEntry, MatchResult } from "./types";

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

/**
 * Detecta si hay empate entre los dos primeros lugares del leaderboard
 * considerando puntos y victorias por gol
 */
export const detectTieForFirst = (
	leaderboard: LeaderboardEntry[]
): { isTied: true; teams: LeaderboardEntry[] } | { isTied: false } => {
	if (leaderboard.length < 2) {
		return { isTied: false };
	}

	const first = leaderboard[0];
	const second = leaderboard[1];

	// Verificar si están empatados en puntos y victorias por gol
	if (
		first.points === second.points &&
		first.winsByGoal === second.winsByGoal
	) {
		// Encontrar todos los equipos empatados en el primer lugar
		const tiedTeams = leaderboard.filter(
			(entry) =>
				entry.points === first.points && entry.winsByGoal === first.winsByGoal
		);

		return { isTied: true, teams: tiedTeams };
	}

	return { isTied: false };
};

/**
 * Obtiene el total de victorias por gol de todos los partidos
 */
export const getTotalWinsByGoal = (matchHistory: MatchResult[]): number => {
	return matchHistory.reduce((acc, match) => {
		if (match.reason === "goal") {
			acc = acc + 1;
		}
		return acc;
	}, 0);
};
