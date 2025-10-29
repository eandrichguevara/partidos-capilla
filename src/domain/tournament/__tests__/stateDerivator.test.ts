import { deriveTournamentState } from "../stateDerivator";
import type { Team, MatchResult } from "@/domain/types";

describe("deriveTournamentState", () => {
	describe("Clean start (no match history)", () => {
		it("should return empty state with no teams", () => {
			const result = deriveTournamentState([], []);

			expect(result.defendingTeam).toBeNull();
			expect(result.queue).toEqual([]);
			expect(result.currentMatch).toBeNull();
		});

		it("should return single team in queue with 1 team", () => {
			const teams: Team[] = [{ id: 1, name: "A", color: "#FF0000" }];
			const result = deriveTournamentState(teams, []);

			expect(result.defendingTeam).toBeNull();
			expect(result.queue).toEqual(teams);
			expect(result.currentMatch).toBeNull();
		});

		it("should create initial match with 3 teams (A, B, C)", () => {
			const teams: Team[] = [
				{ id: 1, name: "A", color: "#FF0000" },
				{ id: 2, name: "B", color: "#00FF00" },
				{ id: 3, name: "C", color: "#0000FF" },
			];
			const result = deriveTournamentState(teams, []);

			// Queue should be [C]
			expect(result.queue).toHaveLength(1);
			expect(result.queue[0].name).toBe("C");

			// Current match should be A vs B
			expect(result.currentMatch).not.toBeNull();
			expect(result.currentMatch?.team1.name).toBe("A");
			expect(result.currentMatch?.team2.name).toBe("B");

			// No defending team yet
			expect(result.defendingTeam).toBeNull();
		});
	});

	describe("After first match", () => {
		it("should set winner as defender and loser goes to back of queue", () => {
			const teams: Team[] = [
				{ id: 1, name: "A", color: "#FF0000" },
				{ id: 2, name: "B", color: "#00FF00" },
				{ id: 3, name: "C", color: "#0000FF" },
			];

			// A wins first match
			const matchHistory: MatchResult[] = [
				{ matchId: 1, winnerId: 1, loserId: 2, reason: "goal" },
			];

			const result = deriveTournamentState(teams, matchHistory);

			// Defender should be A
			expect(result.defendingTeam?.name).toBe("A");

			// Queue should be [B] (loser goes to back)
			expect(result.queue).toHaveLength(1);
			expect(result.queue[0].name).toBe("B");

			// Current match should be A vs C (defender vs next in queue)
			expect(result.currentMatch?.team1.name).toBe("A");
			expect(result.currentMatch?.team2.name).toBe("C");
		});
	});

	describe("Complex scenario", () => {
		it("should correctly rebuild state after multiple matches", () => {
			const teams: Team[] = [
				{ id: 1, name: "A", color: "#FF0000" },
				{ id: 2, name: "B", color: "#00FF00" },
				{ id: 3, name: "C", color: "#0000FF" },
				{ id: 4, name: "D", color: "#FFFF00" },
			];

			// Match 1: A beats B
			// Match 2: A beats C
			// Match 3: A beats D
			const matchHistory: MatchResult[] = [
				{ matchId: 1, winnerId: 1, loserId: 2, reason: "goal" },
				{ matchId: 2, winnerId: 1, loserId: 3, reason: "goal" },
				{ matchId: 3, winnerId: 1, loserId: 4, reason: "goal" },
			];

			const result = deriveTournamentState(teams, matchHistory);

			// A is still defending
			expect(result.defendingTeam?.name).toBe("A");

			// Queue should be [B, C, D] (oldest loser first)
			expect(result.queue).toHaveLength(2);
			expect(result.queue[0].name).toBe("B");
			expect(result.queue[1].name).toBe("C");

			// Current match should be A vs D (defender vs most recent loser)
			expect(result.currentMatch?.team1.name).toBe("A");
			expect(result.currentMatch?.team2.name).toBe("D");
		});
	});
});
