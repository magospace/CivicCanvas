import { NextResponse } from "next/server";
import { boundedQuerySpecSchema, executeBoundedQuery } from "@texas-data-canvas/shared";
import { getDatasetCatalog, getSampleRows } from "../../../lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const spec = boundedQuerySpecSchema.parse(body);
    const execution = executeBoundedQuery({
      catalog: getDatasetCatalog(),
      rows: getSampleRows(spec.datasetId),
      spec,
      accessedAt: "2026-05-09T00:00:00.000Z"
    });

    return NextResponse.json(execution);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Query failed." },
      { status: 400 }
    );
  }
}
