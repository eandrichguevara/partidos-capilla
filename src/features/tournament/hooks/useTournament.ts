import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import {
	getTournamentWinner,
	getPodium,
	isValidTournament,
	detectTieForFirst,
	getTotalWinsByGoal,
} from "@/domain/tournament";
import type { LeaderboardEntry } from "@/domain/types";

export const useTournament = () => {
	const [showResults, setShowResults] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [showTiebreakModal, setShowTiebreakModal] = useState(false);
	const [tiedTeams, setTiedTeams] = useState<LeaderboardEntry[]>([]);

	const { matchHistory, resetStore, getLeaderboard, addTiebreaker } =
		useGameStore();

	const leaderboard = getLeaderboard();
	const champion = getTournamentWinner(leaderboard);
	const podium = getPodium(leaderboard);
	const canFinish = isValidTournament(matchHistory.length);
	const totalWinsByGoal = getTotalWinsByGoal(matchHistory);

	const handleOpenResults = () => {
		if (!canFinish) {
			alert(
				"⚽ El torneo necesita al menos 3 equipos y 3 partidos jugados para poder finalizar."
			);
			return;
		}

		// Verificar si hay empate
		const tieResult = detectTieForFirst(leaderboard);
		if (tieResult.isTied) {
			setTiedTeams(tieResult.teams);
			setShowTiebreakModal(true);
		} else {
			setShowResults(true);
		}
	};

	const handleCloseTiebreakModal = () => {
		setShowTiebreakModal(false);
		setTiedTeams([]);
	};

	const handleSelectTiebreakerWinner = (winnerId: number) => {
		// Encontrar el perdedor (el otro equipo empatado)
		const loserId = tiedTeams.find((t) => t.team.id !== winnerId)?.team.id;

		if (loserId) {
			addTiebreaker(winnerId, loserId);
			setShowTiebreakModal(false);
			setTiedTeams([]);
			// Después de resolver el empate, mostrar los resultados
			setShowResults(true);
		}
	};

	const handleCloseResults = () => {
		setShowResults(false);
	};

	const handleOpenConfirmModal = () => {
		setShowConfirmModal(true);
	};

	const handleCloseConfirmModal = () => {
		setShowConfirmModal(false);
	};

	const handleFinishTournament = () => {
		resetStore();
		setShowConfirmModal(false);
		setShowResults(false);
	};

	const handleShare = async () => {
		try {
			const element = document.getElementById("tournament-results");
			if (!element) {
				console.error("No se encontró el elemento de resultados");
				return;
			}

			// Importación dinámica solo en el cliente
			const { toPng } = await import("html-to-image");

			// Obtener dimensiones del elemento incluyendo todo su contenido
			const scrollHeight = element.scrollHeight;
			const scrollWidth = element.scrollWidth;

			// Usar html-to-image para capturar el elemento
			const dataUrl = await toPng(element, {
				quality: 1,
				pixelRatio: 2,
				backgroundColor: "#312e81",
				cacheBust: true,
				skipFonts: false,
				width: scrollWidth,
				height: scrollHeight,
				canvasWidth: scrollWidth * 2,
				canvasHeight: scrollHeight * 2,
			});

			// Convertir data URL a blob
			const response = await fetch(dataUrl);
			const blob = await response.blob();

			const file = new File([blob], "resultados-torneo.png", {
				type: "image/png",
			});

			// Intentar usar Web Share API (funciona en móviles)
			if (navigator.share && navigator.canShare({ files: [file] })) {
				await navigator.share({
					title: "🏆 Resultados del Torneo",
					text: `¡${champion?.team.name} es el campeón! 🎉`,
					files: [file],
				});
			} else {
				// Fallback: descargar la imagen
				const link = document.createElement("a");
				link.href = dataUrl;
				link.download = "resultados-torneo.png";
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);

				alert(
					"📥 Imagen descargada. Puedes compartirla manualmente en WhatsApp."
				);
			}
		} catch (error) {
			console.error("Error al compartir:", error);
			alert("❌ No se pudo compartir la imagen. Intenta de nuevo.");
		}
	};

	return {
		showResults,
		showConfirmModal,
		showTiebreakModal,
		tiedTeams,
		champion,
		podium,
		totalWinsByGoal,
		canFinish,
		handleOpenResults,
		handleCloseResults,
		handleOpenConfirmModal,
		handleCloseConfirmModal,
		handleFinishTournament,
		handleShare,
		handleCloseTiebreakModal,
		handleSelectTiebreakerWinner,
	};
};
