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
