"use client";

import { useEffect, useMemo, useState } from "react";
import { useGameStore, Team, MatchResult } from "@/store/gameStore";
import Timer from "@/components/Timer";
import {
	FaPause,
	FaPlay,
	FaStop,
	FaFutbol,
	FaUsers,
	FaListOl,
	FaMedal,
	FaClock,
	FaThumbsDown,
	FaQuestionCircle,
	FaShieldAlt,
	FaTrophy,
	FaRedoAlt,
	FaPlusCircle,
	FaStopwatch,
	FaFlagCheckered,
	FaInfoCircle,
	FaBullseye,
} from "react-icons/fa";
import type { IconType } from "react-icons";

interface LeaderboardEntry {
	team: Team;
	points: number;
	winsByGoal: number;
	winsByTimeout: number;
	losses: number;
	gamesPlayed: number;
}

interface HeaderIconProps {
	icon: IconType;
	label: string;
	align?: "start" | "end";
}

const HeaderIcon = ({
	icon: Icon,
	label,
	align = "start",
}: HeaderIconProps) => {
	const [isTooltipVisible, setIsTooltipVisible] = useState(false);

	useEffect(() => {
		if (!isTooltipVisible) {
			return;
		}
		const timeout = window.setTimeout(() => setIsTooltipVisible(false), 1500);
		return () => window.clearTimeout(timeout);
	}, [isTooltipVisible]);

	const showTooltip = () => setIsTooltipVisible(true);
	const hideTooltip = () => setIsTooltipVisible(false);

	return (
		<span
			className={`relative flex ${
				align === "end" ? "justify-end" : "justify-start"
			}`}
		>
			<button
				type="button"
				onMouseEnter={showTooltip}
				onMouseLeave={hideTooltip}
				onFocus={showTooltip}
				onBlur={hideTooltip}
				onClick={(event) => {
					event.preventDefault();
					showTooltip();
				}}
				className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-700/40 transition hover:bg-gray-600/60 focus:outline-none focus:ring-2 focus:ring-indigo-300"
			>
				<Icon aria-hidden className="h-4 w-4 text-gray-200" />
				<span className="sr-only">{label}</span>
			</button>
			{isTooltipVisible ? (
				<span
					role="tooltip"
					className={`pointer-events-none absolute z-10 mt-1 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow-lg ${
						align === "end" ? "right-0" : "left-0"
					}`}
				>
					{label}
				</span>
			) : null}
		</span>
	);
};

const calculateLeaderboard = (
	teams: Team[],
	history: MatchResult[]
): LeaderboardEntry[] => {
	const stats = new Map<number, LeaderboardEntry>();

	teams.forEach((team) => {
		stats.set(team.id, {
			team,
			points: 0,
			winsByGoal: 0,
			winsByTimeout: 0,
			losses: 0,
			gamesPlayed: 0,
		});
	});

	history.forEach((match) => {
		const winner = stats.get(match.winnerId);
		const loser = stats.get(match.loserId);

		if (winner) {
			winner.points += 3;
			if (match.reason === "goal") {
				winner.winsByGoal += 1;
			} else {
				winner.winsByTimeout += 1;
			}
			winner.gamesPlayed += 1;
		}

		if (loser) {
			loser.losses += 1;
			loser.gamesPlayed += 1;
		}
	});

	return Array.from(stats.values()).sort((a, b) => b.points - a.points);
};

