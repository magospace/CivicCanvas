import { NextResponse } from "next/server";
import { getDatasetCatalog } from "../../../lib/data";

export function GET() {
  return NextResponse.json({ datasets: getDatasetCatalog() });
}
