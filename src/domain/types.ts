export interface Team {
	id: number;
	name: string;
	color: string;
}

export interface MatchResult {
	matchId: number;
	winnerId: number;
	loserId: number;
	reason: "goal" | "timeout";
}

export interface CurrentMatch {
	team1: Team;
	team2: Team;
}

export interface LeaderboardEntry {
	team: Team;
	points: number;
	winsByGoal: number;
	winsByTimeout: number;
	losses: number;
	gamesPlayed: number;
}
