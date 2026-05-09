import { NextResponse } from "next/server";
import { findDataset, getDatasetCatalog } from "../../../../lib/data";
import { apiError, createRequestId } from "../../../../lib/api";

export function GET(_request: Request, { params }: { params: { id: string } }) {
  const requestId = createRequestId();
  try {
    return NextResponse.json({ dataset: findDataset(getDatasetCatalog(), params.id) });
  } catch (error) {
    return apiError(error, { code: "dataset_not_found", status: 404, requestId });
  }
}
