// Client-side embeddings helper using @xenova/transformers in the browser.
// This file will be bundled only for client code (use from a React client component).

let clientPipeline: unknown = null;

export async function getClientPipeline(): Promise<unknown> {
	if (clientPipeline) return clientPipeline;

	// Dynamic import so it only loads in the browser
	const mod = await import("@xenova/transformers");

	// Create the pipeline. In the browser @xenova/transformers will use a WASM/web backend
	// automatically; we pass the same model id used on server.
	// Keep the pipeline reference opaque (unknown) to avoid strict any usage.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const pipe = await (mod as any).pipeline(
		"feature-extraction",
		"Xenova/all-MiniLM-L6-v2",
		{
			quantized: true,
		}
	);

	clientPipeline = pipe;
	return clientPipeline;
}

export async function getClientEmbedding(text: string): Promise<number[]> {
	const pipe = await getClientPipeline();
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const out = await (pipe as any)(text, { pooling: "mean", normalize: true });

	// `out.data` is expected to be a TypedArray (Float32Array)
	return Array.from(out.data as Iterable<number>);
}
