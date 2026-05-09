import { NextResponse } from "next/server";
import { findDataset, getDatasetCatalog } from "../../../../lib/data";

export function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    return NextResponse.json({ dataset: findDataset(getDatasetCatalog(), params.id) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Dataset not found." },
      { status: 404 }
    );
  }
}
