import { useState } from "react";
import { useGameStore, type Team } from "@/store/gameStore";

/**
 * Hook para manejar la gestión de equipos
 */
export const useTeamManagement = () => {
	const [teamName, setTeamName] = useState("");
	const [editingTeam, setEditingTeam] = useState<Team | null>(null);
	const [newTeamName, setNewTeamName] = useState("");
	const [isAssigningLogo, setIsAssigningLogo] = useState(false);

	const teams = useGameStore((state) => state.teams);
	const addTeam = useGameStore((state) => state.addTeam);
	const editTeamName = useGameStore((state) => state.editTeamName);

	const handleAddTeam = async () => {
		if (teamName.trim()) {
			setIsAssigningLogo(true);
			try {
				// Llamar a la API para obtener el logo sugerido
				const response = await fetch("/api/logoAssignment", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ teamName: teamName.trim() }),
				});

				let logoPath: string | undefined;
				if (response.ok) {
					const result = await response.json();
					logoPath = result.path;
				}

				// Agregar equipo con el logo asignado
				addTeam(teamName.trim(), logoPath);
			} catch (error) {
				// Si falla la API, agregar sin logo
				console.error("Error al asignar logo:", error);
				addTeam(teamName.trim());
			} finally {
				setIsAssigningLogo(false);
				setTeamName("");
			}
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
		isAssigningLogo,
	};
};
