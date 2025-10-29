import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import logoDatabaseJson from "./logoDatabase.json";

// 1. IMPORTACIÓN DE TRANSFORMERS (dinámica)
// Usamos una importación dinámica dentro de una clase para un patrón Singleton.
// Esto asegura que el modelo de IA se cargue solo UNA VEZ en el servidor (si está disponible).
class EmbeddingPipeline {
	static instance: any = null;

	static async getInstance() {
		if (this.instance === null) {
			try {
				const { pipeline } = await import("@xenova/transformers");
				console.log("Cargando modelo de embeddings por primera vez...");
				this.instance = await pipeline(
					"feature-extraction",
					"Xenova/all-MiniLM-L6-v2",
					{
						quantized: true,
					}
				);
				console.log("Modelo de embeddings cargado exitosamente.");
			} catch (err) {
				console.error("No fue posible cargar @xenova/transformers:", err);
				this.instance = null;
				throw err;
			}
		}
		return this.instance;
	}
}

// Flag global que indica si el servicio de embeddings está disponible
let embeddingsAvailable = true;

// Importamos la base de datos estática desde JSON para poder compartirla
// con el script de generación de embeddings.
type LogoData = {
	id: string;
	path: string;
	keywords: string;
	negativeKeywords?: string;
	exclusions?: string;
};
const logoDatabase: LogoData[] = logoDatabaseJson as unknown as LogoData[];

// --- "BASE DE DATOS VECTORIAL" SIMPLE ---
// Usaremos un caché en memoria para almacenar los vectores de tus logos.
// No necesitamos una DB real para una cantidad pequeña/mediana de logos.
type LogoVector = {
	id: string;
	path: string;
	vector: number[];
};

// Este caché persistirá mientras el servidor de Next.js esté "caliente".
let cachedLogoVectors: LogoVector[] = [];

/**
 * Calcula el embedding (vector) para un texto dado.
 */
async function getEmbedding(text: string, embedder: any): Promise<number[]> {
	const output = await embedder(text, {
		pooling: "mean", // Promedia los vectores de las palabras para obtener un vector de la frase
		normalize: true, // Normaliza el vector, es crucial para la similitud de coseno
	});

	// Convierte el Float32Array a un array de números estándar
	return Array.from(output.data);
}

/**
 * Pre-calcula y cachea los vectores para todos los logos.
 */
async function getLogoVectors(): Promise<LogoVector[]> {
	// Si ya los tenemos en caché, los devolvemos
	if (cachedLogoVectors.length > 0) {
		return cachedLogoVectors;
	}

	// Primero, si existe un archivo con vectores precomputados, lo cargamos.
	const vectorsPath = path.join(
		process.cwd(),
		"src",
		"app",
		"api",
		"logoAssignment",
		"logo_vectors.json"
	);

	try {
		if (fs.existsSync(vectorsPath)) {
			const raw = fs.readFileSync(vectorsPath, "utf-8");
			const parsed = JSON.parse(raw) as Array<{
				id: string;
				path: string;
				vector: number[];
			}>;
			cachedLogoVectors = parsed.map((p) => ({
				id: p.id,
				path: p.path,
				vector: p.vector,
			}));
			console.log("Cargados vectores de logos desde logo_vectors.json");
			return cachedLogoVectors;
		}
	} catch (err) {
		console.warn("No se pudo leer logo_vectors.json:", err);
		// seguimos intentando generar embeddings dinámicamente
	}

	console.log("Generando vectores de logos por primera vez (runtime)...");
	const newLogoVectors: LogoVector[] = [];
	try {
		const embedder = await EmbeddingPipeline.getInstance();
		for (const logo of logoDatabase) {
			const vector = await getEmbedding(logo.keywords, embedder);
			newLogoVectors.push({ id: logo.id, path: logo.path, vector: vector });
		}
		cachedLogoVectors = newLogoVectors;
		console.log("Vectores de logos cacheados.");
		return cachedLogoVectors;
	} catch (err) {
		// Si falla la creación de embeddings (ej: entorno sin libonnxruntime),
		// activamos el fallback: no usamos embeddings pero seguimos funcionando.
		embeddingsAvailable = false;
		console.warn(
			"Embeddings no disponibles, usando fallback de keywords:",
			err
		);
		// Creamos vectores vacíos para mantener la compatibilidad de tipos
		cachedLogoVectors = logoDatabase.map((logo) => ({
			id: logo.id,
			path: logo.path,
			vector: [],
		}));
		return cachedLogoVectors;
	}
}

/**
 * Fallback simple basado en keywords: cuenta coincidencias de tokens.
 */
