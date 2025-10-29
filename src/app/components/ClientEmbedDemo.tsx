"use client";

import { useState } from "react";
import { getClientEmbedding } from "@/lib/clientEmbeddings";
import {
	fetchLogoVectors,
	findTopMatches,
	MatchResult,
} from "@/lib/logoMatching";

export default function ClientEmbedDemo() {
	const [text, setText] = useState("Universidad Católica");
	const [embedding, setEmbedding] = useState<number[] | null>(null);
	const [matches, setMatches] = useState<MatchResult[] | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleGenerate() {
		setLoading(true);
		try {
			// 1) fetch precomputed logo vectors
			const logos = await fetchLogoVectors();
			// 2) compute embedding in browser (WASM)
			const emb = await getClientEmbedding(text);
			setEmbedding(emb);
			// 3) compute top matches
			const top = findTopMatches(emb, logos, 4);
			setMatches(top);
		} catch (err) {
			console.error(err);
			const message =
				err && typeof err === "object" && "message" in err
					? (err as { message?: string }).message ?? String(err)
					: String(err);
			alert("Error generando embedding: " + message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="p-4 border rounded">
			<h3 className="font-semibold mb-2">
				Demo: Embeddings en el navegador (WASM)
			</h3>
			<input
				className="border p-2 w-full mb-2"
				value={text}
				onChange={(e) => setText(e.target.value)}
			/>
			<div className="flex gap-2">
				<button
					onClick={handleGenerate}
					disabled={loading}
					className="px-3 py-2 bg-blue-600 text-white rounded"
				>
					{loading ? "Generando..." : "Generar embedding"}
				</button>
			</div>

			{embedding && (
				<div className="mt-4">
					<div className="text-sm text-muted mb-2">
						Embedding (primeros 16 valores):
					</div>
					<pre className="bg-gray-100 p-2 rounded text-xs">
						{JSON.stringify(embedding.slice(0, 16), null, 2)}
					</pre>
					<div className="text-xs text-gray-600 mt-2">
						Longitud: {embedding.length}
					</div>
				</div>
			)}

			{matches && (
				<div className="mt-4">
					<div className="text-sm font-medium mb-2">Top matches</div>
					<div className="grid grid-cols-2 gap-3">
						{matches.map((m) => (
							<div
								key={m.id}
								className="flex items-center gap-2 p-2 border rounded"
							>
								<img
									src={m.path}
									alt={m.id}
									className="w-12 h-12 object-contain"
								/>
								<div>
									<div className="text-sm font-semibold">{m.id}</div>
									<div className="text-xs text-gray-600">
										Score: {m.score.toFixed(4)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
