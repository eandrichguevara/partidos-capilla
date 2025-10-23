"use client";

import type { Team } from "@/domain/types";

interface QueueCardProps {
	queue: Team[];
}

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

export const QueueCard = ({ queue }: QueueCardProps) => {
	return (
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
	);
};
