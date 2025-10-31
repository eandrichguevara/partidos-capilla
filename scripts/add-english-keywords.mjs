import fs from "fs";
import path from "path";

const infile = path.resolve(process.cwd(), "public", "logo_database.json");
const data = JSON.parse(fs.readFileSync(infile, "utf8"));

// Simple bilingual dictionary (spanish -> english)
const dict = {
	franja: "stripe",
	azul: "blue",
	"azul cielo": "sky blue",
	direccion: "direction",
	dirección: "direction",
	flecha: "arrow",
	señal: "signal",
	movimiento: "movement",
	banda: "band",
	celeste: "light blue",
	orientación: "orientation",
	camino: "road",
	bota: "boot",
	oro: "gold",
	zapatilla: "sneaker",
	zapato: "shoe",
	goleador: "top scorer",
	pichichi: "top scorer",
	premio: "award",
	fútbol: "football",
	futbol: "football",
	sol: "sun",
	puesta: "sunset",
	horizonte: "horizon",
	albiceleste: "albiceleste",
	amanecer: "sunrise",
	atardecer: "sunset",
	cielo: "sky",
	luz: "light",
	argentina: "argentina",
	dia: "day",
	día: "day",
	nuevo: "new",
	comienzo: "beginning",
	atlético: "athletic",
	atletico: "athletic",
	letra: "letter",
	deporte: "sport",
	agua: "water",
	ancla: "anchor",
	oxidado: "rusty",
	mar: "sea",
	marino: "marine",
	náutico: "nautical",
	barco: "boat",
	navío: "ship",
	vintage: "vintage",
	águila: "eagle",
	aguila: "eagle",
	real: "royal",
	ave: "bird",
	pájaro: "bird",
	pajaro: "bird",
	majestuoso: "majestic",
	vuelo: "flight",
	libertad: "freedom",
	ala: "wing",
	ángel: "angel",
	angel: "angel",
	pureza: "purity",
	santidad: "holiness",
	divino: "divine",
	celestial: "celestial",
	blanco: "white",
	sagrado: "sacred",
	anillo: "ring",
	santos: "saints",
	círculo: "circle",
	circulo: "circle",
	reliquia: "relic",
	poder: "power",
	anillos: "rings",
	enredado: "entangled",
	verde: "green",
	amarillo: "yellow",
	enlazado: "linked",
	unión: "union",
	conexion: "connection",
	conexión: "connection",
	árbol: "tree",
	arbol: "tree",
	naturaleza: "nature",
	fuerza: "strength",
	raíces: "roots",
	crecimiento: "growth",
	aurora: "aurora",
	boreal: "boreal",
	planta: "plant",
	buho: "owl",
	búho: "owl",
	lechuza: "owl",
	sabiduría: "wisdom",
	sabiduria: "wisdom",
	noche: "night",
	nocturno: "nocturnal",
	inteligente: "intelligent",
	caballero: "knight",
	templario: "templar",
	metal: "metal",
	cruz: "cross",
	rojo: "red",
	honor: "honor",
	guerrero: "warrior",
	medieval: "medieval",
	caballo: "horse",
	mágico: "magical",
	magico: "magical",
	unicornio: "unicorn",
	místico: "mystic",
	místico: "mystic",
	fantasía: "fantasy",
	fantasia: "fantasy",
	casco: "helmet",
	robot: "robot",
	plata: "silver",
	tecnología: "technology",
	tecnologia: "technology",
	futurista: "futuristic",
	máquina: "machine",
	maquina: "machine",
	chargers: "chargers",
	rayo: "lightning",
	energía: "energy",
	energia: "energy",
	electricidad: "electricity",
	poder: "power",
	velocidad: "speed",
	trueno: "thunder",
	cobra: "cobra",
	serpiente: "snake",
	venenosa: "venomous",
	reptil: "reptile",
	peligroso: "dangerous",
	colo: "colo",
	cacique: "chief",
	lautaro: "lautaro",
	mapuche: "mapuche",
	araucano: "araucan",
	chile: "chile",
	guerrero: "warrior",
	cometa: "comet",
	espacio: "space",
	estrella: "star",
	cosmos: "cosmos",
	la: "the",
	roja: "red",
	seleccion: "national team",
	selección: "national team",
	nacional: "national",
	vuelo: "flight",
	corazon: "heart",
	espada: "sword",
	desamor: "heartbreak",
	atravesado: "pierced",
	roto: "broken",
	pasión: "passion",
	corona: "crown",
	dorada: "golden",
	dorado: "golden",
	rey: "king",
	realeza: "royalty",
	cráneo: "skull",
	craneo: "skull",
	negro: "black",
	muerte: "death",
	temible: "fearsome",
	pirata: "pirate",
	diablo: "devil",
	demonio: "demon",
	furia: "fury",
	fuego: "fire",
	diamante: "diamond",
	joya: "jewel",
	lujo: "luxury",
	valioso: "valuable",
	edificio: "building",
	futuro: "future",
	dragón: "dragon",
	dragon: "dragon",
	engranaje: "gear",
	mecanica: "mechanics",
	mecanica: "mechanics",
	tecnologia: "technology",
	escudo: "shield",
	proteccion: "protection",
	brillo: "shine",
	estrella: "star",
	fugaz: "shooting",
	amarillo: "yellow",
	deseo: "wish",
	brillante: "bright",
	fantasma: "ghost",
	espectro: "specter",
	invisible: "invisible",
	misterioso: "mysterious",
	fenix: "phoenix",
	fénix: "phoenix",
	veloz: "fast",
	velocidad: "speed",
	flecha: "arrow",
	apuntar: "aim",
	gladiador: "gladiator",
	grifo: "griffin",
	halcón: "falcon",
	halcon: "falcon",
	libertad: "freedom",
	hambre: "hunger",
	hamburguesa: "hamburger",
	insignia: "insignia",
	militar: "military",
	kraken: "kraken",
	tiburon: "shark",
	tiburón: "shark",
	titán: "titan",
	titan: "titan",
	volcan: "volcano",
	volcán: "volcano",
	moc: "moc",
};

function normalizeToken(t) {
	return t
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.trim();
}

function translateToken(tok) {
	const n = normalizeToken(tok);
	if (dict[n]) return dict[n];
	// try split words
	const parts = n.split(/\s+/).map((p) => (dict[p] ? dict[p] : p));
	return parts.join(" ");
}

for (const entry of data) {
	if (entry.keywords) {
		const toks = entry.keywords
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		const translations = toks.map((t) => translateToken(t)).filter(Boolean);
		// merge avoiding duplicates (case-insensitive)
		const merged = [...toks];
		for (const tr of translations) {
			if (!merged.some((m) => normalizeToken(m) === normalizeToken(tr)))
				merged.push(tr);
		}
		entry.keywords = merged.join(", ");
	}

	if (entry.negativeKeywords) {
		const toks = entry.negativeKeywords
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean);
		const translations = toks.map((t) => translateToken(t)).filter(Boolean);
		const merged = [...toks];
		for (const tr of translations) {
			if (!merged.some((m) => normalizeToken(m) === normalizeToken(tr)))
				merged.push(tr);
		}
		entry.negativeKeywords = merged.join(", ");
	}
}

fs.writeFileSync(infile, JSON.stringify(data, null, 4) + "\n", "utf8");
console.log("Updated", infile);
