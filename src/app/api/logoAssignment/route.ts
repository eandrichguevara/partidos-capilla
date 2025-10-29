import { NextRequest, NextResponse } from "next/server";

// 1. INSTALACIÓN REQUERIDA:
// npm install @xenova/transformers

// 2. IMPORTACIÓN DE TRANSFORMERS
// Usamos una importación dinámica dentro de una clase para un patrón Singleton.
// Esto asegura que el modelo de IA se cargue solo UNA VEZ en el servidor.
class EmbeddingPipeline {
	static instance: any = null;

	static async getInstance() {
		if (this.instance === null) {
			// Importa la biblioteca dinámicamente
			const { pipeline } = await import("@xenova/transformers");

			// Carga el modelo. Esto puede tardar unos segundos la PRIMERA VEZ
			// que se inicia el servidor. Las siguientes veces será instantáneo.
			// 'Xenova/all-MiniLM-L6-v2' es un modelo excelente, pequeño y rápido
			// para similitud de texto.
			console.log("Cargando modelo de embeddings por primera vez...");
			this.instance = await pipeline(
				"feature-extraction",
				"Xenova/all-MiniLM-L6-v2",
				{
					quantized: true, // Usa una versión más pequeña y rápida
				}
			);
			console.log("Modelo de embeddings cargado exitosamente.");
		}
		return this.instance;
	}
}

// --- TIPO DE LOGO EN LA BASE DE DATOS ---
type LogoData = {
	id: string;
	path: string;
	keywords: string;
	negativeKeywords?: string; // Opcional: reduce el score si aparecen
	exclusions?: string; // Opcional: descarta el logo si aparecen
};

