import type { Team, CurrentMatch } from "./types";

/**
 * Determina el siguiente partido basado en el estado actual
 * Reglas:
 * - Si hay defensor, juega contra el primero de la cola
 * - Si no hay defensor, juegan los dos primeros de la cola
 */
export const getNextMatch = (
	queue: Team[],
	defendingTeam: Team | null
): { match: CurrentMatch; remainingQueue: Team[] } | null => {
	if (defendingTeam) {
		if (queue.length < 1) {
			return null;
		}
		return {
			match: { team1: defendingTeam, team2: queue[0] },
			remainingQueue: queue.slice(1),
		};
	}

	if (queue.length < 2) {
		return null;
	}

	return {
		match: { team1: queue[0], team2: queue[1] },
		remainingQueue: queue.slice(2),
	};
};

/**
 * Procesa el resultado de un partido y devuelve el nuevo estado
 * Reglas:
 * - El ganador se convierte en el nuevo defensor
 * - El perdedor va al final de la cola
 * - Si es timeout y el defensor "ganó", en realidad perdió (regla especial)
 */
export const processMatchResult = (
	currentMatch: CurrentMatch,
	winnerId: number,
	reason: "goal" | "timeout",
	defendingTeam: Team | null,
	currentQueue: Team[]
): {
	newDefendingTeam: Team;
	newQueue: Team[];
	winner: Team;
	loser: Team;
} => {
	const { team1, team2 } = currentMatch;
	let winner = team1.id === winnerId ? team1 : team2;
	let loser = team1.id === winnerId ? team2 : team1;

	// Regla especial: si es timeout y el defensor "ganó", en realidad perdió
	if (reason === "timeout" && defendingTeam && winner.id === defendingTeam.id) {
		const temp = winner;
		winner = loser;
		loser = temp;
	}

	const newQueue = [...currentQueue, loser];

	return {
		newDefendingTeam: winner,
		newQueue,
		winner,
		loser,
	};
};
