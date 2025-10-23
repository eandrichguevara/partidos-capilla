"use client";

import { useState } from "react";
import type { MatchResult } from "@/domain/types";

interface MatchHistoryCardProps {
	orderedHistory: MatchResult[];
	teamOptions: { id: number; name: string }[];
	getTeamName: (id: number) => string;
	editingMatchId: number | null;
	editWinnerId: number | null;
	onEditWinnerIdChange: (id: number) => void;
	editLoserId: number | null;
	onEditLoserIdChange: (id: number) => void;
	editReason: "goal" | "timeout";
	onEditReasonChange: (reason: "goal" | "timeout") => void;
	onStartEditMatch: (match: MatchResult) => void;
	onCancelMatchEdit: () => void;
	onSwapParticipants: () => void;
	onSaveMatchEdit: () => void;
	onDeleteMatch: (matchId: number) => void;
}

const formatReason = (reason: "goal" | "timeout") =>
	reason === "goal" ? "Gol" : "Timeout";

export const MatchHistoryCard = ({
	orderedHistory,
	teamOptions,
	getTeamName,
	editingMatchId,
	editWinnerId,
	onEditWinnerIdChange,
	editLoserId,
	onEditLoserIdChange,
	editReason,
	onEditReasonChange,
	onStartEditMatch,
	onCancelMatchEdit,
	onSwapParticipants,
	onSaveMatchEdit,
	onDeleteMatch,
}: MatchHistoryCardProps) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="w-full bg-gray-800 rounded-lg mb-6">
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex w-full items-center justify-between px-6 py-4"
				aria-expanded={isOpen}
				aria-controls="history-section"
			>
				<span className="text-2xl font-semibold">Historial de Partidos</span>
				<span className="text-2xl font-bold">{isOpen ? "-" : "+"}</span>
			</button>
			{isOpen && (
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
																onEditWinnerIdChange(Number(e.target.value))
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
																onEditLoserIdChange(Number(e.target.value))
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
														onClick={onSwapParticipants}
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
															onEditReasonChange(
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
														onClick={onSaveMatchEdit}
														className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded"
													>
														Guardar
													</button>
													<button
														type="button"
														onClick={onCancelMatchEdit}
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
														onClick={() => onStartEditMatch(match)}
														className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-3 rounded"
													>
														Editar
													</button>
													<button
														type="button"
														onClick={() => onDeleteMatch(match.matchId)}
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
	);
};
