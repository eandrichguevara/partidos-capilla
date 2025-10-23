import { useGameStore } from "@/store/gameStore";

/**
 * Hook para manejar la configuración del juego
 */
export const useSettings = () => {
	const matchDuration = useGameStore((state) => state.matchDuration);
	const setMatchDuration = useGameStore((state) => state.setMatchDuration);

	return {
		matchDuration,
		setMatchDuration,
	};
};
