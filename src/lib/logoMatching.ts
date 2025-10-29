export type LogoVector = {
	id: string;
	path: string;
	vector: number[];
};

export async function fetchLogoVectors(): Promise<LogoVector[]> {
	const res = await fetch("/api/logoAssignment/vectors");
	if (!res.ok) throw new Error("No se pudieron obtener los vectores de logos");
	const json = await res.json();
	return json as LogoVector[];
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
