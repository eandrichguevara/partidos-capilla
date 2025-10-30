import type { NextConfig } from "next";

// Prevent Next.js from trying to evaluate @xenova/transformers on the server
// (this package expects a browser/WASM runtime and can crash the dev server
// if pre-evaluated). We mark it external for server builds so it's only
// loaded dynamically from client code at runtime.
const nextConfig: NextConfig = {
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
			} else if (!config.externals) {
				config.externals = ["@xenova/transformers"];
			} else {
				// If externals is a function (rare), we skip modifying it — the
				// dynamic import and our client-only usage should be enough.
			}
		}

		return config;
	},
};

export default nextConfig;
