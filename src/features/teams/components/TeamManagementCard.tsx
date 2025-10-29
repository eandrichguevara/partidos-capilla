"use client";

import { useState } from "react";
import Image from "next/image";
import type { Team } from "@/domain/types";

interface TeamManagementCardProps {
	teams: Team[];
	teamName: string;
	onTeamNameChange: (name: string) => void;
	onAddTeam: () => void;
	editingTeam: Team | null;
	newTeamName: string;
	onNewTeamNameChange: (name: string) => void;
	onEditTeam: (team: Team) => void;
	onSaveTeamName: () => void;
	onDeleteTeam: (teamId: number) => void;
	isAssigningLogo?: boolean;
}

export const TeamManagementCard = ({
	teams,
	teamName,
	onTeamNameChange,
	onAddTeam,
	editingTeam,
	newTeamName,
	onNewTeamNameChange,
	onEditTeam,
	onSaveTeamName,
	onDeleteTeam,
	isAssigningLogo = false,
}: TeamManagementCardProps) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<div className="w-full bg-gray-800 rounded-lg mb-6">
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="flex w-full items-center justify-between px-6 py-4"
				aria-expanded={isOpen}
				aria-controls="teams-section"
			>
				<span className="text-2xl font-semibold">Gestionar Equipos</span>
				<span className="text-2xl font-bold">{isOpen ? "-" : "+"}</span>
			</button>
			{isOpen && (
				<div id="teams-section" className="border-t border-gray-700 px-6 py-4">
					<div className="flex mb-4">
						<input
							type="text"
							value={teamName}
							onChange={(e) => onTeamNameChange(e.target.value)}
							placeholder="Nombre del equipo"
							maxLength={16}
							className="bg-gray-700 text-white p-2 rounded-l-md grow"
							disabled={isAssigningLogo}
						/>
						<button
							onClick={onAddTeam}
							disabled={isAssigningLogo}
							className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isAssigningLogo ? "Asignando..." : "Agregar"}
						</button>
					</div>
					<ul className="space-y-2">
						{teams.map((team) => (
							<li
								key={team.id}
								className="flex items-center justify-between rounded-md bg-gray-700 p-2"
							>
								<div className="flex items-center gap-3">
									{team.logo ? (
										<div
											style={{
												filter:
													"drop-shadow(0 0 1px white) drop-shadow(0 0 1px white)",
											}}
										>
											<Image
												src={team.logo}
												alt={`Logo de ${team.name}`}
												width={32}
												height={32}
												className="h-8 w-8 rounded-full object-cover border border-white/40"
											/>
										</div>
									) : (
										<span
											className="inline-flex h-8 w-8 rounded-full border border-white/40"
											style={{ backgroundColor: team.color }}
											aria-hidden
										/>
									)}
									{editingTeam?.id === team.id ? (
										<input
											type="text"
											value={newTeamName}
											onChange={(e) => onNewTeamNameChange(e.target.value)}
											maxLength={16}
											className="bg-gray-600 text-white p-1 rounded-md"
										/>
									) : (
										<span>{team.name}</span>
									)}
								</div>
								<div className="flex gap-2">
									{editingTeam?.id === team.id ? (
										<button
											type="button"
											onClick={onSaveTeamName}
											className="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded"
										>
											Guardar
										</button>
									) : (
										<>
											<button
												type="button"
												onClick={() => onEditTeam(team)}
												className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded"
											>
												Editar
											</button>
											<button
												type="button"
												onClick={() => onDeleteTeam(team.id)}
												className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded"
											>
												Eliminar
											</button>
										</>
									)}
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
};
