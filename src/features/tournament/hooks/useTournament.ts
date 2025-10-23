import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import {
	getTournamentWinner,
	getPodium,
	isValidTournament,
} from "@/domain/tournament";

export const useTournament = () => {
	const [showResults, setShowResults] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);

	const { matchHistory, resetStore, getLeaderboard } = useGameStore();

	const leaderboard = getLeaderboard();
	const champion = getTournamentWinner(leaderboard);
	const podium = getPodium(leaderboard);
	const canFinish = isValidTournament(matchHistory.length);

	const handleOpenResults = () => {
		if (!canFinish) {
			alert(
				"⚽ El torneo necesita al menos 3 equipos y 3 partidos jugados para poder finalizar."
			);
			return;
		}
		setShowResults(true);
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

			// Usar html-to-image para capturar el elemento
			const dataUrl = await toPng(element, {
				quality: 1,
				pixelRatio: 2,
				backgroundColor: "#312e81",
				cacheBust: true,
				skipFonts: false,
				canvasWidth: element.offsetWidth * 2,
				canvasHeight: element.offsetHeight * 2,
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
		champion,
		podium,
		canFinish,
		handleOpenResults,
		handleCloseResults,
		handleOpenConfirmModal,
		handleCloseConfirmModal,
		handleFinishTournament,
		handleShare,
	};
};
