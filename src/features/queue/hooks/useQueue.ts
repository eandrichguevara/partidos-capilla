import { useQueue as useQueueDerived } from "@/store/gameStore";

/**
 * Hook para manejar la cola de equipos
 */
export const useQueue = () => {
	const queue = useQueueDerived();

	return {
		queue,
	};
};
