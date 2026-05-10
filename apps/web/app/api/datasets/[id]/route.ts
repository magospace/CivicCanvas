import { NextResponse } from "next/server";
import { findDataset, getDatasetCatalog } from "../../../../lib/data";
import { apiError, createRequestId } from "../../../../lib/api";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const requestId = createRequestId();
  const { id } = await params;
  try {
    return NextResponse.json({ dataset: findDataset(getDatasetCatalog(), id) });
  } catch (error) {
    return apiError(error, { code: "dataset_not_found", status: 404, requestId });
  }
}