function simpleKeywordMatch(teamName: string) {
	const teamTokens = teamName
		.toLowerCase()
		.split(/[^\p{L}\d]+/u)
		.filter((t) => t.length > 0);

	let best = { id: "", path: "", score: -Infinity };

	for (const logo of logoDatabase) {
		const logoData = logo;

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
			.split(/[^\p{L}\d]+/u)
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

		// Score simple: coincidencias - penalizaciones (ajustable)
		const score = matchCount - penalty * 0.5;

		if (score > best.score) {
			best = { id: logoData.id, path: logoData.path, score };
		}
	}

	// Si no hubo match, devolvemos el primer logo por defecto
	if (best.id === "" && logoDatabase.length > 0) {
		return { id: logoDatabase[0].id, path: logoDatabase[0].path, score: 0 };
	}

	return best;
}

// --- FUNCIÓN DE SIMILITUD ---
/**
 * Calcula la similitud de coseno entre dos vectores (listas de números).
 * Un valor cercano a 1 significa "muy similar".
 * Un valor cercano a 0 significa "nada similar".
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
	let dotProduct = 0;
	// Los vectores ya están normalizados (magnitud 1),
	// por lo que la similitud de coseno es simplemente el producto punto.
	for (let i = 0; i < vecA.length; i++) {
		dotProduct += (vecA[i] || 0) * (vecB[i] || 0);
	}
	return dotProduct;
}

// --- HANDLER GET PARA PRECARGA ---
export async function GET() {
	try {
		// Intenta inicializar el pipeline y los vectores
		await getLogoVectors();
		try {
			await EmbeddingPipeline.getInstance();
		} catch (err) {
			// No consideramos esto fatal: activamos fallback
			embeddingsAvailable = false;
			console.warn("Embeddings no disponibles en GET:", err);
		}

		return NextResponse.json({
			message: embeddingsAvailable
				? "Modelos precargados exitosamente"
				: "Embeddings no disponibles, usando fallback de keywords",
			embeddingsAvailable,
			totalLogos: logoDatabase.length,
		});
	} catch (error) {
		console.error("Error al precargar modelos:", error);
		// Si algo crítico falla, devolvemos 500
		return NextResponse.json(
			{
				message: "Error al precargar modelos",
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}

// --- HANDLER DE LA API (App Router) ---
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { teamName } = body;

		if (typeof teamName !== "string" || teamName.trim() === "") {
			return NextResponse.json(
				{ message: "teamName (string) es requerido." },
				{ status: 400 }
			);
		}

		const teamNameLower = teamName.toLowerCase();

		// 1. Asegúrate de que los vectores de los logos estén listos
		await getLogoVectors();

		// Si los embeddings no están disponibles, usamos el fallback por keywords
		if (!embeddingsAvailable) {
			const result = simpleKeywordMatch(teamNameLower);
			return NextResponse.json(result);
		}

		// Si llegamos acá, intentamos usar el embedder. Si falla por alguna razón,
		// caemos al fallback de keywords.
		try {
			const logoVectors = cachedLogoVectors;
			const embedder = await EmbeddingPipeline.getInstance();
			const inputVector = await getEmbedding(teamName, embedder);

			let bestMatch = {
				id: "",
				path: "",
				score: -Infinity,
			};

			for (const logo of logoVectors) {
				const logoData = logoDatabase.find((l) => l.id === logo.id);

				if (logoData?.exclusions) {
					const exclusionWords = logoData.exclusions
						.toLowerCase()
						.split(",")
						.map((w) => w.trim())
						.filter((w) => w.length > 0);

					const hasExclusion = exclusionWords.some((word) =>
						teamNameLower.includes(word)
					);

					if (hasExclusion) continue;
				}

				let score = 0;
				if (logo.vector.length > 0) {
					score = cosineSimilarity(inputVector, logo.vector);
				}

				if (logoData?.negativeKeywords) {
					const negativeWords = logoData.negativeKeywords
						.toLowerCase()
						.split(",")
						.map((w) => w.trim())
						.filter((w) => w.length > 0);

					const matchedNegatives = negativeWords.filter((word) =>
						teamNameLower.includes(word)
					);

					if (matchedNegatives.length > 0) {
						score = score - matchedNegatives.length * 0.3;
					}
				}

				if (score > bestMatch.score) {
					bestMatch = { id: logo.id, path: logo.path, score };
				}
			}

			return NextResponse.json(bestMatch);
		} catch (err) {
			console.warn(
				"Fallo al usar embeddings en POST, aplicando fallback:",
				err
			);
			const result = simpleKeywordMatch(teamNameLower);
			return NextResponse.json(result);
		}
	} catch (error) {
		console.error("Error al procesar la búsqueda semántica:", error);
		return NextResponse.json(
			{
				message: "Error interno del servidor",
				error: (error as Error).message,
			},
			{ status: 500 }
		);
	}
}
