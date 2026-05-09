import { NextResponse } from "next/server";
import { getCatalogHealth } from "../../../../lib/data";

export function GET() {
  return NextResponse.json({ health: getCatalogHealth() });
}
