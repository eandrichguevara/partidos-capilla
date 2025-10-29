import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

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
	viewport: {
		width: "device-width",
		initialScale: 1,
		maximumScale: 5,
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
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
				{/* Script para cargar las fuentes dinámicamente */}
				<Script id="load-team-fonts" strategy="beforeInteractive">
					{`
						(function() {
							const link = document.createElement('link');
							link.rel = 'stylesheet';
							link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue:wght@400&family=Teko:wght@600&family=Oswald:wght@600&family=Anton:wght@400&family=Saira+Condensed:wght@700&family=Rajdhani:wght@700&family=Russo+One:wght@400&family=Archivo+Black:wght@400&family=Staatliches:wght@400&family=Exo+2:wght@800&family=Barlow+Condensed:wght@700&family=Kanit:wght@700&display=swap';
							document.head.appendChild(link);
						})();
					`}
				</Script>
			</body>
		</html>
	);
}
