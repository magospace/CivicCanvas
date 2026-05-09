import { NextResponse } from "next/server";
import { boundedQuerySpecSchema } from "@texas-data-canvas/shared";
import { getDatasetAdapter } from "../../../lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const spec = boundedQuerySpecSchema.parse(body);
    const execution = await getDatasetAdapter().queryDataset(spec);

    return NextResponse.json(execution);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Query failed." },
      { status: 400 }
    );
  }
}
