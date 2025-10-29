"use client";

import { useEffect, useState } from "react";
import {
	FaQuestionCircle,
	FaPlusCircle,
	FaFutbol,
	FaBullseye,
	FaStopwatch,
	FaShieldAlt,
	FaInfoCircle,
	FaFlagCheckered,
	FaRedoAlt,
	FaMedal,
	FaTrophy,
	FaUsers,
} from "react-icons/fa";

interface InfoModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export const InfoModal = ({ isOpen, onClose }: InfoModalProps) => {
	const [isPenaltyGuideOpen, setIsPenaltyGuideOpen] = useState(false);

	useEffect(() => {
		if (!isOpen) {
			return;
		}
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	const togglePenaltyGuide = () =>
		setIsPenaltyGuideOpen((previous) => !previous);

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
			onClick={onClose}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="how-it-works-title"
				className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-gray-900 p-6 text-left shadow-2xl"
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
						Agrega los equipos en el orden en que van a jugar. Cuando el segundo
						equipo entra en la lista, se habilita el cronómetro del partido. Si
						crees que el tiempo por defecto es corto o largo, puedes ajustarlo
						en
						<span className="font-semibold text-indigo-200">
							{" "}
							Configuración → Duración del Partido
						</span>{" "}
						antes de iniciar.
					</p>
					<div className="mt-3 rounded-md bg-gray-800/70 p-3 text-xs">
						<p className="mb-2 font-semibold text-gray-100">Ejemplo rápido</p>
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
									<FaUsers aria-hidden className="h-3.5 w-3.5 text-sky-300" />
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
								Gol directo: el equipo que anota se queda como nuevo defensor.
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
						<span className="font-semibold text-white">penalty shootout</span>{" "}
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
								<li>Alternen disparos: defensor primero, retador responde.</li>
								<li>Tras tres tiros, gana quien tenga más goles.</li>
								<li>
									Si siguen empatados, definan con muerte súbita (un tiro cada
									uno).
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
									También pueden usar otro método de desempate; si no hay gol
									directo, regístralo como victoria por timeout.
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
						Cada vez que un equipo pierde, vuelve al final de la fila y espera a
						que todos los demás equipos jueguen antes de volver a intentarlo.
						Así cada grupo tendrá la misma cantidad de oportunidades.
					</p>
				</div>
				<div className="mb-6 rounded-lg border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-gray-100">
					<p className="mb-2 flex items-center gap-2 font-semibold text-white">
						<FaMedal aria-hidden className="h-4 w-4 text-amber-300" />
						5. Puntos y desempates
					</p>
					<ul className="space-y-2">
						<li className="flex items-start gap-2">
							<FaTrophy aria-hidden className="mt-1 h-4 w-4 text-amber-200" />
							<span>
								Cada victoria suma{" "}
								<span className="font-semibold text-white">3 puntos</span>, sin
								importar si fue por gol o timeout.
							</span>
						</li>
						<li className="flex items-start gap-2">
							<FaFutbol aria-hidden className="mt-1 h-4 w-4 text-emerald-200" />
							<span>
								Si hay empate en puntos, se ordena por la cantidad de partidos
								ganados por gol.
							</span>
						</li>
					</ul>
				</div>
				<button
					type="button"
					onClick={onClose}
					className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
				>
					Entendido
				</button>
			</div>
		</div>
	);
};

interface InfoButtonProps {
	onClick: () => void;
}

export const InfoButton = ({ onClick }: InfoButtonProps) => {
	return (
		<button
			type="button"
			onClick={onClick}
			className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 transition hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
		>
			<FaQuestionCircle aria-hidden className="h-5 w-5 text-indigo-200" />
			<span className="sr-only">Cómo se organizan los partidos</span>
		</button>
	);
};
