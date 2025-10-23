"use client";

import { useState, useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

// Features
import { CurrentMatchCard, useCurrentMatch } from "@/features/match";
import { QueueCard, useQueue } from "@/features/queue";
import { LeaderboardCard, useLeaderboard } from "@/features/leaderboard";
import { TeamManagementCard, useTeamManagement } from "@/features/teams";
import { SettingsCard, useSettings } from "@/features/settings";
import { MatchHistoryCard, useMatchHistory } from "@/features/history";

// Components
import { InfoModal, InfoButton } from "@/components/InfoModal";

export default function HomePage() {
	const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

	// Hooks de features
	const matchData = useCurrentMatch();
	const { queue } = useQueue();
	const { leaderboard } = useLeaderboard();
	const teamManagement = useTeamManagement();
	const settings = useSettings();
	const history = useMatchHistory();

	// Estado global
	const currentMatch = useGameStore((state) => state.currentMatch);
	const defendingTeam = useGameStore((state) => state.defendingTeam);
	const startNextMatch = useGameStore((state) => state.startNextMatch);

	// Auto-iniciar partido cuando hay suficientes equipos
	useEffect(() => {
		if (
			!currentMatch &&
			(queue.length >= 2 || (defendingTeam && queue.length >= 1))
		) {
			startNextMatch();
		}
	}, [currentMatch, defendingTeam, queue, startNextMatch]);

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

			<div className="text-xs text-gray-500">
				<p>Creado, diseñado y desarrollado por Emilio Andrich.</p>
			</div>

			{/* Info Modal */}
			<InfoModal
				isOpen={isInfoModalOpen}
				onClose={() => setIsInfoModalOpen(false)}
			/>
		</div>
	);
}
