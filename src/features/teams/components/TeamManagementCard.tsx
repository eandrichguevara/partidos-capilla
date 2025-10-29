"use client";

import { useState } from "react";

// Lista de nombres sugeridos para equipos de fútbol
const SUGGESTED_TEAM_NAMES = [
	"Atlético Azul Celeste",
	"Anclas Oxidadas FC",
	"Águilas Reales",
	"Ángeles FC",
	"Santos del Anillo",
	"Comunidad del Anillo",
	"Naturaleza FC",
	"Brillantes del Norte",
	"Búhos Nocturnos",
	"Templarios FC",
	"Caballos Mágicos",
	"Robots Plateados",
	"Rayo Chargers",
	"Cobras Verdes",
	"Colo Colo",
	"Cometas Azules",
	"Cóndores de Chile",
	"Corazón Valiente",
	"Monarcas Dorados",
	"Reyes Dorados",
	"Piratas del Cráneo",
	"Diablos Rojos",
	"Diamantes Negros",
	"Futuro FC",
	"Dragones Rojos",
	"Engranaje Mecánico",
	"Escudo Dorado FC",
	"Estrellas Fugaces",
	"Fantasmas FC",
	"Fénix de Fuego",
	"Flechas Verdes",
	"Gladiadores Negros",
	"Grifos Míticos",
	"Halcones Metálicos",
	"Hamburguesas FC",
	"Insignia Militar",
	"Kraken del Mar",
	"Leones Amarillos",
	"Lobos de la Luna",
	"Blaugranas",
	"Martillos Negros",
	"Magia Nocturna",
	"Minotauros",
	"Motores Racing",
	"Olas del Mar",
	"Osos Polares",
	"Osos Grizzle",
	"Panteras Negras",
	"Roca Sólida",
	"Piratas del Tesoro",
	"Portal Galáctico",
	"Rayos Celestes",
	"Samuráis",
	"Serpientes Verdes",
	"Soles Dorados",
	"Estrellas Plateadas",
	"Tiburones",
	"Tigres Naranja",
	"Titanes",
	"Torre Antigua FC",
	"Tralaleros",
	"Geométricos FC",
	"Trompeta Sagrada",
	"Cruzados UC",
	"Universidad Azul",
	"Vikingos",
	"Volcanes",
	"Cruzadas FC",
	"Franja Celeste",
	"Bota de Oro",
	"Amanecer Albiceleste",
];
import Image from "next/image";
import "./TeamManagementCard.css";
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
	onCancelEditTeam?: () => void; // Nuevo prop opcional
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
	onCancelEditTeam,
}: TeamManagementCardProps) => {
	// Si no se provee onCancelEditTeam, simplemente no hacemos nada (el padre debería manejarlo)
	const [isOpen, setIsOpen] = useState(true);

	// Animación de dado: controlamos el estado de giro para el botón de agregar
	const [isAddDiceSpinning, setIsAddDiceSpinning] = useState(false);
	// Animación de dado para el input de edición
	const [isEditDiceSpinning, setIsEditDiceSpinning] = useState(false);

	// Duración de la animación (ms) — mantener en sync con the CSS file
	const DICE_SPIN_DURATION = 600;

	const handleRandomizeAdd = () => {
		if (isAssigningLogo || isAddDiceSpinning) return;
		setIsAddDiceSpinning(true);
		// Mantener la animación visible durante DICE_SPIN_DURATION
		setTimeout(() => {
			const random =
				SUGGESTED_TEAM_NAMES[
					Math.floor(Math.random() * SUGGESTED_TEAM_NAMES.length)
				];
			onTeamNameChange(random);
			setIsAddDiceSpinning(false);
		}, DICE_SPIN_DURATION);
	};

	const handleRandomizeEdit = () => {
		if (isEditDiceSpinning) return;
		setIsEditDiceSpinning(true);
		setTimeout(() => {
			const random =
				SUGGESTED_TEAM_NAMES[
					Math.floor(Math.random() * SUGGESTED_TEAM_NAMES.length)
				];
			onNewTeamNameChange(random);
			setIsEditDiceSpinning(false);
		}, DICE_SPIN_DURATION);
	};

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
							maxLength={20}
							className="bg-gray-700 text-white p-2 rounded-l-md grow"
							disabled={isAssigningLogo}
						/>
						<button
							type="button"
							title="Nombre aleatorio"
							className={
								"bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-2 rounded-none border-l border-gray-800"
							}
							style={{
								borderTopLeftRadius: 0,
								borderBottomLeftRadius: 0,
								borderTopRightRadius: 0,
								borderBottomRightRadius: 0,
							}}
							disabled={isAssigningLogo || isAddDiceSpinning}
							onClick={handleRandomizeAdd}
						>
							<span
								className={
									isAddDiceSpinning ? "dice-spin dice-icon" : "dice-icon"
								}
							>
								🎲
							</span>
						</button>
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
										<div className="flex items-center gap-1">
											<input
												type="text"
												value={newTeamName}
												onChange={(e) => onNewTeamNameChange(e.target.value)}
												maxLength={20}
												className="bg-gray-600 text-white p-1 rounded-md"
											/>
											<button
												type="button"
												title="Nombre aleatorio"
												className={
													"bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-2 rounded"
												}
												onClick={handleRandomizeEdit}
												disabled={isEditDiceSpinning}
											>
												<span
													className={
														isEditDiceSpinning
															? "dice-spin dice-icon"
															: "dice-icon"
													}
												>
													🎲
												</span>
											</button>
											<button
												type="button"
												title="Cancelar edición"
												className="bg-red-600 hover:bg-red-700 text-white font-bold rounded flex items-center justify-center"
												style={{
													aspectRatio: "1 / 1",
													width: "2rem",
													height: "2rem",
													minWidth: "2rem",
													minHeight: "2rem",
													padding: 0,
												}}
												onClick={() => {
													if (onCancelEditTeam) {
														onCancelEditTeam();
													}
												}}
											>
												×
											</button>
										</div>
									) : (
										<span>{team.name}</span>
									)}
								</div>
								<div className="flex gap-2">
									{editingTeam?.id === team.id ? (
										<button
											type="button"
											onClick={onSaveTeamName}
											className="ml-1 bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-2 rounded flex items-center justify-center"
											style={{
												aspectRatio: "1 / 1",
												width: "2rem",
												height: "2rem",
												minWidth: "2rem",
												minHeight: "2rem",
												padding: 0,
											}}
											title="Guardar"
										>
											✔
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
