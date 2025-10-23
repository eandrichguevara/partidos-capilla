import { useState } from "react";
import { useGameStore, type Team } from "@/store/gameStore";

/**
 * Hook para manejar la gestión de equipos
 */
export const useTeamManagement = () => {
	const [teamName, setTeamName] = useState("");
	const [editingTeam, setEditingTeam] = useState<Team | null>(null);
	const [newTeamName, setNewTeamName] = useState("");

	const teams = useGameStore((state) => state.teams);
	const addTeam = useGameStore((state) => state.addTeam);
	const editTeamName = useGameStore((state) => state.editTeamName);

	const handleAddTeam = () => {
		if (teamName.trim()) {
			addTeam(teamName.trim());
			setTeamName("");
		}
	};

	const handleEditTeam = (team: Team) => {
		setEditingTeam(team);
		setNewTeamName(team.name);
	};

	const handleSaveTeamName = () => {
		if (editingTeam && newTeamName.trim()) {
			editTeamName(editingTeam.id, newTeamName.trim());
			setEditingTeam(null);
			setNewTeamName("");
		}
	};

	return {
		teams,
		teamName,
		setTeamName,
		editingTeam,
		newTeamName,
		setNewTeamName,
		handleAddTeam,
		handleEditTeam,
		handleSaveTeamName,
	};
};
