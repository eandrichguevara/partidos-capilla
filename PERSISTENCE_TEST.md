# Persistence Test Verification

## Test Scenario: After 3 Matches

### State Before Reload

After these matches:

1. A beats B
2. A beats C
3. B beats A

**Persisted Data (localStorage):**

```json
{
	"teams": [
		{ "id": 1, "name": "A", "color": "#..." },
		{ "id": 2, "name": "B", "color": "#..." },
		{ "id": 3, "name": "C", "color": "#..." }
	],
	"matchHistory": [
		{ "matchId": 1, "winnerId": 1, "loserId": 2, "reason": "goal" },
		{ "matchId": 2, "winnerId": 1, "loserId": 3, "reason": "goal" },
		{ "matchId": 3, "winnerId": 2, "loserId": 1, "reason": "goal" }
	],
	"matchDuration": 5
}
```

### Expected Derived State After Reload

Using `deriveTournamentState(teams, matchHistory)`:

1. **defendingTeam**: B (winner of last match)
2. **queue**: [A] (waiting teams only, C is playing)
3. **currentMatch**: {team1: B, team2: C}

### Derivation Logic Trace

1. Last match winner = B → `defender = B`
2. All teams have lost: loserIds = {1, 2, 3}
3. Teams never lost = [] (all have lost)
4. Loop through history [0, 1]:
   - Match 0: loser = B (skip, B is defender)
   - Match 1: loser = C (add to queue) → queue = [C]
5. Add most recent loser: A → queue = [C, A]
6. Challenger = C (first in queue)
7. Final queue = [A] (remove C who is playing)
8. Current match = {B, C}

### How to Test

1. Open app with dev tools
2. Add teams A, B, C
3. Play matches: A wins, A wins, B wins
4. Open localStorage in dev tools
5. Verify only teams, matchHistory, matchDuration are stored
6. Reload page (F5)
7. Verify derived state matches:
   - Defending team badge shows "B"
   - Current match shows "B vs C"
   - Queue shows only "A" waiting

### Success Criteria

✅ No queue, defendingTeam, or currentMatch in localStorage
✅ After reload, UI shows correct defender (B)
✅ After reload, UI shows correct match (B vs C)
✅ After reload, UI shows correct queue ([A])
✅ State is identical before and after reload