export default function HomePage() {
	const [teamName, setTeamName] = useState("");
	const [editingTeam, setEditingTeam] = useState<Team | null>(null);
	const [newTeamName, setNewTeamName] = useState("");
	const [editingMatchId, setEditingMatchId] = useState<number | null>(null);
	const [editWinnerId, setEditWinnerId] = useState<number | null>(null);
	const [editLoserId, setEditLoserId] = useState<number | null>(null);
	const [editReason, setEditReason] = useState<"goal" | "timeout">("goal");
	const [isTeamsOpen, setIsTeamsOpen] = useState(false);
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
	const [isPenaltyGuideOpen, setIsPenaltyGuideOpen] = useState(false);

	const teams = useGameStore((state) => state.teams);
	const queue = useGameStore((state) => state.queue);
	const currentMatch = useGameStore((state) => state.currentMatch);
	const defendingTeam = useGameStore((state) => state.defendingTeam);
	const matchDuration = useGameStore((state) => state.matchDuration);
	const matchHistory = useGameStore((state) => state.matchHistory);
	const isTimerRunning = useGameStore((state) => state.isTimerRunning);
	const timeLeft = useGameStore((state) => state.timeLeft);

	const addTeam = useGameStore((state) => state.addTeam);
	const editTeamName = useGameStore((state) => state.editTeamName);
	const endMatch = useGameStore((state) => state.endMatch);
	const setMatchDuration = useGameStore((state) => state.setMatchDuration);
	const startNextMatch = useGameStore((state) => state.startNextMatch);
	const startTimer = useGameStore((state) => state.startTimer);
	const pauseTimer = useGameStore((state) => state.pauseTimer);
	const resetTimer = useGameStore((state) => state.resetTimer);
	const updateMatchResult = useGameStore((state) => state.updateMatchResult);
	const deleteMatchResult = useGameStore((state) => state.deleteMatchResult);

	const leaderboard = useMemo(
		() => calculateLeaderboard(teams, matchHistory),
		[teams, matchHistory]
	);

	const teamNameById = useMemo(() => {
		const nameMap = new Map<number, string>();
		teams.forEach((team) => {
			nameMap.set(team.id, team.name);
		});
		matchHistory.forEach((match) => {
			if (!nameMap.has(match.winnerId)) {
				nameMap.set(match.winnerId, `Equipo ${match.winnerId}`);
			}
			if (!nameMap.has(match.loserId)) {
				nameMap.set(match.loserId, `Equipo ${match.loserId}`);
			}
		});
		return nameMap;
	}, [teams, matchHistory]);

	const teamOptions = useMemo(
		() =>
			Array.from(teamNameById.entries()).map(([id, name]) => ({
				id,
				name,
			})),
		[teamNameById]
	);

	const orderedHistory = useMemo(
		() => [...matchHistory].sort((a, b) => b.matchId - a.matchId),
		[matchHistory]
	);

	const fullDurationSeconds = matchDuration * 60;

	const getTeamName = (id: number) => teamNameById.get(id) ?? `Equipo ${id}`;

	const handleStartEditMatch = (match: MatchResult) => {
		setEditingMatchId(match.matchId);
		setEditWinnerId(match.winnerId);
		setEditLoserId(match.loserId);
		setEditReason(match.reason);
	};

	const handleCancelMatchEdit = () => {
		setEditingMatchId(null);
		setEditWinnerId(null);
		setEditLoserId(null);
		setEditReason("goal");
	};

	const handleSwapParticipants = () => {
		if (editWinnerId !== null && editLoserId !== null) {
			setEditWinnerId(editLoserId);
			setEditLoserId(editWinnerId);
		}
	};

	const canSaveMatchEdit =
		editingMatchId !== null &&
		editWinnerId !== null &&
		editLoserId !== null &&
		editWinnerId !== editLoserId;

	const handleSaveMatchEdit = () => {
		if (!canSaveMatchEdit || editingMatchId === null) {
			return;
		}
		if (editWinnerId === null || editLoserId === null) {
			return;
		}
		updateMatchResult(editingMatchId, {
			winnerId: editWinnerId,
			loserId: editLoserId,
			reason: editReason,
		});
		handleCancelMatchEdit();
	};

	const handleDeleteMatch = (matchId: number) => {
		deleteMatchResult(matchId);
		if (editingMatchId === matchId) {
			handleCancelMatchEdit();
		}
	};

	const openInfoModal = () => {
		setIsInfoModalOpen(true);
	};

	const closeInfoModal = () => {
		setIsInfoModalOpen(false);
		setIsPenaltyGuideOpen(false);
	};

	const togglePenaltyGuide = () =>
		setIsPenaltyGuideOpen((previous) => !previous);

	useEffect(() => {
		if (!isInfoModalOpen) {
			return;
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeInfoModal();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isInfoModalOpen]);

	const formatReason = (reason: "goal" | "timeout") =>
		reason === "goal" ? "Gol" : "Timeout";

	const handleAddTeam = () => {
		if (teamName.trim()) {
			addTeam(teamName.trim());
			setTeamName("");
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

	const handleWin = (winnerId: number, reason: "goal" | "timeout") => {
		if (currentMatch) {
			endMatch(winnerId, reason);
		}
	};

	const getQueueStyles = (position: number) => {
		switch (position) {
			case 0:
				return {
					container:
						"border border-amber-400 bg-amber-500/20 text-amber-100 shadow-lg shadow-amber-500/30",
					badge: "border-amber-300 bg-amber-500/40 text-amber-100",
					label: "text-amber-200",
				};
			case 1:
				return {
					container:
						"border border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-md shadow-emerald-500/20",
					badge: "border-emerald-300 bg-emerald-500/30 text-emerald-100",
					label: "text-emerald-200",
				};
			case 2:
				return {
					container:
						"border border-sky-400 bg-sky-500/10 text-sky-100 shadow shadow-sky-500/20",
					badge: "border-sky-300 bg-sky-500/20 text-sky-100",
					label: "text-sky-200",
				};
			default:
				return {
					container: "border border-gray-700 bg-gray-800/80 text-gray-200",
					badge: "border-gray-600 bg-gray-700 text-gray-200",
					label: "text-gray-400",
				};
		}
	};

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
				<button
					type="button"
					onClick={openInfoModal}
					className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
				>
					<FaQuestionCircle aria-hidden className="h-5 w-5 text-indigo-200" />
					<span className="sr-only">Cómo se organizan los partidos</span>
				</button>
			</div>

			{/* Current Match */}
			<div className="w-full bg-gray-800 rounded-lg p-6 mb-6">
				<h2 className="text-2xl font-semibold mb-4 text-center">
					Partido Actual
				</h2>
				{currentMatch ? (
					<div className="flex flex-col items-center">
						<div className="flex justify-around w-full text-2xl font-bold mb-4">
							<span
								className={`transition ${
									defendingTeam?.id === currentMatch.team1.id
										? "underline decoration-4 underline-offset-8"
										: ""
								}`}
								style={{ color: currentMatch.team1.color }}
							>
								{currentMatch.team1.name}
							</span>
							<span className="text-gray-300">vs</span>
							<span
								className={`transition ${
									defendingTeam?.id === currentMatch.team2.id
										? "underline decoration-4 underline-offset-8"
										: ""
								}`}
								style={{ color: currentMatch.team2.color }}
							>
								{currentMatch.team2.name}
							</span>
						</div>
						<Timer />
						<div className="mt-4 flex w-full justify-around gap-3">
							<button
								onClick={startTimer}
								disabled={isTimerRunning || timeLeft === 0}
								className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition focus:outline-none focus:ring-2 focus:ring-emerald-300 ${
									isTimerRunning || timeLeft === 0
										? "bg-emerald-700/40 text-emerald-200/60"
										: "bg-emerald-500 hover:bg-emerald-600 text-white"
								}`}
							>
								<FaPlay aria-hidden className="h-6 w-6" />
								<span className="sr-only">Iniciar</span>
							</button>
							<button
								onClick={pauseTimer}
								disabled={!isTimerRunning}
								className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${
									!isTimerRunning
										? "bg-amber-600/40 text-amber-200/60"
										: "bg-amber-500 hover:bg-amber-600 text-white"
								}`}
							>
								<FaPause aria-hidden className="h-6 w-6" />
								<span className="sr-only">Pausar</span>
							</button>
							<button
								onClick={resetTimer}
								disabled={!isTimerRunning && timeLeft === fullDurationSeconds}
								className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition focus:outline-none focus:ring-2 focus:ring-rose-300 ${
									!isTimerRunning && timeLeft === fullDurationSeconds
										? "bg-rose-700/40 text-rose-200/60"
										: "bg-rose-500 hover:bg-rose-600 text-white"
								}`}
							>
								<FaStop aria-hidden className="h-6 w-6" />
								<span className="sr-only">Detener</span>
							</button>
						</div>
						<div className="mt-4 w-full">
							<h3 className="text-lg font-semibold mb-2 text-center">
								Marcar Ganador:
							</h3>
							<div className="flex justify-around gap-3">
								<button
									onClick={() => handleWin(currentMatch.team1.id, "goal")}
									className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-xl text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-black/20 transition hover:brightness-110"
									style={{ backgroundColor: currentMatch.team1.color }}
								>
									<FaFutbol aria-hidden className="text-5xl" />
									<span>Gol</span>
									<span className="text-center leading-tight text-xs font-semibold normal-case">
										{currentMatch.team1.name}
									</span>
								</button>
								<button
									onClick={() => handleWin(currentMatch.team2.id, "goal")}
									className="flex h-32 w-32 flex-col items-center justify-center gap-1 rounded-xl text-white font-bold text-sm uppercase tracking-wide shadow-lg shadow-black/20 transition hover:brightness-110"
									style={{ backgroundColor: currentMatch.team2.color }}
								>
									<FaFutbol aria-hidden className="text-5xl" />
									<span>Gol</span>
									<span className="text-center leading-tight text-xs font-semibold normal-case">
										{currentMatch.team2.name}
									</span>
								</button>
							</div>
							<div className="flex justify-around mt-8">
								<button
									onClick={() => handleWin(currentMatch.team1.id, "timeout")}
									className="rounded-lg px-4 py-2 font-semibold text-white shadow-md shadow-black/20 transition hover:brightness-110"
									style={{ backgroundColor: currentMatch.team1.color }}
								>
									Timeout {currentMatch.team1.name}
								</button>
								<button
									onClick={() => handleWin(currentMatch.team2.id, "timeout")}
									className="rounded-lg px-4 py-2 font-semibold text-white shadow-md shadow-black/20 transition hover:brightness-110"
									style={{ backgroundColor: currentMatch.team2.color }}
								>
									Timeout {currentMatch.team2.name}
								</button>
							</div>
						</div>
					</div>
				) : (
					<p className="text-center">Esperando equipos para comenzar...</p>
				)}
			</div>

			{/* Queue */}
			<div className="w-full bg-gray-800 rounded-lg p-6 mb-6">
				<h2 className="text-2xl font-semibold mb-4 text-center">
					Cola de Espera
				</h2>
				{queue.length > 0 ? (
					<ul className="space-y-3">
						{queue.map((team: Team, index: number) => {
							const rank = index + 1;
							const { container, badge, label } = getQueueStyles(index);
							return (
								<li
									key={team.id}
									className={`flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition ${container}`}
								>
									<span
										className={`flex items-center justify-center rounded-full font-bold ${badge} ${
											rank === 1 ? "h-10 w-10 text-2xl" : "h-8 w-8 text-lg"
										}`}
									>
										{rank}
									</span>
									<div className="flex flex-1 items-center justify-between gap-3">
										<span
											className={`flex items-center gap-3 ${
												rank === 1 ? "text-xl font-semibold" : "text-lg"
											}`}
										>
											<span
												className="inline-flex h-3.5 w-3.5 rounded-full border border-white/40"
												style={{ backgroundColor: team.color }}
												aria-hidden
											/>
											<span>{team.name}</span>
										</span>
										{index < 3 ? (
											<span
												className={`text-xs uppercase tracking-wide ${label}`}
											>
												{index === 0 ? "Entra siguiente" : "Calentando"}
											</span>
										) : null}
									</div>
								</li>
							);
						})}
					</ul>
				) : (
					<p className="text-center">No hay equipos en espera.</p>
				)}
			</div>

			{/* Team Management */}
			<div className="w-full bg-gray-800 rounded-lg mb-6">
				<button
					type="button"
					onClick={() => setIsTeamsOpen((prev) => !prev)}
					className="flex w-full items-center justify-between px-6 py-4"
					aria-expanded={isTeamsOpen}
					aria-controls="teams-section"
				>
					<span className="text-2xl font-semibold">Gestionar Equipos</span>
					<span className="text-2xl font-bold">{isTeamsOpen ? "-" : "+"}</span>
				</button>
				{isTeamsOpen && (
					<div
						id="teams-section"
						className="border-t border-gray-700 px-6 py-4"
					>
						<div className="flex mb-4">
							<input
								type="text"
								value={teamName}
								onChange={(e) => setTeamName(e.target.value)}
								placeholder="Nombre del equipo"
								className="bg-gray-700 text-white p-2 rounded-l-md grow"
							/>
							<button
								onClick={handleAddTeam}
								className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r-md"
							>
								Agregar
							</button>
						</div>
						<ul className="space-y-2">
							{teams.map((team) => (
								<li
									key={team.id}
									className="flex items-center justify-between rounded-md bg-gray-700 p-2"
								>
									<div className="flex items-center gap-3">
										<span
											className="inline-flex h-3 w-3 rounded-full border border-white/40"
											style={{ backgroundColor: team.color }}
											aria-hidden
										/>
										{editingTeam?.id === team.id ? (
											<input
												type="text"
												value={newTeamName}
												onChange={(e) => setNewTeamName(e.target.value)}
												className="bg-gray-600 text-white p-1 rounded-md"
											/>
										) : (
											<span>{team.name}</span>
										)}
									</div>
									<div>
										{editingTeam?.id === team.id ? (
											<button
												type="button"
												onClick={handleSaveTeamName}
												className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded"
											>
												Guardar
											</button>
										) : (
											<button
												type="button"
												onClick={() => handleEditTeam(team)}
												className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded"
											>
												Editar
											</button>
										)}
									</div>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{/* Settings */}
			<div className="w-full bg-gray-800 rounded-lg mb-6">
				<button
					type="button"
					onClick={() => setIsSettingsOpen((prev) => !prev)}
					className="flex w-full items-center justify-between px-6 py-4"
					aria-expanded={isSettingsOpen}
					aria-controls="settings-section"
				>
					<span className="text-2xl font-semibold">Configuración</span>
					<span className="text-2xl font-bold">
						{isSettingsOpen ? "-" : "+"}
					</span>
				</button>
				{isSettingsOpen && (
					<div
						id="settings-section"
						className="border-t border-gray-700 px-6 py-4"
					>
						<div className="flex items-center justify-between">
							<label htmlFor="duration" className="mr-4">
								Duración del Partido (min)
							</label>
							<select
								id="duration"
								value={matchDuration}
								onChange={(e) => setMatchDuration(Number(e.target.value))}
								className="bg-gray-700 text-white p-2 rounded-md"
							>
								<option value="3">3</option>
								<option value="4">4</option>
								<option value="5">5</option>
								<option value="6">6</option>
								<option value="7">7</option>
							</select>
						</div>
					</div>
				)}
			</div>

			{/* Match History */}
			<div className="w-full bg-gray-800 rounded-lg mb-6">
				<button
					type="button"
					onClick={() => setIsHistoryOpen((prev) => !prev)}
					className="flex w-full items-center justify-between px-6 py-4"
					aria-expanded={isHistoryOpen}
					aria-controls="history-section"
				>
					<span className="text-2xl font-semibold">Historial de Partidos</span>
					<span className="text-2xl font-bold">
						{isHistoryOpen ? "-" : "+"}
					</span>
				</button>
				{isHistoryOpen && (
					<div
						id="history-section"
						className="border-t border-gray-700 px-6 py-4"
					>
						{orderedHistory.length === 0 ? (
							<p className="text-center text-sm text-gray-300">
								Todavía no se registran resultados.
							</p>
						) : (
							<ul className="space-y-4">
								{orderedHistory.map((match) => {
									const isEditing = editingMatchId === match.matchId;
									const winnerName = getTeamName(match.winnerId);
									const loserName = getTeamName(match.loserId);
									return (
										<li
											key={match.matchId}
											className="rounded-md bg-gray-700 p-4"
										>
											{isEditing ? (
												<div className="space-y-3">
													<div className="grid gap-3 sm:grid-cols-2">
														<label className="flex flex-col gap-1 text-sm text-gray-200">
															<span>Ganador</span>
															<select
																value={editWinnerId ?? ""}
																onChange={(e) =>
																	setEditWinnerId(Number(e.target.value))
																}
																className="rounded border border-gray-600 bg-gray-900 p-2 text-white"
															>
																<option value="">Seleccionar equipo</option>
																{teamOptions.map((option) => (
																	<option key={option.id} value={option.id}>
																		{option.name}
																	</option>
																))}
															</select>
														</label>
														<label className="flex flex-col gap-1 text-sm text-gray-200">
															<span>Perdedor</span>
															<select
																value={editLoserId ?? ""}
																onChange={(e) =>
																	setEditLoserId(Number(e.target.value))
																}
																className="rounded border border-gray-600 bg-gray-900 p-2 text-white"
															>
																<option value="">Seleccionar equipo</option>
																{teamOptions.map((option) => (
																	<option key={option.id} value={option.id}>
																		{option.name}
																	</option>
																))}
															</select>
														</label>
													</div>
													<div className="flex flex-wrap gap-2">
														<button
															type="button"
															onClick={handleSwapParticipants}
															className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-1 px-3 rounded"
														>
															Intercambiar Equipos
														</button>
													</div>
													<label className="flex flex-col gap-1 text-sm text-gray-200">
														<span>Motivo</span>
														<select
															value={editReason}
															onChange={(e) =>
																setEditReason(
																	e.target.value as "goal" | "timeout"
																)
															}
															className="rounded border border-gray-600 bg-gray-900 p-2 text-white"
														>
															<option value="goal">Gol</option>
															<option value="timeout">Tiempo agotado</option>
														</select>
													</label>
													<div className="flex gap-2">
														<button
															type="button"
															onClick={handleSaveMatchEdit}
															className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
														>
															Guardar
														</button>
														<button
															type="button"
															onClick={handleCancelMatchEdit}
															className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded"
														>
															Cancelar
														</button>
													</div>
												</div>
											) : (
												<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
													<div>
														<p className="text-lg font-semibold text-white">
															{winnerName} vs {loserName}
														</p>
														<p className="text-sm text-gray-300">
															Ganador: {winnerName}
														</p>
														<p className="text-sm text-gray-300">
															Motivo: {formatReason(match.reason)}
														</p>
													</div>
													<div className="flex gap-2">
														<button
															type="button"
															onClick={() => handleStartEditMatch(match)}
															className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
														>
															Editar
														</button>
														<button
															type="button"
															onClick={() => handleDeleteMatch(match.matchId)}
															className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
														>
															Eliminar
														</button>
													</div>
												</div>
											)}
										</li>
									);
								})}
							</ul>
						)}
					</div>
				)}
			</div>

			{/* Leaderboard */}
			<div className="w-full bg-gray-800 rounded-lg p-6 mb-6">
				<h2 className="text-2xl font-semibold mb-4 text-center">
					Tabla de Posiciones
				</h2>
				{leaderboard.length === 0 ? (
					<p className="text-center text-sm text-gray-300">
						Todavía no hay estadísticas para mostrar.
					</p>
				) : (
					<table className="w-full text-left text-sm">
						<thead className="text-gray-300 uppercase tracking-wider">
							<tr>
								<th className="pb-2">
									<HeaderIcon icon={FaUsers} label="Equipo" />
								</th>
								<th className="pb-2 text-right">
									<HeaderIcon
										icon={FaListOl}
										label="Partidos jugados"
										align="end"
									/>
								</th>
								<th className="pb-2 text-right">
									<HeaderIcon icon={FaMedal} label="Puntos" align="end" />
								</th>
								<th className="pb-2 text-right">
									<HeaderIcon icon={FaFutbol} label="Goles" align="end" />
								</th>
								<th className="pb-2 text-right">
									<HeaderIcon icon={FaClock} label="Timeout" align="end" />
								</th>
								<th className="pb-2 text-right">
									<HeaderIcon
										icon={FaThumbsDown}
										label="Derrotas"
										align="end"
									/>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-700 text-gray-100">
							{leaderboard.map((entry) => (
								<tr key={entry.team.id}>
									<td className="py-2 pr-2 font-semibold">
										<span className="flex items-center gap-2">
											<span
												className="inline-flex h-2.5 w-2.5 rounded-full border border-white/40"
												style={{ backgroundColor: entry.team.color }}
												aria-hidden
											/>
											<span>{entry.team.name}</span>
										</span>
									</td>
									<td className="py-2 text-right">{entry.gamesPlayed}</td>
									<td className="py-2 text-right font-semibold text-indigo-300">
										{entry.points}
									</td>
									<td className="py-2 text-right">{entry.winsByGoal}</td>
									<td className="py-2 text-right">{entry.winsByTimeout}</td>
									<td className="py-2 text-right">{entry.losses}</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			<div className="text-xs text-gray-500">
				<p>Creado, diseñado y desarrollado por Emilio Andrich.</p>
			</div>

			{isInfoModalOpen ? (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
					onClick={closeInfoModal}
				>
					<div
						role="dialog"
						aria-modal="true"
						aria-labelledby="how-it-works-title"
						className="relative w-full max-w-md rounded-lg bg-gray-900 p-6 text-left shadow-2xl"
						onClick={(event) => event.stopPropagation()}
					>
						<h2
							id="how-it-works-title"
							className="mb-3 text-xl font-semibold text-white"
						>
							¿Cómo se organizan los partidos?
						</h2>
						<div className="mb-4 rounded-lg border border-indigo-400/40 bg-indigo-500/10 p-4 text-sm text-gray-100">
							<p className="mb-2 flex items-center gap-2 font-semibold text-white">
								<FaPlusCircle aria-hidden className="h-4 w-4 text-indigo-300" />
								1. Arma la cola antes de jugar
							</p>
							<p className="leading-relaxed">
								Agrega los equipos en el orden en que van a jugar. Cuando el
								segundo equipo entra en la lista, se habilita el cronómetro del
								partido. Si crees que el tiempo por defecto es corto o largo,
								puedes ajustarlo en
								<span className="font-semibold text-indigo-200">
									{" "}
									Configuración → Duración del Partido
								</span>{" "}
								antes de iniciar.
							</p>
							<div className="mt-3 rounded-md bg-gray-800/70 p-3 text-xs">
								<p className="mb-2 font-semibold text-gray-100">
									Ejemplo rápido
								</p>
								<div className="space-y-1">
									<div className="flex items-center justify-between rounded bg-gray-900/60 px-2 py-1">
										<span className="flex items-center gap-2 text-gray-200">
											<FaUsers
												aria-hidden
												className="h-3.5 w-3.5 text-emerald-300"
											/>
											<span>1. Los Pibes</span>
										</span>
										<span className="text-emerald-300">Defensor actual</span>
									</div>
									<div className="flex items-center justify-between rounded bg-gray-900/40 px-2 py-1">
										<span className="flex items-center gap-2 text-gray-200">
											<FaUsers
												aria-hidden
												className="h-3.5 w-3.5 text-sky-300"
											/>
											<span>2. Furia Azul</span>
										</span>
										<span className="flex items-center gap-1 text-gray-300">
											<FaStopwatch aria-hidden className="h-3 w-3" />
											<span>05:00</span>
										</span>
									</div>
								</div>
							</div>
						</div>
						<div className="mb-4 rounded-lg border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm text-gray-100">
							<p className="mb-2 flex items-center gap-2 font-semibold text-white">
								<FaFutbol aria-hidden className="h-4 w-4 text-emerald-300" />
								2. Formas de ganar un partido
							</p>
							<ul className="space-y-2">
								<li className="flex items-start gap-2">
									<FaBullseye
										aria-hidden
										className="mt-1 h-4 w-4 text-emerald-300"
									/>
									<span>
										Gol directo: el equipo que anota se queda como nuevo
										defensor.
									</span>
								</li>
								<li className="flex items-start gap-2">
									<FaStopwatch
										aria-hidden
										className="mt-1 h-4 w-4 text-amber-300"
									/>
									<span>
										Timeout: si el cronómetro llega a cero y nadie marcó, el
										defensor deja la cancha y el retador pasa a ser el ganador.
									</span>
								</li>
							</ul>
						</div>
						<div className="mb-4 rounded-lg border border-sky-400/40 bg-sky-500/10 p-4 text-sm text-gray-100">
							<p className="mb-2 flex items-center gap-2 font-semibold text-white">
								<FaShieldAlt aria-hidden className="h-4 w-4 text-sky-300" />
								3. Primer partido y elección del defensor
							</p>
							<p className="mb-3 leading-relaxed">
								Los dos primeros equipos se enfrentan para definir al defensor
								inicial. Si el tiempo termina sin goles, pueden decidirlo como
								prefieran. La opción recomendada es un{" "}
								<span className="font-semibold text-white">
									penalty shootout
								</span>{" "}
								rápido.
							</p>
							<button
								type="button"
								onClick={togglePenaltyGuide}
								className="flex items-center gap-2 rounded-md border border-sky-300/40 bg-sky-600/20 px-3 py-2 text-xs font-semibold text-sky-100 transition hover:bg-sky-600/30 focus:outline-none focus:ring-2 focus:ring-sky-300"
							>
								<FaInfoCircle aria-hidden className="h-3.5 w-3.5" />
								{isPenaltyGuideOpen
									? "Ocultar guía penalty shootout"
									: "¿Cómo funciona un penalty shootout?"}
							</button>
							{isPenaltyGuideOpen ? (
								<div className="mt-3 space-y-2 rounded-md bg-sky-900/60 p-3 text-xs text-sky-50">
									<p className="font-semibold text-white">
										Guía rápida (3 lanzamientos por equipo)
									</p>
									<ol className="list-inside list-decimal space-y-1">
										<li>
											Alternen disparos: defensor primero, retador responde.
										</li>
										<li>Tras tres tiros, gana quien tenga más goles.</li>
										<li>
											Si siguen empatados, definan con muerte súbita (un tiro
											cada uno).
										</li>
										<li>
											Registra el resultado marcándolo como triunfo por{" "}
											<span className="font-semibold">timeout</span> en la app.
										</li>
									</ol>
									<p className="flex items-start gap-2 rounded bg-sky-800/80 px-2 py-1 text-[11px] text-sky-100">
										<FaFlagCheckered
											aria-hidden
											className="mt-0.5 h-3 w-3 text-sky-200"
										/>
										<span>
											También pueden usar otro método de desempate; si no hay
											gol directo, regístralo como victoria por timeout.
										</span>
									</p>
								</div>
							) : null}
						</div>
						<div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-gray-100">
							<p className="mb-2 flex items-center gap-2 font-semibold text-white">
								<FaRedoAlt aria-hidden className="h-4 w-4 text-rose-300" />
								4. Rotación de la cola
							</p>
							<p>
								Cada vez que un equipo pierde, vuelve al final de la fila y
								espera a que todos los demás equipos jueguen antes de volver a
								intentarlo. Así cada grupo tendrá la misma cantidad de
								oportunidades.
							</p>
						</div>
						<div className="mb-6 rounded-lg border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-gray-100">
							<p className="mb-2 flex items-center gap-2 font-semibold text-white">
								<FaMedal aria-hidden className="h-4 w-4 text-amber-300" />
								5. Puntos y desempates
							</p>
							<ul className="space-y-2">
								<li className="flex items-start gap-2">
									<FaTrophy
										aria-hidden
										className="mt-1 h-4 w-4 text-amber-200"
									/>
									<span>
										Cada victoria suma{" "}
										<span className="font-semibold text-white">3 puntos</span>,
										sin importar si fue por gol o timeout.
									</span>
								</li>
								<li className="flex items-start gap-2">
									<FaFutbol
										aria-hidden
										className="mt-1 h-4 w-4 text-emerald-200"
									/>
									<span>
										Si hay empate en puntos, se ordena por la cantidad de
										partidos ganados por gol.
									</span>
								</li>
							</ul>
						</div>
						<button
							type="button"
							onClick={closeInfoModal}
							className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
						>
							Entendido
						</button>
					</div>
				</div>
			) : null}
		</div>
	);
}
