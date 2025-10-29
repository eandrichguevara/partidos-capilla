const BASE_COLOR_PALETTE = [
	"#1f78b4",
	"#33a02c",
	"#e31a1c",
	"#ff7f00",
	"#6a3d9a",
	"#b15928",
];

const hexToRgb = (hex: string) => {
	const normalized = hex.replace("#", "");
	const bigint = parseInt(normalized, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;
	return { r, g, b };
};

const rgbToHsl = (r: number, g: number, b: number) => {
	r /= 255;
	g /= 255;
	b /= 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;
	const d = max - min;
	if (d !== 0) {
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
		}
		h /= 6;
	}
	return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h: number, s: number, l: number) => {
	const _s = s / 100;
	const _l = l / 100;
	const c = (1 - Math.abs(2 * _l - 1)) * _s;
	const _h = h / 60;
	const x = c * (1 - Math.abs((_h % 2) - 1));
	const m = _l - c / 2;
	const rgb: [number, number, number] = [0, 0, 0];
	if (_h >= 0 && _h < 1) {
		rgb[0] = c;
		rgb[1] = x;
	} else if (_h >= 1 && _h < 2) {
		rgb[0] = x;
		rgb[1] = c;
	} else if (_h >= 2 && _h < 3) {
		rgb[1] = c;
		rgb[2] = x;
	} else if (_h >= 3 && _h < 4) {
		rgb[1] = x;
		rgb[2] = c;
	} else if (_h >= 4 && _h < 5) {
		rgb[0] = x;
		rgb[2] = c;
	} else {
		rgb[0] = c;
		rgb[2] = x;
	}
	const [r, g, b] = rgb.map((channel) => {
		const value = Math.round((channel + m) * 255);
		return value;
	});
	const toHex = (value: number) => {
		const hex = value.toString(16);
		return hex.length === 1 ? `0${hex}` : hex;
	};
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Extrae el color dominante de una imagen
 * @param imagePath Ruta de la imagen
 * @returns Promise con el color en formato hex
 */
export const extractDominantColor = async (
	imagePath: string
): Promise<string> => {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "Anonymous";

		img.onload = () => {
			try {
				const canvas = document.createElement("canvas");
				const ctx = canvas.getContext("2d");

				if (!ctx) {
					reject(new Error("No se pudo obtener el contexto del canvas"));
					return;
				}

				// Reducir el tamaño para mejorar el rendimiento
				const size = 100;
				canvas.width = size;
				canvas.height = size;

				ctx.drawImage(img, 0, 0, size, size);
				const imageData = ctx.getImageData(0, 0, size, size);
				const data = imageData.data;

				// Contar frecuencias de colores (agrupados)
				const colorCounts: Record<
					string,
					{ count: number; r: number; g: number; b: number }
				> = {};
				let totalValidPixels = 0;

				for (let i = 0; i < data.length; i += 4) {
					const r = data[i];
					const g = data[i + 1];
					const b = data[i + 2];
					const a = data[i + 3];

					// Ignorar píxeles transparentes
					if (a < 128) {
						continue;
					}

					// Ignorar píxeles muy claros (probablemente fondo blanco)
					if (r > 240 && g > 240 && b > 240) {
						continue;
					}

					// Ignorar píxeles muy oscuros (probablemente contornos)
					if (r < 20 && g < 20 && b < 20) {
						continue;
					}

					totalValidPixels++;

					// Agrupar colores similares (redondear a bloques de 20)
					const rKey = Math.floor(r / 20) * 20;
					const gKey = Math.floor(g / 20) * 20;
					const bKey = Math.floor(b / 20) * 20;
					const key = `${rKey},${gKey},${bKey}`;

					if (!colorCounts[key]) {
						colorCounts[key] = { count: 0, r: 0, g: 0, b: 0 };
					}

					// Acumular valores para promediar
					colorCounts[key].count++;
					colorCounts[key].r += r;
					colorCounts[key].g += g;
					colorCounts[key].b += b;
				}

				if (totalValidPixels === 0) {
					// Si no hay píxeles válidos, usar un color por defecto
					resolve("#1f78b4");
					return;
				}

				// Encontrar el color más frecuente
				let maxCount = 0;
				let dominantColor = { r: 0, g: 0, b: 0 };

				for (const key in colorCounts) {
					const colorData = colorCounts[key];
					if (colorData.count > maxCount) {
						maxCount = colorData.count;
						// Calcular el promedio de los valores acumulados
						dominantColor = {
							r: Math.round(colorData.r / colorData.count),
							g: Math.round(colorData.g / colorData.count),
							b: Math.round(colorData.b / colorData.count),
						};
					}
				}

				// Convertir a hex y saturar un poco para mejor visualización
				const { h, s, l } = rgbToHsl(
					dominantColor.r,
					dominantColor.g,
					dominantColor.b
				);

				// Ajustar saturación y luminosidad para mejorar la visualización
				// Asegurar que el color sea vibrante y visible
				const adjustedS = Math.min(75, Math.max(s, 45)); // Entre 45% y 75% de saturación
				const adjustedL = Math.min(55, Math.max(l, 35)); // Entre 35% y 55% de luminosidad

				const hexColor = hslToHex(h, adjustedS, adjustedL);
				resolve(hexColor);
			} catch (error) {
				reject(error);
			}
		};

		img.onerror = () => {
			reject(new Error(`No se pudo cargar la imagen: ${imagePath}`));
		};

		img.src = imagePath;
	});
};

/**
 * Selecciona un color que contraste con los colores existentes
 * Primero intenta usar colores de la paleta base, luego genera dinámicamente
 */
export const pickContrastingColor = (existingColors: string[]): string => {
	const normalizedExisting = existingColors.map((color) => color.toLowerCase());
	const availableFromPalette = BASE_COLOR_PALETTE.filter(
		(color) => !normalizedExisting.includes(color)
	);

	if (availableFromPalette.length > 0) {
		return availableFromPalette[
			Math.floor(Math.random() * availableFromPalette.length)
		];
	}

	const existingHues = normalizedExisting.map((color) => {
		const { r, g, b } = hexToRgb(color);
		return rgbToHsl(r, g, b).h;
	});

	let hue = Math.random() * 360;
	for (let attempt = 0; attempt < 20; attempt += 1) {
		const isContrasting = existingHues.every((existingHue) => {
			const diff = Math.abs(existingHue - hue);
			const wrappedDiff = Math.min(diff, 360 - diff);
			return wrappedDiff > 30;
		});
		if (isContrasting) {
			return hslToHex(hue, 70, 55);
		}
		hue = (hue + 137.508) % 360;
	}

	return hslToHex(hue, 70, 55);
};
