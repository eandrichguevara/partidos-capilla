import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Team, MatchResult } from "@/domain/types";
import { pickContrastingColor } from "@/domain/colors";
import { getNextMatch, processMatchResult } from "@/domain/match";
import { calculateLeaderboard } from "@/domain/leaderboard";

export type { Team, MatchResult } from "@/domain/types";

const DEFAULT_MATCH_DURATION = 5;

const createInitialDataState = () => ({
	teams: [] as Team[],
	queue: [] as Team[],
	currentMatch: null as { team1: Team; team2: Team } | null,
	matchHistory: [] as MatchResult[],
	matchDuration: DEFAULT_MATCH_DURATION,
	defendingTeam: null as Team | null,
	timeLeft: DEFAULT_MATCH_DURATION * 60,
	isTimerRunning: false,
});

interface GameState {
	teams: Team[];
	queue: Team[];
	currentMatch: { team1: Team; team2: Team } | null;
	matchHistory: MatchResult[];
	matchDuration: number; // in minutes
	defendingTeam: Team | null; // The team that won the last match
	timeLeft: number;
	isTimerRunning: boolean;
	setMatchDuration: (duration: number) => void;
	addTeam: (name: string) => void;
	editTeamName: (id: number, newName: string) => void;
	startNextMatch: () => void;
	endMatch: (winnerId: number, reason: "goal" | "timeout") => void;
	startTimer: () => void;
	pauseTimer: () => void;
	resetTimer: () => void;
	decrementTimer: () => void;
	updateMatchResult: (
		matchId: number,
		data: Partial<Omit<MatchResult, "matchId">>
	) => void;
	deleteMatchResult: (matchId: number) => void;
	getLeaderboard: () => {
		team: Team;
		points: number;
		winsByGoal: number;
		winsByTimeout: number;
		losses: number;
		gamesPlayed: number;
	}[];
	resetStore: () => Promise<void>;
}

let teamIdCounter = 1;
let matchIdCounter = 1;
type PersistedGameState = Pick<
	GameState,
	"teams" | "queue" | "matchHistory" | "defendingTeam" | "matchDuration"
>;

const noopStorage = {
	getItem: () => null,
	setItem: () => undefined,
	removeItem: () => undefined,
	key: () => null,
	length: 0,
	clear: () => undefined,
} as Storage;

