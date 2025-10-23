import { useGameStore } from "@/store/gameStore";

/**
 * Hook para manejar la cola de equipos
 */
export const useQueue = () => {
	const queue = useGameStore((state) => state.queue);

	return {
		queue,
	};
};
