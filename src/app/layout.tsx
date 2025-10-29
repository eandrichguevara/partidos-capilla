import type { Metadata } from "next";
import {
	Geist,
	Geist_Mono,
	Bebas_Neue,
	Teko,
	Oswald,
	Anton,
	Saira_Condensed,
	Rajdhani,
	Russo_One,
	Archivo_Black,
	Staatliches,
	Exo_2,
	Barlow_Condensed,
	Kanit,
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

// Team fonts loaded via next/font/google so they are served same-origin
// (prevents cross-origin cssRules access errors when inlining fonts for SVG/PNG)
const bebas = Bebas_Neue({
	weight: "400",
	subsets: ["latin"],
	display: "swap",
});
const teko = Teko({ weight: "600", subsets: ["latin"], display: "swap" });
const oswald = Oswald({ weight: "600", subsets: ["latin"], display: "swap" });
const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap" });
const saira = Saira_Condensed({
	weight: "700",
	subsets: ["latin"],
	display: "swap",
});
const rajdhani = Rajdhani({
	weight: "700",
	subsets: ["latin"],
	display: "swap",
});
const russo = Russo_One({ weight: "400", subsets: ["latin"], display: "swap" });
const archivoBlack = Archivo_Black({
	weight: "400",
	subsets: ["latin"],
	display: "swap",
});
const staatliches = Staatliches({
	weight: "400",
	subsets: ["latin"],
	display: "swap",
});
const exo2 = Exo_2({ weight: "800", subsets: ["latin"], display: "swap" });
const barlowCondensed = Barlow_Condensed({
	weight: "700",
	subsets: ["latin"],
	display: "swap",
});
const kanit = Kanit({ weight: "700", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
	title: "Gol y te Quedas - Sistema de Gestión de Partidos",
	description:
		"Aplicación web para gestionar partidos de fútbol estilo 'gol y te quedas' (winner stays). Gestiona equipos, cola de espera, tabla de posiciones y más.",
	keywords: [
		"fútbol",
		"partidos",
		"gol y te quedas",
		"winner stays",
		"gestión de equipos",
		"tabla de posiciones",
		"deportes",
	],
	authors: [{ name: "Emilio Andrich Guevara" }],
	creator: "Emilio Andrich Guevara",
	publisher: "Emilio Andrich Guevara",
	applicationName: "Gol y te Quedas",
	generator: "Next.js",
	category: "Sports",
	openGraph: {
		title: "Gol y te Quedas - Sistema de Gestión de Partidos",
		description:
			"Aplicación web para gestionar partidos de fútbol estilo 'gol y te quedas'. Controla equipos, cola, puntuaciones y más.",
		type: "website",
		locale: "es_ES",
		siteName: "Gol y te Quedas",
	},
	twitter: {
		card: "summary_large_image",
		title: "Gol y te Quedas - Sistema de Gestión de Partidos",
		description:
			"Gestiona tus partidos de fútbol estilo 'winner stays' con tabla de posiciones y más.",
	},
	robots: {
		index: true,
		follow: true,
	},
	icons: {
		icon: [
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/favicon.ico", sizes: "any" },
		],
		shortcut: "/favicon.svg",
		apple: "/apple-touch-icon.png",
	},
	manifest: "/manifest.json",
};

export const viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 5,
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="es">
			<head>
				{/* Cargar todas las fuentes de equipo desde Google Fonts */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
			</head>
			<body
				className={`
					${geistSans.variable} ${geistMono.variable} 
					${bebas.className} ${teko.className} ${oswald.className} ${anton.className} ${saira.className} ${rajdhani.className} ${russo.className} ${archivoBlack.className} ${staatliches.className} ${exo2.className} ${barlowCondensed.className} ${kanit.className} 
					antialiased
				`}
			>
				{children}
			</body>
		</html>
	);
}