export const useGameStore = create<GameState>()(
	persist(
		(set, get, api) => ({
			...createInitialDataState(),

			setMatchDuration: (duration) =>
				set(() => ({
					matchDuration: duration,
					timeLeft: duration * 60,
					isTimerRunning: false,
				})),

			addTeam: (name) => {
				set((state) => {
					const color = pickContrastingColor(
						state.teams.map((team) => team.color)
					);
					const newTeam: Team = { id: teamIdCounter++, name, color };
					return {
						teams: [...state.teams, newTeam],
						queue: [...state.queue, newTeam],
					};
				});
				const state = get();
				const requiredQueueLength = state.defendingTeam ? 1 : 2;
				if (!state.currentMatch && state.queue.length >= requiredQueueLength) {
					state.startNextMatch();
				}
			},

			editTeamName: (id, newName) => {
				const update = (team: Team) =>
					team.id === id ? { ...team, name: newName } : team;
				set((state) => ({
					teams: state.teams.map(update),
					queue: state.queue.map(update),
					currentMatch: state.currentMatch
						? {
								team1: update(state.currentMatch.team1),
								team2: update(state.currentMatch.team2),
						  }
						: null,
					defendingTeam: state.defendingTeam
						? update(state.defendingTeam)
						: null,
				}));
			},

			startNextMatch: () => {
				set((state) => {
					const result = getNextMatch(state.queue, state.defendingTeam);

					if (!result) {
						return {};
					}

					return {
						currentMatch: result.match,
						queue: result.remainingQueue,
						timeLeft: state.matchDuration * 60,
						isTimerRunning: false,
					};
				});
			},

			endMatch: (winnerId, reason) => {
				set((state) => {
					if (!state.currentMatch) return {};

					const result = processMatchResult(
						state.currentMatch,
						winnerId,
						reason,
						state.defendingTeam,
						state.queue
					);

					const newMatchHistory = [
						...state.matchHistory,
						{
							matchId: matchIdCounter++,
							winnerId: result.winner.id,
							loserId: result.loser.id,
							reason,
						},
					];

					const nextMatchResult = getNextMatch(
						result.newQueue,
						result.newDefendingTeam
					);

					return {
						matchHistory: newMatchHistory,
						defendingTeam: result.newDefendingTeam,
						queue: nextMatchResult?.remainingQueue ?? result.newQueue,
						currentMatch: nextMatchResult?.match ?? null,
						timeLeft: state.matchDuration * 60,
						isTimerRunning: false,
					};
				});
			},

			startTimer: () =>
				set((state) => {
					if (!state.currentMatch || state.timeLeft === 0) {
						return {};
					}
					return { isTimerRunning: true };
				}),

			pauseTimer: () => set({ isTimerRunning: false }),

			resetTimer: () =>
				set((state) => ({
					timeLeft: state.matchDuration * 60,
					isTimerRunning: false,
				})),

			decrementTimer: () =>
				set((state) => {
					if (!state.isTimerRunning || state.timeLeft === 0) {
						return {};
					}
					const next = Math.max(state.timeLeft - 1, 0);
					return {
						timeLeft: next,
						isTimerRunning: next === 0 ? false : state.isTimerRunning,
					};
				}),

			updateMatchResult: (matchId, data) =>
				set((state) => ({
					matchHistory: state.matchHistory.map((match) =>
						match.matchId === matchId ? { ...match, ...data } : match
					),
				})),

			deleteMatchResult: (matchId) =>
				set((state) => ({
					matchHistory: state.matchHistory.filter(
						(match) => match.matchId !== matchId
					),
				})),

			getLeaderboard: () => {
				const { teams, matchHistory } = get();
				return calculateLeaderboard(teams, matchHistory);
			},

			resetStore: async () => {
				teamIdCounter = 1;
				matchIdCounter = 1;
				set(createInitialDataState());
				await api.persist?.clearStorage?.();
			},
		}),
		{
			name: "partidos-capilla-game-store",
			version: 1,
			storage: createJSONStorage(() =>
				typeof window === "undefined" ? noopStorage : window.localStorage
			),
			partialize: (state): PersistedGameState => ({
				teams: state.teams,
				queue: state.queue,
				matchHistory: state.matchHistory,
				defendingTeam: state.defendingTeam,
				matchDuration: state.matchDuration,
			}),
			migrate: (persistedState: unknown, version) => {
				if (!persistedState || typeof persistedState !== "object") {
					return {
						teams: [],
						queue: [],
						matchHistory: [],
						defendingTeam: null,
						matchDuration: DEFAULT_MATCH_DURATION,
					};
				}
				if (version < 1) {
					const legacyState = persistedState as Partial<PersistedGameState>;
					return {
						teams: legacyState.teams ?? [],
						queue: legacyState.queue ?? [],
						matchHistory: legacyState.matchHistory ?? [],
						defendingTeam: legacyState.defendingTeam ?? null,
						matchDuration: legacyState.matchDuration ?? DEFAULT_MATCH_DURATION,
					};
				}
				return persistedState as PersistedGameState;
			},
			onRehydrateStorage: () => (state, error) => {
				if (error) {
					console.error("Failed to rehydrate game store", error);
					return;
				}
				if (!state) {
					return;
				}
				const maxTeamId = state.teams.reduce(
					(max, team) => Math.max(max, team.id),
					0
				);
				const maxMatchId = state.matchHistory.reduce(
					(max, match) => Math.max(max, match.matchId),
					0
				);
				teamIdCounter = maxTeamId + 1;
				matchIdCounter = maxMatchId + 1;
				state.resetTimer();
			},
		}
	)
);
