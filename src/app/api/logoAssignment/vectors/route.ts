// Vectors API removed — serve /logo_vectors.json from public for full-client usage.
import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json(
		{ message: "logoAssignment vectors API removed; use /logo_vectors.json in public" },
		{ status: 410 }
	);
}
