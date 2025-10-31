import { useState } from "react";
import { useGameStore, type Team } from "@/store/gameStore";
import {
	fetchLogoVectors,
	findTopMatches,
	fetchLogoDatabase,
	simpleKeywordMatch,
} from "@/lib/logoMatching";

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
				if (!logos || logos.length === 0)
					throw new Error("No logo vectors available");

				// import client embedding helper dynamically (may fail in some dev bundlers)
				try {
					const mod = await import("@/lib/clientEmbeddings");

					// Wrap embedding initialization in a timeout so the UI doesn't hang
					// if the library or model download gets stuck. If it times out or fails,
					// we fallthrough to the keyword fallback handled by the outer catch.
					const timeoutMs = 5000;
					let emb: number[];
					try {
						emb = (await Promise.race([
							mod.getClientEmbedding(name),
							new Promise((_res, rej) =>
								setTimeout(() => rej(new Error("embedding timeout")), timeoutMs)
							),
						])) as number[];
					} catch (embErr) {
						console.warn(
							"Cliente: getClientEmbedding falló o expiró (se usará fallback de keywords):",
							embErr
						);
						// Re-throw para que el catch exterior capture y use el fallback por keywords
						throw embErr;
					}

					// pedir los top 3 para poder desempatar mejor
					// Intentar cargar la base de datos para que findTopMatches pueda aplicar
					// exclusions y negativeKeywords (si falla, seguimos sin ella)
					let dbForMatching;
					try {
						dbForMatching = await fetchLogoDatabase();
					} catch (dbErr) {
						console.warn(
							"No se pudo cargar logo database para aplicar exclusions/negativeKeywords:",
							dbErr
						);
					}

					const tops = findTopMatches(emb, logos, 3, {
						teamName: name,
						database: dbForMatching,
					});
					const top1 = tops[0];

					if (top1 && typeof top1.score === "number") {
						console.debug(
							"Cliente: Entramos en la regla ajustada para el mejor match por embedding"
						);
						// Regla ajustada: si el mejor match por embeddings tiene score > 0,
						// lo consideramos concluyente y lo usamos.
						if (top1.score > 0) {
							console.debug(
								"Cliente: aceptando match por embedding (score > 0)",
								top1
							);
							logoPath = top1.path;
						} else {
							console.debug(
								"Cliente: embedding no positivo, intentando fallback por keywords",
								tops
							);
							try {
								const db = await fetchLogoDatabase();
								const bestKw = simpleKeywordMatch(name, db);
								// Usar el mejor por keywords sólo si tiene coincidencia real (score >= 1)
								if (
									bestKw &&
									bestKw.path &&
									typeof bestKw.score === "number" &&
									bestKw.score >= 1
								) {
									console.debug(
										"Cliente: usando keyword match como desempate (embedding <= 0)",
										bestKw
									);
									logoPath = bestKw.path;
								} else {
									console.debug(
										"Cliente: embedding no concluyente y keywords no decisivas"
									);
								}
							} catch (kwErr) {
								console.warn(
									"Fallback por keywords falló durante decision híbrida:",
									kwErr
								);
							}
						}
					}
				} catch (innerErr) {
					console.warn(
						"No fue posible inicializar pipeline de embeddings en cliente desde handleAddTeam:",
						innerErr
					);
					// fallthrough a keyword match below
					throw innerErr;
				}
			} catch (err) {
				console.warn(
					"Client-side embedding/matching falló, se intentará fallback por keywords:",
					err
				);

				try {
					const db = await fetchLogoDatabase();
					const best = simpleKeywordMatch(name, db);
					// Asignar el mejor por keywords sólo si tiene coincidencia real (score >= 1)
					if (
						best &&
						best.path &&
						typeof best.score === "number" &&
						best.score >= 1
					) {
						logoPath = best.path;
					} else {
						console.debug(
							"Fallback por keywords no determinante, no se asignará logo automáticamente",
							best
						);
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
