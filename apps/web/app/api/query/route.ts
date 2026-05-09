import { NextResponse } from "next/server";
import { boundedQuerySpecSchema } from "@texas-data-canvas/shared";
import { getDatasetAdapter } from "../../../lib/data";
import { apiError, createRequestId, parseJsonRequest } from "../../../lib/api";

export async function POST(request: Request) {
  const requestId = createRequestId();
  try {
    const spec = await parseJsonRequest(request, boundedQuerySpecSchema);
    const execution = await getDatasetAdapter().queryDataset(spec);

    return NextResponse.json(execution);
  } catch (error) {
    return apiError(error, { code: "query_failed", requestId });
  }
}
