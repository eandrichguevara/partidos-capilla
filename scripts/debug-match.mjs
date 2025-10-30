import fs from "fs/promises";
import path from "path";

async function loadLogoVectors() {
	const p = path.join(process.cwd(), "public", "logo_vectors.json");
	const raw = await fs.readFile(p, "utf8");
	return JSON.parse(raw);
}

async function loadLogoDatabase() {
	const p = path.join(
		process.cwd(),
		"src",
		"app",
		"api",
		"logoAssignment",
		"logoDatabase.json"
	);
	const raw = await fs.readFile(p, "utf8");
	return JSON.parse(raw);
}

function dot(a, b) {
	const n = Math.min(a.length, b.length);
	if (n === 0) return -1;
	let s = 0;
	for (let i = 0; i < n; i++) s += (a[i] || 0) * (b[i] || 0);
	return s;
}

function topMatches(embedding, logos, topN = 5) {
	const res = logos.map((l) => ({
		id: l.id,
		path: l.path,
		score: l.vector && l.vector.length > 0 ? dot(embedding, l.vector) : -1,
	}));
	res.sort((a, b) => b.score - a.score);
	return res.slice(0, topN);
}

async function getEmbedding(text) {
	console.log("Inicializando pipeline @xenova/transformers...");
	const { pipeline } = await import("@xenova/transformers");
	const pipe = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
		quantized: true,
	});
	const out = await pipe(text, { pooling: "mean", normalize: true });
	return Array.from(out.data);
}

async function run(names) {
	const logos = await loadLogoVectors();
	const db = await loadLogoDatabase();
	for (const name of names) {
		console.log("\n=== Diagnóstico para:", name, "===");
		try {
			const emb = await getEmbedding(name);
			const tops = topMatches(emb, logos, 8);
			tops.forEach((t, i) => {
				console.log(`${i + 1}. ${t.id} — score: ${t.score}`);
			});
			// también calcular matching por keywords (simpleKeywordMatch)
			const kw = simpleKeywordMatch(name, db);
			console.log("Keyword best:", kw);
		} catch (err) {
			console.error("Error generando embedding para:", name, err);
		}
	}
}

const args = process.argv.slice(2);
const names = args.length > 0 ? args : ["La Roja", "U de Chile", "Cruzados"];
run(names).catch((err) => {
	console.error(err);
	process.exit(1);
});

function simpleKeywordMatch(teamName, database) {
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

			if (exclusionWords.some((w) => teamName.toLowerCase().includes(w))) {
				continue;
			}
		}

		const keywords = (logoData.keywords || "")
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
				if (teamName.toLowerCase().includes(nw)) penalty += 1;
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
