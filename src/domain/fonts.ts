// Lista curada de fuentes de Google Fonts apropiadas para nombres de equipos deportivos
// Estas fuentes tienen carácter fuerte, legibilidad y personalidad

export const TEAM_FONTS = [
	{
		id: "bebas-neue",
		name: "Bebas Neue",
		fontFamily: "'Bebas Neue', sans-serif",
		weight: "400",
		// Fuente condensada muy popular en diseño deportivo
	},
	{
		id: "teko",
		name: "Teko",
		fontFamily: "'Teko', sans-serif",
		weight: "600",
		// Fuente condensada moderna con gran impacto
	},
	{
		id: "oswald",
		name: "Oswald",
		fontFamily: "'Oswald', sans-serif",
		weight: "600",
		// Clásica fuente deportiva, muy legible
	},
	{
		id: "anton",
		name: "Anton",
		fontFamily: "'Anton', sans-serif",
		weight: "400",
		// Fuerte y contundente, perfecta para títulos deportivos
	},
	{
		id: "saira-condensed",
		name: "Saira Condensed",
		fontFamily: "'Saira Condensed', sans-serif",
		weight: "700",
		// Condensada moderna con excelente legibilidad
	},
	{
		id: "rajdhani",
		name: "Rajdhani",
		fontFamily: "'Rajdhani', sans-serif",
		weight: "700",
		// Futurista y atlética
	},
	{
		id: "russo-one",
		name: "Russo One",
		fontFamily: "'Russo One', sans-serif",
		weight: "400",
		// Fuerte y geométrica, muy deportiva
	},
	{
		id: "archivo-black",
		name: "Archivo Black",
		fontFamily: "'Archivo Black', sans-serif",
		weight: "400",
		// Negrita ultra fuerte
	},
	{
		id: "staatliches",
		name: "Staatliches",
		fontFamily: "'Staatliches', sans-serif",
		weight: "400",
		// Condensada atlética con gran presencia
	},
	{
		id: "exo-2",
		name: "Exo 2",
		fontFamily: "'Exo 2', sans-serif",
		weight: "800",
		// Tecnológica y moderna
	},
	{
		id: "barlow-condensed",
		name: "Barlow Condensed",
		fontFamily: "'Barlow Condensed', sans-serif",
		weight: "700",
		// Versátil y moderna, excelente para deportes
	},
	{
		id: "kanit",
		name: "Kanit",
		fontFamily: "'Kanit', sans-serif",
		weight: "700",
		// Dinámica y con personalidad
	},
] as const;

export type TeamFont = (typeof TEAM_FONTS)[number];

/**
 * Selecciona una fuente aleatoria de la lista
 */
export function getRandomFont(): TeamFont {
	const randomIndex = Math.floor(Math.random() * TEAM_FONTS.length);
	return TEAM_FONTS[randomIndex];
}

/**
 * Genera el string de importación para Google Fonts con todas las fuentes necesarias
 */
export function getGoogleFontsUrl(): string {
	const fonts = TEAM_FONTS.map((font) => {
		// Reemplaza espacios con + para la URL
		const fontName = font.name.replace(/ /g, "+");
		return `${fontName}:wght@${font.weight}`;
	}).join("&family=");

	return `https://fonts.googleapis.com/css2?family=${fonts}&display=swap`;
}

/**
 * Busca una fuente por su ID
 */
export function getFontById(id: string): TeamFont | undefined {
	return TEAM_FONTS.find((font) => font.id === id);
}
