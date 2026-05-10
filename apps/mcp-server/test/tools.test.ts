import { describe, expect, it } from "vitest";
import { generateMiroExportSpec as generateSharedMiroExportSpec, UnsupportedDatasetError } from "@texas-data-canvas/shared";
import {
  auditQuery,
  generateCanvasSpec,
  generateMiroExportSpec,
  getDatasetMetadata,
  getSampleRows,
  getServerStatus,
  getSourceAttribution,
  listLiveSources,
  listSupportedSources,
  queryDataset,
  recommendVisualization,
  searchDatasets,
  summarizeQueryResult,
  validateCatalog,
  validateCanvasSpec
} from "../src/tools";
import { boundedQueryToolInputSchema } from "../src/index";

describe("MCP tool handlers", () => {
  it("lists supported sources and searches datasets", () => {
    expect(listSupportedSources().sources.length).toBeGreaterThan(0);
    expect(searchDatasets({ query: "Dallas 311" }).datasets[0].datasetId).toBe("dallas_311_requests");
    expect(getServerStatus().ok).toBe(true);
    expect(getServerStatus().version).toBe("1.1.0-product-depth");
    expect(getServerStatus().dataModeControls).toContain("live_if_available");
    expect(validateCatalog().health.status).toBe("ok");
    const liveSources = listLiveSources().liveSources;
    expect(liveSources.map((source) => source.datasetId)).toContain("dallas_311_requests");
    expect(liveSources.find((source) => source.datasetId === "dallas_311_requests")?.liveVerification?.promotionStatus).toBe("promoted");
  });

  it("returns metadata and bounded query results", async () => {
    const metadata = getDatasetMetadata({ datasetId: "dallas_311_requests" });
    expect(metadata.fields.map((field) => field.name)).toContain("category");
    expect(metadata.liveVerification?.sampleOnlyFields).toContain("zip_code");

    const result = await queryDataset({
      datasetId: "dallas_311_requests",
      mode: "sample_only",
      filters: [{ field: "created_date", operator: "between", value: ["2024-01-01", "2024-12-31"] }],
      groupBy: ["category"],
      metrics: [{ type: "count", alias: "request_count" }],
      orderBy: [{ field: "request_count", direction: "desc" }],
      limit: 10
    });

    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.source.datasetTitle).toContain("Dallas");

    const fallback = await queryDataset({
      datasetId: "austin_building_permits",
      mode: "live_if_available",
      groupBy: ["permit_type"],
      metrics: [{ type: "count", alias: "permit_count" }],
      limit: 10
    });
    expect(fallback.dataMode).toBe("fallback");
    expect(fallback.caveats.join(" ")).toContain("not live-enabled");
  });

  it("covers Houston sample-first metadata, queries, and hidden-field governance", async () => {
    const metadata = getDatasetMetadata({ datasetId: "houston_transportation_incidents" });
    expect(metadata.sourceName).toBe("Houston TranStar Traffic Data Feeds");
    expect(metadata.liveAvailable).toBe(false);
    expect(metadata.liveVerification?.promotionStatus).toBe("sample_first");
    expect(metadata.fields.find((field) => field.name === "precise_address")?.classification).toBe("sensitive_hide");

    const result = await queryDataset({
      datasetId: "houston_transportation_incidents",
      mode: "sample_only",
      filters: [{ field: "reported_date", operator: "between", value: ["2024-01-01", "2024-12-31"] }],
      groupBy: ["incident_type", "zip_code"],
      metrics: [{ type: "count", alias: "incident_count" }],
      orderBy: [{ field: "incident_count", direction: "desc" }],
      limit: 10
    });
    expect(result.dataMode).toBe("sample");
    expect(result.rows.length).toBeGreaterThan(0);
    expect(JSON.stringify(result)).not.toContain("precise_address");

    await expect(queryDataset({
      datasetId: "houston_transportation_incidents",
      mode: "sample_only",
      groupBy: ["precise_address"],
      metrics: [{ type: "count", alias: "incident_count" }],
      limit: 10
    })).rejects.toThrow(/not available for safe querying/);

    const attribution = getSourceAttribution({
      datasetId: "houston_transportation_incidents",
      mode: "sample_only",
      groupBy: ["incident_type"],
      metrics: [{ type: "count", alias: "incident_count" }],
      limit: 10
    });
    expect(attribution.caveats.join(" ")).toContain("sample-first");
  });

  it("generates canvas spec and query audit", async () => {
    const canvas = (await generateCanvasSpec({ datasetId: "austin_building_permits", mode: "live_if_available" })).canvas;
    expect(canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");
    expect(canvas.sources[0].dataMode).toBe("fallback");
    expect(canvas.createdAt).not.toBe("2026-05-09T00:00:00.000Z");

    const audit = await auditQuery({
      datasetId: "austin_building_permits",
      mode: "live_if_available",
      groupBy: ["month"],
      metrics: [{ type: "count", alias: "permit_count" }],
      orderBy: [{ field: "month", direction: "asc" }],
      limit: 12
    });
    expect(audit.safetyDecisions.join(" ")).toContain("Fields and operators");

    const houstonCanvas = (await generateCanvasSpec({ datasetId: "houston_transportation_incidents" })).canvas;
    expect(houstonCanvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");
    expect(houstonCanvas.sources[0].datasetId).toBe("houston_transportation_incidents");
    expect(houstonCanvas.sources[0].caveats.join(" ")).toContain("sample-first");
    expect(JSON.stringify(houstonCanvas)).not.toContain("precise_address");
  });

  it("covers sample, summary, visualization, attribution, validation, and Miro tools", async () => {
    const sample = await getSampleRows({ datasetId: "dallas_311_requests", limit: 5 });
    expect(sample.rows).toHaveLength(5);

    const result = await queryDataset({
      datasetId: "dallas_311_requests",
      mode: "sample_only",
      groupBy: ["month"],
      metrics: [{ type: "count", alias: "request_count" }],
      orderBy: [{ field: "month", direction: "asc" }],
      limit: 12
    });
    expect(summarizeQueryResult(result).summary).toContain("bounded rows");
    expect(recommendVisualization(result).recommendedBlocks).toContain("ChartBlock");
    expect(getSourceAttribution({
      datasetId: "dallas_311_requests",
      mode: "sample_only",
      groupBy: ["month"],
      metrics: [{ type: "count", alias: "request_count" }],
      orderBy: [{ field: "month", direction: "asc" }],
      limit: 12
    }).datasetId).toBe("dallas_311_requests");

    const canvas = (await generateCanvasSpec({ datasetId: "austin_building_permits" })).canvas;
    expect(validateCanvasSpec(canvas).ok).toBe(true);
    const miro = generateMiroExportSpec({ canvas, template: "briefing_board" });
    expect(miro.sourceMethodFrameRequired).toBe(true);
    expect(miro).toEqual(generateSharedMiroExportSpec({ canvas, template: "briefing_board" }));
  });

  it("returns structured handler data for validation failures", async () => {
    expect(() => getDatasetMetadata({ datasetId: "not_approved" })).toThrow(UnsupportedDatasetError);
    expect(() =>
      boundedQueryToolInputSchema.parse({
        datasetId: "dallas_311_requests",
        groupBy: ["category"],
        filters: [{ field: "category", operator: "regex", value: "bad" }],
        metrics: [{ type: "count", alias: "request_count" }],
        limit: 10
      })
    ).toThrow();

    await expect(queryDataset({
      datasetId: "dallas_311_requests",
      mode: "sample_only",
      groupBy: ["not_a_field"],
      metrics: [{ type: "count", alias: "request_count" }],
      limit: 10
    })).rejects.toThrow(/not allowlisted/);
    expect(validateCanvasSpec({ blocks: [{ type: "UnknownBlock" }] }).ok).toBe(false);
  });
});
