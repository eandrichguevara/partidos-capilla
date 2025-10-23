import type { Team, MatchResult, LeaderboardEntry } from "./types";

/**
 * Calcula la tabla de posiciones basada en el historial de partidos
 * Reglas:
 * - 3 puntos por victoria (gol o timeout)
 * - En empate de puntos, se ordena por victorias por gol
 */
export const calculateLeaderboard = (
	teams: Team[],
	history: MatchResult[]
): LeaderboardEntry[] => {
	const stats = new Map<number, LeaderboardEntry>();

	teams.forEach((team) => {
		stats.set(team.id, {
			team,
			points: 0,
			winsByGoal: 0,
			winsByTimeout: 0,
			losses: 0,
			gamesPlayed: 0,
		});
	});

	history.forEach((match) => {
		const winner = stats.get(match.winnerId);
		const loser = stats.get(match.loserId);

		if (winner) {
			winner.points += 3;
			if (match.reason === "goal") {
				winner.winsByGoal += 1;
			} else {
				winner.winsByTimeout += 1;
			}
			winner.gamesPlayed += 1;
		}

		if (loser) {
			loser.losses += 1;
			loser.gamesPlayed += 1;
		}
	});

	return Array.from(stats.values()).sort((a, b) => {
		// Primero por puntos
		if (b.points !== a.points) {
			return b.points - a.points;
		}
		// Desempate por victorias por gol
		return b.winsByGoal - a.winsByGoal;
	});
};
