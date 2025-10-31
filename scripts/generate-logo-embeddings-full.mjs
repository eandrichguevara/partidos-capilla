import fs from "fs/promises";
import path from "path";

async function main() {
	const root = process.cwd();
	const dbPath = path.join(root, "public", "logo_database.json");
	const outPath = path.join(root, "public", "logo_vectors.json");

	const dbRaw = await fs.readFile(dbPath, "utf8");
	const logos = JSON.parse(dbRaw);

	const { pipeline } = await import("@xenova/transformers");
	const embedder = await pipeline(
		"feature-extraction",
		"Xenova/all-MiniLM-L6-v2",
		{ quantized: false }
	);

	const results = [];
	for (const logo of logos) {
		const out = await embedder(logo.keywords, {
			pooling: "mean",
			normalize: true,
		});
		const vector = Array.from(out.data);
		results.push({ id: logo.id, path: logo.path, vector });
	}

	await fs.writeFile(outPath, JSON.stringify(results), "utf8");
}

main().catch((err) => {
	console.error("Error generando embeddings:", err);
	process.exit(1);
});
