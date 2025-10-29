// API removed — this project now runs full-client.
// The original server-side logo assignment API was retired in favor of
// client-side embedding + matching. Keep this file to return a 410 so any
// accidental calls fail fast and provide guidance.
import { NextResponse } from "next/server";

export async function GET() {
	return NextResponse.json(
		{
			message:
				"logoAssignment API removed; use client-side matching with /logo_vectors.json",
		},
		{ status: 410 }
	);
}

export async function POST() {
	return NextResponse.json(
		{
			message:
				"logoAssignment API removed; use client-side matching with /logo_vectors.json",
		},
		{ status: 410 }
	);
}
