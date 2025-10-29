"use client";

import { useState, useEffect } from "react";

// Features
import { CurrentMatchCard, useCurrentMatch } from "@/features/match";
import { QueueCard, useQueue } from "@/features/queue";
import { LeaderboardCard, useLeaderboard } from "@/features/leaderboard";
import { TeamManagementCard, useTeamManagement } from "@/features/teams";
import { SettingsCard, useSettings } from "@/features/settings";
import { MatchHistoryCard, useMatchHistory } from "@/features/history";
import {
	TournamentResults,
	ConfirmEndTournamentModal,
	EndTournamentButton,
	TiebreakModal,
	useTournament,
} from "@/features/tournament";

// Components
import { InfoModal, InfoButton } from "@/components/InfoModal";

export default function HomePage() {
	const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

	// Precargar modelos de IA al montar el componente
	useEffect(() => {
		// Llamada silenciosa para inicializar los modelos
		fetch("/api/logoAssignment", {
			method: "GET",
		}).catch(() => {
			// Ignorar errores en la precarga
		});
	}, []);

	// Hooks de features
	const matchData = useCurrentMatch();
	const { queue } = useQueue();
	const { leaderboard } = useLeaderboard();
	const teamManagement = useTeamManagement();
	const settings = useSettings();
	const history = useMatchHistory();
	const tournament = useTournament();

	return (
		<div className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4 font-sans w-full max-w-md mx-auto">
			<div className="mb-6 flex items-center justify-center gap-3">
				<h1 className="text-4xl font-bold">Gol y te quedas</h1>
				<InfoButton onClick={() => setIsInfoModalOpen(true)} />
			</div>

			{/* Current Match */}
			<CurrentMatchCard
				currentMatch={matchData.currentMatch}
				defendingTeam={matchData.defendingTeam}
				timeLeft={matchData.timeLeft}
				isTimerRunning={matchData.isTimerRunning}
				fullDurationSeconds={matchData.fullDurationSeconds}
				onStartTimer={matchData.startTimer}
				onPauseTimer={matchData.pauseTimer}
				onResetTimer={matchData.resetTimer}
				onWin={matchData.handleWin}
			/>

			{/* Queue */}
			<QueueCard queue={queue} />

			{/* Team Management */}
			<TeamManagementCard
				teams={teamManagement.teams}
				teamName={teamManagement.teamName}
				onTeamNameChange={teamManagement.setTeamName}
				onAddTeam={teamManagement.handleAddTeam}
				editingTeam={teamManagement.editingTeam}
				newTeamName={teamManagement.newTeamName}
				onNewTeamNameChange={teamManagement.setNewTeamName}
				onEditTeam={teamManagement.handleEditTeam}
				onSaveTeamName={teamManagement.handleSaveTeamName}
				isAssigningLogo={teamManagement.isAssigningLogo}
			/>

			{/* Settings */}
			<SettingsCard
				matchDuration={settings.matchDuration}
				onSetMatchDuration={settings.setMatchDuration}
			/>

			{/* Match History */}
			<MatchHistoryCard
				orderedHistory={history.orderedHistory}
				teamOptions={history.teamOptions}
				getTeamName={history.getTeamName}
				editingMatchId={history.editingMatchId}
				editWinnerId={history.editWinnerId}
				onEditWinnerIdChange={history.setEditWinnerId}
				editLoserId={history.editLoserId}
				onEditLoserIdChange={history.setEditLoserId}
				editReason={history.editReason}
				onEditReasonChange={history.setEditReason}
				onStartEditMatch={history.handleStartEditMatch}
				onCancelMatchEdit={history.handleCancelMatchEdit}
				onSwapParticipants={history.handleSwapParticipants}
				onSaveMatchEdit={history.handleSaveMatchEdit}
				onDeleteMatch={history.handleDeleteMatch}
			/>

			{/* Leaderboard */}
			<LeaderboardCard leaderboard={leaderboard} />

			{/* Tournament End Section */}
			<div className="w-full mb-6 flex justify-center">
				<EndTournamentButton
					onClick={tournament.handleOpenResults}
					disabled={!tournament.canFinish}
				/>
			</div>

			<div className="text-xs text-gray-500">
				<p>Creado, diseñado y desarrollado por Emilio Andrich.</p>
			</div>

			{/* Info Modal */}
			<InfoModal
				isOpen={isInfoModalOpen}
				onClose={() => setIsInfoModalOpen(false)}
			/>

			{/* Tournament Results Modal */}
			{tournament.showResults && tournament.champion && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
					onClick={tournament.handleCloseResults}
				>
					<div
						className="relative max-w-md w-full"
						onClick={(e) => e.stopPropagation()}
					>
						<TournamentResults
							champion={tournament.champion}
							podium={tournament.podium}
						/>
						<div className="mt-4 flex flex-col gap-2 w-full">
							<button
								onClick={tournament.handleShare}
								className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-3 rounded-lg transition flex items-center justify-center gap-2"
							>
								📱 Compartir en WhatsApp
							</button>
							<button
								onClick={tournament.handleOpenConfirmModal}
								className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition"
							>
								🗑️ Reiniciar Torneo
							</button>
							<button
								onClick={tournament.handleCloseResults}
								className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-3 rounded-lg transition"
							>
								Cerrar
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Confirm End Tournament Modal */}
			<ConfirmEndTournamentModal
				isOpen={tournament.showConfirmModal}
				onConfirm={tournament.handleFinishTournament}
				onCancel={tournament.handleCloseConfirmModal}
			/>

			{/* Tiebreak Modal */}
			<TiebreakModal
				isOpen={tournament.showTiebreakModal}
				tiedTeams={tournament.tiedTeams}
				onSelectWinner={tournament.handleSelectTiebreakerWinner}
				onCancel={tournament.handleCloseTiebreakModal}
			/>
		</div>
	);
}
