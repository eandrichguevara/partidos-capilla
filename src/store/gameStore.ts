import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Team, MatchResult } from "@/domain/types";
import { pickContrastingColor, extractDominantColor } from "@/domain/colors";
import { calculateLeaderboard } from "@/domain/leaderboard";
import { deriveTournamentState } from "@/domain/tournament/stateDerivator";
import { getRandomFont } from "@/domain/fonts";

export type { Team, MatchResult } from "@/domain/types";

const DEFAULT_MATCH_DURATION = 5;

const createInitialDataState = () => ({
	teams: [] as Team[],
	matchHistory: [] as MatchResult[],
	matchDuration: DEFAULT_MATCH_DURATION,
	timeLeft: DEFAULT_MATCH_DURATION * 60,
	isTimerRunning: false,
});

interface GameState {
	teams: Team[];
	matchHistory: MatchResult[];
	matchDuration: number; // in minutes
	timeLeft: number;
	isTimerRunning: boolean;
	setMatchDuration: (duration: number) => void;
	addTeam: (name: string, logo?: string) => Promise<void>;
	editTeamName: (id: number, newName: string) => void;
	deleteTeam: (id: number) => void;
	updateTeamColor: (id: number, color: string) => void;
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
	addTiebreaker: (winnerId: number, loserId: number) => void;
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
	"teams" | "matchHistory" | "matchDuration"
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

			addTeam: async (name, logo) => {
				const state = get();
				let color = pickContrastingColor(state.teams.map((team) => team.color));

				// Si hay logo, intentar extraer el color dominante
				if (logo && typeof window !== "undefined") {
					try {
						const extractedColor = await extractDominantColor(logo);
						color = extractedColor;
					} catch (error) {
						console.warn(
							"No se pudo extraer el color del logo, usando color contrastante",
							error
						);
						// Continuar con el color contrastante por defecto
					}
				}

				const selectedFont = getRandomFont();
				const newTeam: Team = {
					id: teamIdCounter++,
					name,
					color,
					logo,
					font: selectedFont.id,
				};

				set((state) => ({
					teams: [...state.teams, newTeam],
				}));
			},

			editTeamName: (id, newName) => {
				const update = (team: Team) =>
					team.id === id ? { ...team, name: newName } : team;
				set((state) => ({
					teams: state.teams.map(update),
				}));
			},

			deleteTeam: (id) => {
				set((state) => ({
					teams: state.teams.filter((team) => team.id !== id),
					// Eliminar también los partidos donde participó el equipo
					matchHistory: state.matchHistory.filter(
						(match) => match.winnerId !== id && match.loserId !== id
					),
				}));
			},

			updateTeamColor: (id, color) => {
				set((state) => ({
					teams: state.teams.map((team) =>
						team.id === id ? { ...team, color } : team
					),
				}));
			},

			endMatch: (winnerId, reason) => {
				set((state) => {
					const derived = deriveTournamentState(
						state.teams,
						state.matchHistory
					);
					if (!derived.currentMatch) return {};

					// Determine winner and loser from current match
					const winner =
						derived.currentMatch.team1.id === winnerId
							? derived.currentMatch.team1
							: derived.currentMatch.team2;
					const loser =
						derived.currentMatch.team1.id === winnerId
							? derived.currentMatch.team2
							: derived.currentMatch.team1;

					const newMatchHistory = [
						...state.matchHistory,
						{
							matchId: matchIdCounter++,
							winnerId: winner.id,
							loserId: loser.id,
							reason,
						},
					];

					return {
						matchHistory: newMatchHistory,
						timeLeft: state.matchDuration * 60,
						isTimerRunning: false,
					};
				});
			},

			startTimer: () =>
				set((state) => {
					const derived = deriveTournamentState(
						state.teams,
						state.matchHistory
					);
					if (!derived.currentMatch || state.timeLeft === 0) {
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

			addTiebreaker: (winnerId, loserId) =>
				set((state) => {
					const newMatchHistory = [
						...state.matchHistory,
						{
							matchId: matchIdCounter++,
							winnerId,
							loserId,
							reason: "tiebreaker" as const,
						},
					];
					return { matchHistory: newMatchHistory };
				}),

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
				matchHistory: state.matchHistory,
				matchDuration: state.matchDuration,
			}),
			migrate: (persistedState: unknown, version) => {
				if (!persistedState || typeof persistedState !== "object") {
					return {
						teams: [],
						matchHistory: [],
						matchDuration: DEFAULT_MATCH_DURATION,
					};
				}
				if (version < 1) {
					const legacyState = persistedState as Partial<PersistedGameState>;
					return {
						teams: legacyState.teams ?? [],
						matchHistory: legacyState.matchHistory ?? [],
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

// Selectors for derived state
export const useTournamentState = () => {
	const matchHistory = useGameStore((state) => state.matchHistory);
	const teams = useGameStore((state) => state.teams);
	return deriveTournamentState(teams, matchHistory);
};

export const useDefendingTeam = () => {
	const matchHistory = useGameStore((state) => state.matchHistory);
	const teams = useGameStore((state) => state.teams);
	return deriveTournamentState(teams, matchHistory).defendingTeam;
};

export const useQueue = () => {
	const matchHistory = useGameStore((state) => state.matchHistory);
	const teams = useGameStore((state) => state.teams);
	return deriveTournamentState(teams, matchHistory).queue;
};

export const useCurrentMatch = () => {
	const matchHistory = useGameStore((state) => state.matchHistory);
	const teams = useGameStore((state) => state.teams);
	return deriveTournamentState(teams, matchHistory).currentMatch;
};
