import type { Team } from "./types";

/**
 * Actualiza un equipo en la cola (por ejemplo, cambiar nombre)
 */
export const updateTeamInQueue = (
	queue: Team[],
	teamId: number,
	updater: (team: Team) => Team
): Team[] => {
	return queue.map((team) => (team.id === teamId ? updater(team) : team));
};

/**
 * Agrega un equipo a la cola
 */
export const addTeamToQueue = (queue: Team[], team: Team): Team[] => {
	return [...queue, team];
};

/**
 * Remueve un equipo de la cola
 */
export const removeTeamFromQueue = (queue: Team[], teamId: number): Team[] => {
	return queue.filter((team) => team.id !== teamId);
};