// --- BASE DE DATOS DE LOGOS ---
// Base de datos con todos los escudos disponibles y sus palabras clave descriptivas
// Keywords negativas: reducen el score si aparecen en el nombre del equipo
// Exclusiones: si el nombre contiene estas palabras, el logo NO se considerará
const logoDatabase: LogoData[] = [
	{
		id: "franja_azul_cielo",
		path: "/escudos/franja, azul cielo, direccion, flecha.png",
		keywords:
			"franja, azul cielo, dirección, flecha, señal, movimiento, banda, celeste, orientación, camino",
	},
	{
		id: "bota_de_oro",
		path: "/escudos/bota de oro, zapatilla, zapato, goleador, pichichi.png",
		keywords:
			"bota de oro, zapatilla, zapato, goleador, pichichi, premio, fútbol, máximo goleador, trofeo, dorado",
	},
	{
		id: "sol_puesta_albiceleste",
		path: "/escudos/sol, puesta, horizonte, albiceleste, amanecer.png",
		keywords:
			"sol, puesta, horizonte, albiceleste, amanecer, atardecer, cielo, luz, azul, blanco, argentina, día, nuevo comienzo",
	},
	{
		id: "atletico_azul_celeste",
		path: "/escudos/A, atletico, azul celeste.png",
		keywords: "atlético, azul, celeste, letra A, deporte, cielo, agua",
		negativeKeywords: "", // Opcional: palabras que reducen el score
		exclusions: "", // Opcional: palabras que descartan completamente el logo
	},
	{
		id: "anclas_oxidadas",
		path: "/escudos/Anclas oxidadas.png",
		keywords: "ancla, oxidado, mar, marino, náutico, barco, navío, vintage",
	},
	{
		id: "aguila_real",
		path: "/escudos/aguila, real.png",
		keywords: "águila, real, ave, pájaro, majestuoso, vuelo, libertad, cielo",
	},
	{
		id: "ala_angel",
		path: "/escudos/ala, angel, pureza, santidad.png",
		keywords:
			"ala, ángel, pureza, santidad, divino, celestial, blanco, sagrado",
		negativeKeywords: "demonio, oscuro, maldito",
	},
	{
		id: "anillo_santos",
		path: "/escudos/anillo, santos.png",
		keywords: "anillo, santos, círculo, sagrado, reliquia, poder",
		negativeKeywords: "misioneros, mormones, moroni",
	},
	{
		id: "anillos_enredado",
		path: "/escudos/anillos, enredado, verde amarillo.png",
		keywords: "anillos, enredado, verde, amarillo, enlazado, unión, conexión",
	},
	{
		id: "arbol_naturaleza",
		path: "/escudos/arbol, naturaleza, fuerza.png",
		keywords: "árbol, naturaleza, fuerza, verde, bosque, raíces, crecimiento",
	},
	{
		id: "aurora_boreal",
		path: "/escudos/aurora boreal, verde, planta.png",
		keywords: "aurora, boreal, verde, planta, luz, norte, mágico, natural",
	},
	{
		id: "buho",
		path: "/escudos/buho.png",
		keywords: "búho, lechuza, sabiduría, noche, nocturno, inteligente",
	},
	{
		id: "caballero_templario",
		path: "/escudos/caballero, templario, metal, cruz roja, honor.png",
		keywords:
			"caballero, templario, metal, cruz, rojo, honor, guerrero, medieval",
	},
	{
		id: "caballo_magico",
		path: "/escudos/caballo, ser magico, verde.png",
		keywords: "caballo, mágico, verde, unicornio, místico, fantasía",
	},
	{
		id: "casco_robot",
		path: "/escudos/casco, robot, plata.png",
		keywords: "casco, robot, plata, tecnología, futurista, máquina, metal",
	},
	{
		id: "chargers_rayo",
		path: "/escudos/chargers, rayo, energia.png",
		keywords:
			"chargers, rayo, energía, electricidad, cargadores, poder, velocidad, trueno",
	},
	{
		id: "cobra_verde",
		path: "/escudos/cobra, verde.png",
		keywords: "cobra, verde, serpiente, venenosa, reptil, peligrosa, ágil",
	},
	{
		id: "colo_colo",
		path: "/escudos/colo-colo, lautaro, caupolican, mapuche, araucano.png",
		keywords:
			"colo colo, colo-colo, cacique, lautaro, caupolicán, mapuche, araucano, chile, guerrero, indígena, fútbol chileno",
	},
	{
		id: "cometa_azul",
		path: "/escudos/cometa, azul.png",
		keywords: "cometa, azul, espacio, estrella, velocidad, cosmos",
	},
	{
		id: "condor_chile",
		path: "/escudos/condor, chile, la roja, vuelo.png",
		keywords:
			"la roja, chile, cóndor, selección chilena, equipo nacional, fútbol chileno, roja, vuelo, ave, andino, majestuoso",
	},
	{
		id: "corazon_espada",
		path: "/escudos/corazon, espada, desamor.png",
		keywords: "corazón, espada, desamor, dolor, atravesado, roto, pasión",
	},
	{
		id: "corona_M_dorada",
		path: "/escudos/corona, M, dorada.png",
		keywords: "corona, M, dorada, oro, realeza, majestuoso, letra, rey",
	},
	{
		id: "corona_dorada",
		path: "/escudos/corona, dorada.png",
		keywords: "corona, dorada, oro, rey, realeza, poder, monarca",
	},
	{
		id: "craneo_negro",
		path: "/escudos/craneo, negro.png",
		keywords: "cráneo, negro, calavera, muerte, oscuro, temible, pirata",
	},
	{
		id: "diablo_rojo",
		path: "/escudos/diablo, demonio, rojo, enojo.png",
		keywords: "diablo, demonio, rojo, enojo, fuego, infernal, ira, furia",
	},
	{
		id: "diamante_negro",
		path: "/escudos/diamante, negro.png",
		keywords: "diamante, negro, joya, elegante, lujo, valioso, oscuro",
	},
	{
		id: "edificio_futuro",
		path: "/escudos/dificio, futuro.png",
		keywords: "edificio, futuro, construcción, ciudad, moderno, arquitectura",
	},
	{
		id: "dragon_rojo",
		path: "/escudos/dragon, rojo, ira.png",
		keywords: "dragón, rojo, ira, fuego, furia, bestia, mítico, poderoso",
	},
	{
		id: "engranaje_mecanica",
		path: "/escudos/engranaje, mecanica, tecnologia.png",
		keywords: "engranaje, mecánica, tecnología, máquina, industria, precisión",
	},
	{
		id: "escudo_dorado",
		path: "/escudos/escudo, proteccion, dorado, brillo.png",
		keywords: "escudo, protección, dorado, brillo, defensa, oro, seguridad",
	},
	{
		id: "estrella_fugaz",
		path: "/escudos/estrella, fugaz, amarillo, fuego.png",
		keywords: "estrella, fugaz, amarillo, fuego, deseo, velocidad, brillante",
	},
	{
		id: "fantasma",
		path: "/escudos/fantasma.png",
		keywords: "fantasma, espectro, espíritu, blanco, invisible, misterioso",
	},
	{
		id: "fenix_fuego",
		path: "/escudos/fenix, fuego, rojo.png",
		keywords: "fénix, fuego, rojo, renacimiento, inmortal, ave, resurrección",
	},
	{
		id: "flecha_verde",
		path: "/escudos/flexha, verde, velocidad.png",
		keywords: "flecha, verde, velocidad, rápido, dirección, precisión, apuntar",
	},
	{
		id: "gladiador_negro",
		path: "/escudos/gladiador, negro.png",
		keywords: "gladiador, negro, guerrero, romano, arena, combate, fuerza",
	},
	{
		id: "grifo",
		path: "/escudos/grifo, hipogrifo.png",
		keywords: "grifo, hipogrifo, mítico, águila, león, bestia, guardián",
	},
	{
		id: "halcon_metal",
		path: "/escudos/halcon, metal, libertad.png",
		keywords: "halcón, metal, libertad, ave, vuelo, velocidad, cazador",
		exclusions: "albiceleste",
	},
	{
		id: "hamburguesa",
		path: "/escudos/hamburguesa.png",
		keywords: "hamburguesa, comida, burger, restaurante, apetito, food",
	},
	{
		id: "insignia_militar",
		path: "/escudos/insignia, cobre, militar.png",
		keywords: "insignia, cobre, militar, medalla, honor, ejército, rango",
	},
	{
		id: "kraken",
		path: "/escudos/kraken, negro.png",
		keywords:
			"kraken, negro, pulpo, calamar, mar, monstruo, tentáculos, océano",
	},
	{
		id: "leon_amarillo",
		path: "/escudos/leon, amarillo.png",
		keywords: "león, amarillo, rey, felino, salvaje, melena, valentía, fuerza",
	},
	{
		id: "lobo",
		path: "/escudos/lobo.png",
		keywords: "lobo, manada, aullido, luna, cazador, salvaje, pack",
	},
	{
		id: "mano_blaugrana",
		path: "/escudos/mano, indicacion, blaugrana.png",
		keywords: "mano, indicación, blaugrana, azul, grana, señal, dirección",
	},
	{
		id: "martillo_negro",
		path: "/escudos/martillo, negro.png",
		keywords: "martillo, negro, herramienta, fuerza, golpe, construcción, Thor",
	},
	{
		id: "medialuna_magia",
		path: "/escudos/medialuna, magia, plata, noche.png",
		keywords: "media luna, magia, plata, noche, luna, místico, nocturno",
	},
	{
		id: "minotauro",
		path: "/escudos/minotauro.png",
		keywords: "minotauro, toro, bestia, laberinto, mítico, cuernos, fuerte",
	},
	{
		id: "motor_automovil",
		path: "/escudos/motor, automovil.png",
		keywords: "motor, automóvil, carro, velocidad, potencia, racing, mecánico",
	},
	{
		id: "ola_mar",
		path: "/escudos/ola, agua, mar, celeste.png",
		keywords: "ola, agua, mar, celeste, océano, surf, azul, playa",
	},
	{
		id: "oso_polar",
		path: "/escudos/oso polar, azul, furia, invierno, frio.png",
		keywords: "oso, polar, azul, furia, invierno, frío, nieve, ártico, hielo",
	},
	{
		id: "oso_grizzle",
		path: "/escudos/oso, grizzle.png",
		keywords: "oso, grizzly, pardo, fuerte, salvaje, bosque, garras",
	},
	{
		id: "pantera",
		path: "/escudos/pantera.png",
		keywords: "pantera, negra, felino, ágil, sigiloso, velocidad, elegante",
	},
	{
		id: "piedra_roca",
		path: "/escudos/piedra, roca, meteorito, fuerza, potencia.png",
		keywords: "piedra, roca, meteorito, fuerza, potencia, sólido, duro",
	},
	{
		id: "pirata_craneo",
		path: "/escudos/pirata, craneo.png",
		keywords: "pirata, cráneo, calavera, mar, bucanero, barco, tesoro",
	},
	{
		id: "portal_violeta",
		path: "/escudos/portal, violeta, morado, elipse, rosa, circular, espacio, galaxia.png",
		keywords:
			"portal, violeta, morado, elipse, rosa, circular, espacio, galaxia, dimensional",
	},
	{
		id: "rayo_celeste",
		path: "/escudos/rayo, celeste.png",
		keywords: "rayo, celeste, trueno, electricidad, velocidad, energía, poder",
	},
	{
		id: "samurai",
		path: "/escudos/samurai.png",
		keywords: "samurai, guerrero, japonés, katana, honor, bushido, disciplina",
	},
	{
		id: "serpiente_verde",
		path: "/escudos/serpiente, verde.png",
		keywords: "serpiente, verde, reptil, escamas, sinuosa, ágil, veneno",
	},
	{
		id: "sol_moneda",
		path: "/escudos/sol, moneda.png",
		keywords: "sol, moneda, oro, brillante, luz, calor, dorado, estrella",
	},
	{
		id: "estrella_plata",
		path: "/escudos/strella, plata.png",
		keywords: "estrella, plata, plateado, brillante, cinco puntas, cielo",
	},
	{
		id: "tiburon",
		path: "/escudos/tiburon.png",
		keywords: "tiburón, mar, depredador, océano, dientes, salvaje, peligroso",
	},
	{
		id: "tigre_naranja",
		path: "/escudos/tigre, rayado, naranja, determinacion.png",
		keywords:
			"tigre, rayado, naranja, determinación, felino, rayas, feroz, jungla",
	},
	{
		id: "titan",
		path: "/escudos/titan.png",
		keywords: "titán, gigante, poderoso, mítico, fuerza, colosal, enorme",
	},
	{
		id: "torre_antigua",
		path: "/escudos/torre, antigua, marfil.png",
		keywords: "torre, antigua, marfil, castillo, fortaleza, medieval, defensa",
	},
	{
		id: "tralalero_brainrot",
		path: "/escudos/tralalero, tralala, tiburon, zapatilla, brainrot.png",
		keywords:
			"tralalero, tralala, tiburón, zapatilla, brainrot, meme, divertido, absurdo, random",
	},
	{
		id: "triangulos_geometricos",
		path: "/escudos/triangulos, blanco negro dorado.png",
		keywords:
			"triángulos, blanco, negro, dorado, geométrico, moderno, abstracto",
	},
	{
		id: "trompeta_moroni",
		path: "/escudos/trompeta, moroni, instrumento, santos.png",
		keywords:
			"trompeta, moroni, instrumento, santos, ángel, música, sagrado, religioso",
	},
	{
		id: "u_catolica",
		path: "/escudos/u catolica, cruzados, UC.png",
		keywords: "u catolica, universidad católica, UC, cruzados, católica",
		negativeKeywords:
			"universidad de chile, la U, azul, romántico viajero, chuncho, ballet azul, u de chile",
		exclusions: "u de chile, la u, chuncho",
	},
	{
		id: "universidad_u",
		path: "/escudos/universidad, U.png",
		keywords:
			"universidad de chile, U, la U, azul, romántico viajero, chuncho, ballet azul, u de chile",
		negativeKeywords:
			"universidad católica, UC, cruzados, católica, u catolica",
		exclusions: "católica, UC, cruzados",
	},
	{
		id: "vikingo",
		path: "/escudos/vikingo.png",
		keywords: "vikingo, nórdico, guerrero, hacha, casco, cuernos, escandinavo",
	},
	{
		id: "volcan_explosion",
		path: "/escudos/volcan, explosion, calor, naturaleza.png",
		keywords: "volcán, explosión, calor, naturaleza, lava, fuego, erupción",
	},
	{
		id: "x_cruzadas",
		path: "/escudos/x, cruzadas, rojiblanco.png",
		keywords: "X, cruzadas, rojo, blanco, rojiblanco, cruz, marca, símbolo",
	},
];

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

	console.log("Generando vectores de logos por primera vez...");
	const embedder = await EmbeddingPipeline.getInstance();
	const newLogoVectors: LogoVector[] = [];

	for (const logo of logoDatabase) {
		const vector = await getEmbedding(logo.keywords, embedder);
		newLogoVectors.push({
			id: logo.id,
			path: logo.path,
			vector: vector,
		});
	}

	cachedLogoVectors = newLogoVectors;
	console.log("Vectores de logos cacheados.");
	return cachedLogoVectors;
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
		// Solo inicializa el pipeline y los vectores
		await getLogoVectors();
		await EmbeddingPipeline.getInstance();

		return NextResponse.json({
			message: "Modelos precargados exitosamente",
			totalLogos: logoDatabase.length,
		});
	} catch (error) {
		console.error("Error al precargar modelos:", error);
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
		const logoVectors = await getLogoVectors();

		// 2. Obtén la instancia del modelo
		const embedder = await EmbeddingPipeline.getInstance();

		// 3. Genera el vector para el nombre del equipo ingresado
		const inputVector = await getEmbedding(teamName, embedder);

		// 4. Compara el vector de entrada con todos los vectores de los logos
		let bestMatch = {
			id: "",
			path: "",
			score: -Infinity, // Empezamos con el peor puntaje posible
		};

		for (const logo of logoVectors) {
			// Buscar el logo original en logoDatabase para obtener exclusions y negativeKeywords
			const logoData = logoDatabase.find((l) => l.id === logo.id);

			// EXCLUSIONES: Si el nombre contiene alguna palabra de exclusión, salta este logo
			if (logoData?.exclusions) {
				const exclusionWords = logoData.exclusions
					.toLowerCase()
					.split(",")
					.map((w) => w.trim())
					.filter((w) => w.length > 0);

				const hasExclusion = exclusionWords.some((word) =>
					teamNameLower.includes(word)
				);

				if (hasExclusion) {
					continue; // Salta este logo completamente
				}
			}

			// Calcula la similitud base
			let score = cosineSimilarity(inputVector, logo.vector);

			// KEYWORDS NEGATIVAS: Reduce el score si el nombre contiene palabras negativas
			if (logoData?.negativeKeywords) {
				const negativeWords = logoData.negativeKeywords
					.toLowerCase()
					.split(",")
					.map((w) => w.trim())
					.filter((w) => w.length > 0);

				const matchedNegatives = negativeWords.filter((word) =>
					teamNameLower.includes(word)
				);

				// Aplica una penalización por cada keyword negativa encontrada
				// Reducción de 0.3 por cada coincidencia (ajustable)
				if (matchedNegatives.length > 0) {
					score = score - matchedNegatives.length * 0.3;
				}
			}

			if (score > bestMatch.score) {
				bestMatch = {
					id: logo.id,
					path: logo.path,
					score: score,
				};
			}
		}

		// 5. Devuelve el mejor resultado
		return NextResponse.json(bestMatch);
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
