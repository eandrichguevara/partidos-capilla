"use client";

import { useState } from "react";
import { getClientEmbedding } from "@/lib/clientEmbeddings";

export default function ClientEmbedDemo() {
	const [text, setText] = useState("Universidad Católica");
	const [embedding, setEmbedding] = useState<number[] | null>(null);
	const [loading, setLoading] = useState(false);

	async function handleGenerate() {
		setLoading(true);
		try {
			const emb = await getClientEmbedding(text);
			setEmbedding(emb);
		} catch (err) {
			console.error(err);
			const message =
				err && typeof err === "object" && "message" in err
					? (err as any).message
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
		</div>
	);
}
