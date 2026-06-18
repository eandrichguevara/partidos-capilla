"use client";

// 🐴 ponytail: cargar desde CDN evita todo el drama de bundling con Next.js/Turbopack
// El paquete @xenova/transformers tiene problemas conocidos con Object.keys(process.env)
// en entornos donde process no existe como se espera. CDN = cero problemas.

let clientPipeline: unknown = null;
let isInitializing = false;
let initializationError: Error | null = null;
let transformersModule: unknown = null;

async function loadTransformersFromCDN(): Promise<unknown> {
	if (transformersModule) return transformersModule;

	// 🐴 ponytail: eval evita que TypeScript/Turbopack intenten resolver el módulo
	const mod = await eval(
		'import("https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2")'
	);
	transformersModule = mod;
	return mod;
}

export async function getClientPipeline(): Promise<unknown> {
	if (clientPipeline) return clientPipeline;

	if (initializationError) {
		throw initializationError;
	}

	if (isInitializing) {
		await new Promise((resolve) => setTimeout(resolve, 100));
		return getClientPipeline();
	}

	if (typeof window === "undefined") {
		const error = new Error(
			"getClientPipeline can only be called in a browser environment"
		);
		initializationError = error;
		throw error;
	}

	isInitializing = true;

	let mod: unknown;
	try {
		mod = await loadTransformersFromCDN();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const env = (mod as any).env;
		if (env) {
			env.allowLocalModels = false;
			env.useBrowserCache = true;
		}
	} catch (impErr) {
		console.error("clientEmbeddings: CDN load failed:", impErr);
		isInitializing = false;
		const error = new Error(
			"Failed to load @xenova/transformers from CDN: " + String(impErr)
		);
		initializationError = error;
		throw error;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	if (!mod || typeof (mod as any).pipeline !== "function") {
		console.error(
			"clientEmbeddings: module did not expose a 'pipeline' function",
			mod
		);
		throw new Error(
			"@xenova/transformers did not expose a pipeline function."
		);
	}

	try {
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
		return clientPipeline;
	} catch (pipeErr) {
		console.error("clientEmbeddings: pipeline initialization failed:", pipeErr);
		isInitializing = false;
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
		return Array.from(out.data as Iterable<number>);
	} catch (err) {
		console.error("clientEmbeddings: getClientEmbedding failed:", err);
		throw err;
	}
}

export function removeDefiniteArticles(text: string) {
	if (!text || typeof text !== "string") return text;

	const omittedWords = new Set([
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
		"FC",
	]);

	const normalize = (s: string) =>
		s
			.toLowerCase()
			.normalize("NFD")
			.replace(/\p{Diacritic}/gu, "");

	const tokens = text.split(/[^A-Za-z0-9À-ÿ]+/).filter(Boolean);
	const filtered = tokens.filter((t) => !omittedWords.has(normalize(t)));

	if (filtered.length === 0) return text.trim();
	return filtered.join(" ");
}
