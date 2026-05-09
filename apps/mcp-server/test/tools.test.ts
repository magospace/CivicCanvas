import { describe, expect, it } from "vitest";
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

describe("MCP tool handlers", () => {
  it("lists supported sources and searches datasets", () => {
    expect(listSupportedSources().sources.length).toBeGreaterThan(0);
    expect(searchDatasets({ query: "Dallas 311" }).datasets[0].datasetId).toBe("dallas_311_requests");
    expect(getServerStatus().ok).toBe(true);
    expect(validateCatalog().health.status).toBe("ok");
    expect(listLiveSources().liveSources.map((source) => source.datasetId)).toContain("dallas_311_requests");
  });

  it("returns metadata and bounded query results", async () => {
    const metadata = getDatasetMetadata({ datasetId: "dallas_311_requests" });
    expect(metadata.fields.map((field) => field.name)).toContain("category");

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
  });

  it("generates canvas spec and query audit", async () => {
    const canvas = (await generateCanvasSpec({ datasetId: "austin_building_permits" })).canvas;
    expect(canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");

    const audit = await auditQuery({
      datasetId: "austin_building_permits",
      groupBy: ["month"],
      metrics: [{ type: "count", alias: "permit_count" }],
      orderBy: [{ field: "month", direction: "asc" }],
      limit: 12
    });
    expect(audit.safetyDecisions.join(" ")).toContain("Fields and operators");
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
  });

  it("returns structured handler data for validation failures", async () => {
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
