"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
	FaUsers,
	FaListOl,
	FaMedal,
	FaFutbol,
	FaClock,
	FaThumbsDown,
} from "react-icons/fa";
import type { IconType } from "react-icons";
import type { LeaderboardEntry } from "@/domain/types";
import { getFontById } from "@/domain/fonts";

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

interface LeaderboardCardProps {
	leaderboard: LeaderboardEntry[];
}

export const LeaderboardCard = ({ leaderboard }: LeaderboardCardProps) => {
	return (
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
								<HeaderIcon icon={FaThumbsDown} label="Derrotas" align="end" />
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-700 text-gray-100">
						{leaderboard.map((entry) => (
							<tr key={entry.team.id}>
								<td className="py-2 pr-2 font-semibold">
									<span className="flex items-center gap-2">
										{entry.team.logo ? (
											<Image
												src={entry.team.logo}
												alt={`Logo de ${entry.team.name}`}
												width={20}
												height={20}
												className="h-5 w-5 rounded-full object-cover border border-white/40"
											/>
										) : (
											<span
												className="inline-flex h-2.5 w-2.5 rounded-full border border-white/40"
												style={{ backgroundColor: entry.team.color }}
												aria-hidden
											/>
										)}
										<span
											style={{
												fontFamily: entry.team.font
													? getFontById(entry.team.font)?.fontFamily
													: undefined,
											}}
										>
											{entry.team.name}
										</span>
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
	);
};
