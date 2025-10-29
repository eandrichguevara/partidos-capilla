import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
	try {
		const vectorsPath = path.join(
			process.cwd(),
			"src",
			"app",
			"api",
			"logoAssignment",
			"logo_vectors.json"
		);

		if (!fs.existsSync(vectorsPath)) {
			return NextResponse.json(
				{ message: "logo_vectors.json not found" },
				{ status: 404 }
			);
		}

		const raw = fs.readFileSync(vectorsPath, "utf-8");
		const parsed = JSON.parse(raw);
		return NextResponse.json(parsed);
	} catch (err) {
		console.error("Error reading logo_vectors.json:", err);
		return NextResponse.json(
			{ message: "Error leyendo logo_vectors.json", error: String(err) },
			{ status: 500 }
		);
	}
}
