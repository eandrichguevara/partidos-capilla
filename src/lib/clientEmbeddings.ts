"use client";

// Client-side embeddings helper using @xenova/transformers in the browser.
// This file will be bundled only for client code (use from a React client component).

let clientPipeline: unknown = null;
let isInitializing = false;
let initializationError: Error | null = null;

export async function getClientPipeline(): Promise<unknown> {
	if (clientPipeline) return clientPipeline;

	if (initializationError) {
		throw initializationError;
	}

	// Prevent multiple simultaneous initialization attempts
	if (isInitializing) {
		// Wait for the other initialization to complete
		await new Promise((resolve) => setTimeout(resolve, 100));
		return getClientPipeline();
	}

	// Check if we're in a browser environment
	if (typeof window === "undefined") {
		const error = new Error(
			"getClientPipeline can only be called in a browser environment"
		);
		initializationError = error;
		throw error;
	}

	// Check for required browser APIs
	if (!window.SharedArrayBuffer) {
		console.warn(
			"clientEmbeddings: SharedArrayBuffer is not available. This may be due to missing CORS headers."
		);
	}

	isInitializing = true;

	// Dynamic import so it only loads in the browser
	console.debug(
		"clientEmbeddings: starting dynamic import of @xenova/transformers"
	);
	let mod: unknown;
	try {
		mod = await import("@xenova/transformers");
	} catch (impErr) {
		console.error("clientEmbeddings: dynamic import failed:", impErr);
		isInitializing = false;

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

		const error = new Error(
			"Failed to import @xenova/transformers: " + String(impErr)
		);
		initializationError = error;
		throw error;
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
		isInitializing = false;
		console.debug("clientEmbeddings: pipeline ready");
		return clientPipeline;
	} catch (pipeErr) {
		console.error("clientEmbeddings: pipeline initialization failed:", pipeErr);
		isInitializing = false;
		// Re-throw a clearer error for upstream handling
		const error = new Error(
			"Failed to initialize transformers pipeline: " + String(pipeErr)
		);
		initializationError = error;
		throw error;
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

// Remove definite/indefinite articles from a team name to avoid them affecting embeddings.
export function removeDefiniteArticles(text: string) {
	if (!text || typeof text !== "string") return text;

	// Articles in Spanish and English (lowercased, no diacritics)
	const articles = new Set([
		"el",
		"la",
		"los",
		"las",
		"lo",
		"un",
		"una",
		"unos",
		"unas",
		"al",
		"del",
		"the",
		"a",
		"an",
	]);

	const normalize = (s: string) =>
		s
			.toLowerCase()
			.normalize("NFD")
			.replace(/\p{Diacritic}/gu, "");

	// Split on non-word characters, keep tokens that are not articles
	const tokens = text.split(/[^A-Za-z0-9À-ÿ]+/).filter(Boolean);
	const filtered = tokens.filter((t) => !articles.has(normalize(t)));

	// Return a cleaned string; if everything was removed, return original trimmed
	if (filtered.length === 0) return text.trim();
	return filtered.join(" ");
}
