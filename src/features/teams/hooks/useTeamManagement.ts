import { useState } from "react";
import { useGameStore, type Team } from "@/store/gameStore";
import { fetchLogoVectors, findTopMatches, fetchLogoDatabase, simpleKeywordMatch } from "@/lib/logoMatching";

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
	const deleteTeam = useGameStore((state) => state.deleteTeam);

	const handleAddTeam = async () => {
		if (teamName.trim()) {
			setIsAssigningLogo(true);
			const name = teamName.trim();
			let logoPath: string | undefined;

			// 1) Intentar client-side: obtener vectores y calcular embedding en el navegador
			try {
				const logos = await fetchLogoVectors();
				// Si no hay logos, lanzar para caer al fallback
				if (!logos || logos.length === 0) throw new Error("No logo vectors available");

				// import client embedding helper dynamically (may fail in some dev bundlers)
				try {
					const mod = await import("@/lib/clientEmbeddings");
					const emb = await mod.getClientEmbedding(name);
					const top = findTopMatches(emb, logos, 1);
					if (top && top.length > 0 && typeof top[0].score === "number") {
						// Usamos el match cliente si la similitud es positiva (evita usar matches inútiles)
						if (top[0].score > 0) {
							logoPath = top[0].path;
						} else {
							console.debug("Cliente: mejor match no tiene score positivo, se hará fallback a keyword match", top[0]);
						}
					}
				} catch (innerErr) {
					console.warn("No fue posible inicializar pipeline de embeddings en cliente desde handleAddTeam:", innerErr);
					// fallthrough a keyword match below
					throw innerErr;
				}
			} catch (err) {
				console.warn("Client-side embedding/matching falló, se intentará fallback por keywords:", err);

				try {
					const db = await fetchLogoDatabase();
					const best = simpleKeywordMatch(name, db);
					if (best && best.path) {
						logoPath = best.path;
					}
				} catch (kwErr) {
					console.warn("Fallback por keywords también falló:", kwErr);
				}
			}

			// Agregar equipo (puede ser con logoPath indefinido si el cliente no produjo un match)
			try {
				await addTeam(name, logoPath);
			} catch (err) {
				console.error("Error agregando equipo al store:", err);
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

	const handleDeleteTeam = (teamId: number) => {
		if (
			confirm(
				"¿Estás seguro de que deseas eliminar este equipo? Se eliminarán también todos sus partidos."
			)
		) {
			deleteTeam(teamId);
			// Si estábamos editando este equipo, cancelar la edición
			if (editingTeam?.id === teamId) {
				setEditingTeam(null);
				setNewTeamName("");
			}
		}
	};

	const handleCancelEditTeam = () => {
		setEditingTeam(null);
		setNewTeamName("");
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
		handleDeleteTeam,
		isAssigningLogo,
		handleCancelEditTeam,
	};
};
