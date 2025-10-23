"use client";

import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

const Timer = () => {
	const timeLeft = useGameStore((state) => state.timeLeft);
	const isTimerRunning = useGameStore((state) => state.isTimerRunning);
	const currentMatch = useGameStore((state) => state.currentMatch);
	const decrementTimer = useGameStore((state) => state.decrementTimer);

	useEffect(() => {
		if (!isTimerRunning || !currentMatch) {
			return;
		}

		const interval = setInterval(() => {
			decrementTimer();
		}, 1000);

		return () => clearInterval(interval);
	}, [isTimerRunning, currentMatch, decrementTimer]);

	const minutes = Math.floor(timeLeft / 60);
	const seconds = timeLeft % 60;

	return (
		<div className="text-6xl font-bold">
			{minutes}:{seconds < 10 ? `0${seconds}` : seconds}
		</div>
	);
};

export default Timer;
