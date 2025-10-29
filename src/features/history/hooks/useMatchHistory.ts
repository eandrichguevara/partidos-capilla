import { useState, useMemo } from "react";
import { useGameStore, type MatchResult } from "@/store/gameStore";

/**
 * Hook para manejar el historial de partidos
 */
export const useMatchHistory = () => {
	const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
	const [editWinnerId, setEditWinnerId] = useState<number | null>(null);
	const [editLoserId, setEditLoserId] = useState<number | null>(null);
	const [editReason, setEditReason] = useState<
		"goal" | "timeout" | "tiebreaker"
	>("goal");

	const teams = useGameStore((state) => state.teams);
	const matchHistory = useGameStore((state) => state.matchHistory);
	const updateMatchResult = useGameStore((state) => state.updateMatchResult);
	const deleteMatchResult = useGameStore((state) => state.deleteMatchResult);

	const teamNameById = useMemo(() => {
		const nameMap = new Map<number, string>();
		teams.forEach((team) => {
			nameMap.set(team.id, team.name);
		});
		matchHistory.forEach((match) => {
			if (!nameMap.has(match.winnerId)) {
				nameMap.set(match.winnerId, `Equipo ${match.winnerId}`);
			}
			if (!nameMap.has(match.loserId)) {
				nameMap.set(match.loserId, `Equipo ${match.loserId}`);
			}
		});
		return nameMap;
	}, [teams, matchHistory]);

	const teamOptions = useMemo(
		() =>
			Array.from(teamNameById.entries()).map(([id, name]) => ({
				id,
				name,
			})),
		[teamNameById]
	);

	const orderedHistory = useMemo(
		() => [...matchHistory].sort((a, b) => b.matchId - a.matchId),
		[matchHistory]
	);

	const getTeamName = (id: number) => teamNameById.get(id) ?? `Equipo ${id}`;

	const handleStartEditMatch = (match: MatchResult) => {
		setEditingMatchId(match.matchId);
		setEditWinnerId(match.winnerId);
		setEditLoserId(match.loserId);
		setEditReason(match.reason);
	};

	const handleCancelMatchEdit = () => {
		setEditingMatchId(null);
		setEditWinnerId(null);
		setEditLoserId(null);
		setEditReason("goal");
	};

	const handleSwapParticipants = () => {
		if (editWinnerId !== null && editLoserId !== null) {
			setEditWinnerId(editLoserId);
			setEditLoserId(editWinnerId);
		}
	};

	const canSaveMatchEdit =
		editingMatchId !== null &&
		editWinnerId !== null &&
		editLoserId !== null &&
		editWinnerId !== editLoserId;

	const handleSaveMatchEdit = () => {
		if (!canSaveMatchEdit || editingMatchId === null) {
			return;
		}
		if (editWinnerId === null || editLoserId === null) {
			return;
		}
		updateMatchResult(editingMatchId, {
			winnerId: editWinnerId,
			loserId: editLoserId,
			reason: editReason,
		});
		handleCancelMatchEdit();
	};

	const handleDeleteMatch = (matchId: number) => {
		deleteMatchResult(matchId);
		if (editingMatchId === matchId) {
			handleCancelMatchEdit();
		}
	};

	return {
		orderedHistory,
		teamOptions,
		getTeamName,
		editingMatchId,
		editWinnerId,
		setEditWinnerId,
		editLoserId,
		setEditLoserId,
		editReason,
		setEditReason,
		handleStartEditMatch,
		handleCancelMatchEdit,
		handleSwapParticipants,
		handleSaveMatchEdit,
		handleDeleteMatch,
		canSaveMatchEdit,
	};
};
