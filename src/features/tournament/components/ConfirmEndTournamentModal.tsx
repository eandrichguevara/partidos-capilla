"use client";

import { FaExclamationTriangle } from "react-icons/fa";

interface ConfirmEndTournamentModalProps {
	isOpen: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export const ConfirmEndTournamentModal = ({
	isOpen,
	onConfirm,
	onCancel,
}: ConfirmEndTournamentModalProps) => {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
			onClick={onCancel}
		>
			<div
				role="dialog"
				aria-modal="true"
				className="relative w-full max-w-md rounded-lg bg-gray-900 p-6 text-left shadow-2xl border-2 border-red-500"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center gap-4 mb-4">
					<div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
						<FaExclamationTriangle className="h-6 w-6 text-red-500" />
					</div>
					<h2 className="text-xl font-bold text-white">Finalizar Torneo</h2>
				</div>

				<div className="mb-6">
					<p className="text-gray-300 mb-3">
						¿Estás seguro de que deseas finalizar el torneo?
					</p>
					<div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
						<p className="text-sm text-red-200 font-semibold mb-2">
							⚠️ Esta acción eliminará:
						</p>
						<ul className="text-sm text-red-300 space-y-1 list-disc list-inside">
							<li>Todos los equipos</li>
							<li>Historial completo de partidos</li>
							<li>Cola de espera</li>
							<li>Tabla de posiciones</li>
						</ul>
					</div>
					<p className="text-sm text-gray-400 mt-3">
						💡 Tip: Antes de finalizar, puedes compartir los resultados en redes
						sociales.
					</p>
				</div>

				<div className="flex gap-3">
					<button
						type="button"
						onClick={onCancel}
						className="flex-1 rounded-lg bg-gray-700 px-4 py-3 font-semibold text-white transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
					>
						Cancelar
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="flex-1 rounded-lg bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
					>
						Finalizar Torneo
					</button>
				</div>
			</div>
		</div>
	);
};
