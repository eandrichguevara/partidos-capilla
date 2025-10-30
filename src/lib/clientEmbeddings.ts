// Client-side embeddings helper using @xenova/transformers in the browser.
// This file will be bundled only for client code (use from a React client component).

let clientPipeline: unknown = null;

export async function getClientPipeline(): Promise<unknown> {
	if (clientPipeline) return clientPipeline;

	// Dynamic import so it only loads in the browser
	console.debug(
		"clientEmbeddings: starting dynamic import of @xenova/transformers"
	);
	let mod: unknown;
	try {
		mod = await import("@xenova/transformers");
	} catch (impErr) {
		console.error("clientEmbeddings: dynamic import failed:", impErr);

		// Heurístico: si el error viene de prebundling/entorno (dev server) o de
		// evaluación anticipada, dar una sugerencia al desarrollador para ajustar
		// la configuración del bundler (Vite/Next) — esto causa a menudo el
		// "Cannot convert undefined or null to object" originado en paquetes
		// que esperan un runtime distinto.
		try {
			const maybeErr = impErr as unknown as { message?: unknown };
			const msg = String(maybeErr?.message ?? impErr);
			if (
				msg.includes("Cannot convert undefined or null to object") ||
				msg.includes("isEmpty") ||
				msg.includes("dev-base") ||
				msg.includes("instantiateModule")
			) {
				console.warn(
					"clientEmbeddings: parece un error de pre-bundling/SSR del dev server. " +
						"Si usas Vite, añade `optimizeDeps: { exclude: ['@xenova/transformers'] }` " +
						"y `ssr: { noExternal: ['@xenova/transformers'] }` en tu vite.config. " +
						"En Next.js/webpack evita que el paquete sea evaluado en el servidor (marcar como external)."
				);
			}
		} catch {
			// ignore heuristic errors
		}

		throw new Error("Failed to import @xenova/transformers: " + String(impErr));
	}

	// Basic sanity checks: ensure the imported module exposes a pipeline creator
	// (some bundlers or mocks may return undefined/defaults)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!mod || typeof (mod as any).pipeline !== "function") {
		console.error(
			"clientEmbeddings: @xenova/transformers import did not expose a 'pipeline' function",
			mod
		);
		throw new Error(
			"@xenova/transformers did not expose a pipeline function. Check bundler/mocks/CSP and network access."
		);
	}

	try {
		console.debug(
			"clientEmbeddings: creating pipeline (this may download model/WASM)..."
		);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const pipe = await (mod as any).pipeline(
			"feature-extraction",
			"Xenova/all-MiniLM-L6-v2",
			{
				quantized: true,
			}
		);

		clientPipeline = pipe;
		console.debug("clientEmbeddings: pipeline ready");
		return clientPipeline;
	} catch (pipeErr) {
		console.error("clientEmbeddings: pipeline initialization failed:", pipeErr);
		// Re-throw a clearer error for upstream handling
		throw new Error(
			"Failed to initialize transformers pipeline: " + String(pipeErr)
		);
	}
}

export async function getClientEmbedding(text: string): Promise<number[]> {
	try {
		const pipe = await getClientPipeline();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const out = await (pipe as any)(text, { pooling: "mean", normalize: true });

		// `out.data` is expected to be a TypedArray (Float32Array)
		return Array.from(out.data as Iterable<number>);
	} catch (err) {
		console.error("clientEmbeddings: getClientEmbedding failed:", err);
		throw err;
	}
}
