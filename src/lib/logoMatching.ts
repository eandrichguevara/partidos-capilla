export type LogoVector = {
	id: string;
	path: string;
	vector: number[];
};

let cachedLogoVectors: LogoVector[] | null = null;

export async function fetchLogoVectors(): Promise<LogoVector[]> {
	// Cache in-memory for session lifetime (prevents recomputing embeddings multiple times)
	if (cachedLogoVectors) return cachedLogoVectors;

	// 1) Try to load precomputed vectors from public asset
	try {
		const publicRes = await fetch("/logo_vectors.json");
		if (publicRes.ok) {
			const json = await publicRes.json();
			if (Array.isArray(json) && json.length > 0) {
				cachedLogoVectors = json as LogoVector[];
				return json as LogoVector[];
			}
		}
	} catch (err) {
		// ignore and try to compute on client
		console.debug(
			"/logo_vectors.json not available or empty, will try client-side generation:",
			err
		);
	}

	// 2) Fallback: compute embeddings in the client from the logo database
	if (typeof window === "undefined") {
		throw new Error(
			"Client-side embedding generation requires a browser environment"
		);
	}

	const dbRes = await fetch("/logo_database.json");
	if (!dbRes.ok)
		throw new Error(
			"No se pudo obtener /logo_database.json para generar embeddings en cliente"
		);
	const logos = (await dbRes.json()) as Array<{
		id: string;
		path: string;
		keywords: string;
	}>;
	// Dynamic import client pipeline helper (bundled only for client code)
	try {
		const mod = await import("./clientEmbeddings");
		const getClientEmbedding = mod.getClientEmbedding as (
			text: string
		) => Promise<number[]>;

		const results: LogoVector[] = [];
		for (const logo of logos) {
			try {
				const vector = await getClientEmbedding(logo.keywords ?? logo.id);
				results.push({ id: logo.id, path: logo.path, vector });
			} catch (err) {
				console.warn("Fallo generando embedding para", logo.id, err);
				results.push({ id: logo.id, path: logo.path, vector: [] });
			}
		}

		cachedLogoVectors = results;
		return results;
	} catch (err) {
		// If the transformers library fails to initialize in the browser
		// (some environments / bundlers may not support it), fall back to
		// returning empty vectors so the matching logic can fall back to
		// keyword-based matching elsewhere.
		console.warn(
			"No fue posible inicializar pipeline de embeddings en cliente, se devolverán vectores vacíos:",
			err
		);
		const results = logos.map((logo) => ({
			id: logo.id,
			path: logo.path,
			vector: [] as number[],
		}));
		cachedLogoVectors = results;
		return results;
	}
}

export type LogoDatabaseEntry = {
	id: string;
	path: string;
	keywords: string;
	negativeKeywords?: string;
	exclusions?: string;
};

export async function fetchLogoDatabase(): Promise<LogoDatabaseEntry[]> {
	const res = await fetch("/logo_database.json");
	if (!res.ok) throw new Error("No se pudo cargar /logo_database.json");
	return (await res.json()) as LogoDatabaseEntry[];
}

export function simpleKeywordMatch(
	teamName: string,
	database: LogoDatabaseEntry[]
) {
	const teamTokens = teamName
		.toLowerCase()
		.split(/[^A-Za-z0-9]+/)
		.filter((t) => t.length > 0);

	let best = { id: "", path: "", score: -Infinity };

	for (const logoData of database) {
		// Exclusiones
		if (logoData.exclusions) {
			const exclusionWords = logoData.exclusions
				.toLowerCase()
				.split(",")
				.map((w) => w.trim())
				.filter((w) => w.length > 0);

			if (exclusionWords.some((w) => teamName.includes(w))) {
				continue;
			}
		}

		const keywords = logoData.keywords
			.toLowerCase()
			.split(/[^A-Za-z0-9]+/)
			.map((k) => k.trim())
			.filter((k) => k.length > 0);

		let matchCount = 0;
		for (const tk of teamTokens) {
			if (keywords.includes(tk)) matchCount++;
		}

		// Penaliza por negativeKeywords
		let penalty = 0;
		if (logoData.negativeKeywords) {
			const negativeWords = logoData.negativeKeywords
				.toLowerCase()
				.split(",")
				.map((w) => w.trim())
				.filter((w) => w.length > 0);
			for (const nw of negativeWords) {
				if (teamName.includes(nw)) penalty += 1;
			}
		}

		const score = matchCount - penalty * 0.5;

		if (score > best.score) {
			best = { id: logoData.id, path: logoData.path, score };
		}
	}

	if (best.id === "" && database.length > 0) {
		return { id: database[0].id, path: database[0].path, score: 0 };
	}

	return best;
}

export function cosineSimilarity(a: number[], b: number[]) {
	// assume both vectors have same length; if not, use the min length
	const n = Math.min(a.length, b.length);
	if (n === 0) return -1;
	let dot = 0;
	for (let i = 0; i < n; i++) {
		dot += (a[i] || 0) * (b[i] || 0);
	}
	return dot;
}

export type MatchResult = {
	id: string;
	path: string;
	score: number;
};

export function findTopMatches(
	embedding: number[],
	logos: LogoVector[],
	topN = 3
): MatchResult[] {
	const results: MatchResult[] = [];

	for (const logo of logos) {
		const score =
			logo.vector && logo.vector.length > 0
				? cosineSimilarity(embedding, logo.vector)
				: -1;
		results.push({ id: logo.id, path: logo.path, score });
	}

	results.sort((a, b) => b.score - a.score);
	return results.slice(0, topN);
}
