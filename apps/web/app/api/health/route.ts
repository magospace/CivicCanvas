import { NextResponse } from "next/server";
import { getCatalogHealth } from "../../../lib/data";

export function GET() {
  const catalog = getCatalogHealth();

  return NextResponse.json({
    ok: catalog.status !== "failed",
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? "v0.4.0-production-pilot-dev",
    runtime: "nextjs",
    checkedAt: catalog.checkedAt,
    catalogCount: catalog.datasetCount,
    liveEnabledDatasets: catalog.liveEnabledDatasets,
    sampleFallbacksAvailable: catalog.sampleFallbacks.every((sample) => sample.available),
    catalogStatus: catalog.status
  });
}
