import { describe, expect, it } from "vitest";
import {
  auditQuery,
  generateCanvasSpec,
  getDatasetMetadata,
  listSupportedSources,
  queryDataset,
  searchDatasets
} from "../src/tools";

describe("MCP tool handlers", () => {
  it("lists supported sources and searches datasets", () => {
    expect(listSupportedSources().sources.length).toBeGreaterThan(0);
    expect(searchDatasets({ query: "Dallas 311" }).datasets[0].datasetId).toBe("dallas_311_requests");
  });

  it("returns metadata and bounded query results", () => {
    const metadata = getDatasetMetadata({ datasetId: "dallas_311_requests" });
    expect(metadata.fields.map((field) => field.name)).toContain("category");

    const result = queryDataset({
      datasetId: "dallas_311_requests",
      filters: [{ field: "created_date", operator: "between", value: ["2024-01-01", "2024-12-31"] }],
      groupBy: ["category"],
      metrics: [{ type: "count", alias: "request_count" }],
      orderBy: [{ field: "request_count", direction: "desc" }],
      limit: 10
    });

    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.source.datasetTitle).toContain("Dallas");
  });

  it("generates canvas spec and query audit", () => {
    const canvas = generateCanvasSpec({ datasetId: "austin_building_permits" }).canvas;
    expect(canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");

    const audit = auditQuery({
      datasetId: "austin_building_permits",
      groupBy: ["month"],
      metrics: [{ type: "count", alias: "permit_count" }],
      orderBy: [{ field: "month", direction: "asc" }],
      limit: 12
    });
    expect(audit.safetyDecisions.join(" ")).toContain("Fields and operators");
  });
});
