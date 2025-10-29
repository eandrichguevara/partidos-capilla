import type { Team, MatchResult } from "@/domain/types";

export interface DerivedTournamentState {
	defendingTeam: Team | null;
	queue: Team[];
	currentMatch: { team1: Team; team2: Team } | null;
}

/**
 * Derives the current tournament state (defender, queue, current match) from match history
 * @param teams - All teams in the tournament
 * @param matchHistory - Complete match history
 * @returns The derived state including defending team, queue, and current match
 */
export function deriveTournamentState(
	teams: Team[],
	matchHistory: MatchResult[]
): DerivedTournamentState {
	// If no history, return initial state
	if (matchHistory.length === 0) {
		if (teams.length === 0) {
			return {
				defendingTeam: null,
				queue: [],
				currentMatch: null,
			};
		}

		if (teams.length === 1) {
			return {
				defendingTeam: null,
				queue: [...teams],
				currentMatch: null,
			};
		}

		// Start first match with first two teams
		return {
			defendingTeam: null,
			queue: teams.slice(2), // Remaining teams after first match
			currentMatch: {
				team1: teams[0],
				team2: teams[1],
			},
		};
	}

	// If no teams, return empty state
	if (teams.length === 0) {
		return {
			defendingTeam: null,
			queue: [],
			currentMatch: null,
		};
	}

	// Get the last match to determine the defender
	const lastMatch = matchHistory[matchHistory.length - 1];
	const defender = teams.find((t) => t.id === lastMatch.winnerId);

	if (!defender) {
		return {
			defendingTeam: null,
			queue: [...teams],
			currentMatch: null,
		};
	}

	// Initialize queue and tracking
	const derivedQueue: Team[] = [];
	const teamsInQueue = new Set<number>();

	// Collect all loser IDs from history to find teams that never lost
	const loserIds = new Set(matchHistory.map((m) => m.loserId));

	// Add teams that have never lost first (they get priority)
	const teamsNeverLost = teams.filter(
		(t) => t.id !== defender.id && !loserIds.has(t.id)
	);
	derivedQueue.push(...teamsNeverLost);
	teamsNeverLost.forEach((t) => teamsInQueue.add(t.id));

	// Build list of losers in chronological order, keeping track of when each team last lost
	// We'll add them in order, but skip duplicates (only the most recent loss matters for position)
	const losersInOrder: Team[] = [];
	const addedLosers = new Set<number>();

	// Traverse from oldest to newest to find the order
	for (let i = 0; i < matchHistory.length; i++) {
		const match = matchHistory[i];
		const loser = teams.find((t) => t.id === match.loserId);

		// Skip if loser is the current defender or already processed
		if (!loser || loser.id === defender.id) continue;

		// If this loser was already added, remove them (they'll be re-added at the end)
		if (addedLosers.has(loser.id)) {
			const index = losersInOrder.findIndex((t) => t.id === loser.id);
			if (index !== -1) {
				losersInOrder.splice(index, 1);
			}
		}

		// Add loser at the end (most recent position)
		losersInOrder.push(loser);
		addedLosers.add(loser.id);
		teamsInQueue.add(loser.id);
	}

	// Add all losers to the queue (in the order they should challenge)
	derivedQueue.push(...losersInOrder);

	// Determine current match: defender vs first team in queue
	const challenger = derivedQueue.length > 0 ? derivedQueue[0] : null;
	const currentMatch = challenger
		? { team1: defender, team2: challenger }
		: null;

	// Remove challenger from queue (they're in the current match)
	const finalQueue = challenger ? derivedQueue.slice(1) : derivedQueue;

	return {
		defendingTeam: defender,
		queue: finalQueue,
		currentMatch,
	};
}
