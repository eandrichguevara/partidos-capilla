import type { NextConfig } from "next";

// Prevent Next.js from trying to evaluate @xenova/transformers on the server
// (this package expects a browser/WASM runtime and can crash the dev server
// if pre-evaluated). We mark it external for server builds so it's only
// loaded dynamically from client code at runtime.
const nextConfig: NextConfig = {
	// Configure server-side component externals for both webpack and Turbopack
	serverExternalPackages: ["@xenova/transformers", "onnxruntime-node"],

	// Experimental: exclude from static analysis
	experimental: {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		optimizePackageImports: [] as any,
		serverComponentsExternalPackages: [
			"@xenova/transformers",
			"onnxruntime-node",
			"sharp",
		],
	},

	// Required headers for @xenova/transformers (WASM and SharedArrayBuffer support)
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "Cross-Origin-Embedder-Policy",
						value: "credentialless",
					},
					{
						key: "Cross-Origin-Opener-Policy",
						value: "same-origin",
					},
				],
			},
		];
	},

	// When running under newer Next versions Turbopack may be enabled by
	// default. Adding an explicit empty `turbopack` config silences the
	// warning about having a webpack config while Turbopack is active.
	// If you prefer to run with webpack instead, start Next with `--webpack`.
	turbopack: {},

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	webpack: (config: any, { isServer }: { isServer: boolean }) => {
		if (isServer) {
			// Ensure config.externals is an array we can push into. In some Next
			// versions it may be a function; guard accordingly.
			if (Array.isArray(config.externals)) {
				config.externals.push("@xenova/transformers");
				config.externals.push("onnxruntime-node");
			} else if (!config.externals) {
				config.externals = ["@xenova/transformers", "onnxruntime-node"];
			} else {
				// If externals is a function (rare), we skip modifying it — the
				// dynamic import and our client-only usage should be enough.
			}
		}

		// Needed for @xenova/transformers WASM support
		config.experiments = {
			...config.experiments,
			asyncWebAssembly: true,
			layers: true,
		};

		// Ignore node-specific modules in client bundle
		if (!isServer) {
			config.resolve = config.resolve || {};
			config.resolve.fallback = {
				...config.resolve.fallback,
				fs: false,
				path: false,
				crypto: false,
			};
		}

		return config;
	},
};

export default nextConfig;
