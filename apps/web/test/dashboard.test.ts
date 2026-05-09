import { describe, expect, it } from "vitest";
import { z } from "zod";
import { GET as catalogHealthGET } from "../app/api/catalog/health/route";
import { POST as canvasGeneratePOST } from "../app/api/canvas/generate/route";
import { POST as miroExportPOST } from "../app/api/export/miro-spec/route";
import { GET as healthGET } from "../app/api/health/route";
import { POST as queryPOST } from "../app/api/query/route";
import { parseJsonRequest } from "../lib/api";
import { generateCanvasForPrompt } from "../lib/dashboard";
import { generateMiroExportSpec } from "../lib/miro";

describe("dashboard generation", () => {
  it("generates the Dallas demo dashboard", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");

    expect(generation.canvas.title).toContain("Dallas 311");
    expect(generation.dataMode).toBe("fallback");
    expect(generation.audits.length).toBeGreaterThan(0);
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("ChartBlock");
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("TableBlock");
  });

  it("generates the Austin demo dashboard", async () => {
    const generation = await generateCanvasForPrompt("Show Austin building permits by month and ZIP code.");

    expect(generation.canvas.title).toContain("Austin Building Permits");
    expect(generation.audits.length).toBeGreaterThan(0);
    expect(generation.canvas.sources[0].datasetId).toBe("austin_building_permits");
  });

  it("returns dataset suggestions for unsupported prompts", async () => {
    const generation = await generateCanvasForPrompt("Compare tax abatements across El Paso.");

    expect(generation.suggestedDatasets?.length).toBeGreaterThan(0);
    expect(generation.audits).toEqual([]);
    expect(generation.canvas.title).toContain("Choose");
  });

  it("respects explicit dashboard data-mode preferences", async () => {
    const dallasSample = await generateCanvasForPrompt(
      "Show Dallas 311 service requests by category for 2024.",
      {},
      "sample"
    );
    expect(dallasSample.requestedDataMode).toBe("sample");
    expect(dallasSample.dataMode).toBe("sample");
    expect(dallasSample.fallbackReason).toContain("sample fallback");

    const austinLive = await generateCanvasForPrompt(
      "Show Austin building permits by month and ZIP code.",
      {},
      "live"
    );
    expect(austinLive.requestedDataMode).toBe("live");
    expect(austinLive.dataMode).toBe("fallback");
    expect(austinLive.fallbackReason).toContain("not live-enabled");
    expect(austinLive.canvas.sources[0].caveats.join(" ")).toContain("Approved sample fallback");
  });

  it("exports a preview-only Miro spec with source method frame", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    const spec = generateMiroExportSpec({ canvas: generation.canvas, template: "community_workshop" });

    expect(spec.sourceMethodFrameRequired).toBe(true);
    expect(spec.frames.map((frame) => frame.title)).toContain("Source & Method");
    expect(spec.frames.map((frame) => frame.title)).toContain("Workshop Prompts");
  });

  it("applies category filters to Dallas dashboard generation", async () => {
    const generation = await generateCanvasForPrompt(
      "Show Dallas 311 service requests by category and ZIP code for 2024.",
      { category: "Sanitation" }
    );
    const table = generation.canvas.blocks.find((block) => block.type === "TableBlock");

    expect(table?.type).toBe("TableBlock");
    if (table?.type === "TableBlock") {
      expect(table.props.rows.every((row) => row.category === "Sanitation")).toBe(true);
    }
  });

  it("applies group-by filter state to the detail table", async () => {
    const generation = await generateCanvasForPrompt(
      "Show Austin building permits by month and ZIP code for 2024.",
      { __groupBy: "status" }
    );
    const table = generation.canvas.blocks.find((block) => block.type === "TableBlock");

    expect(table?.type).toBe("TableBlock");
    if (table?.type === "TableBlock") {
      expect(table.props.columns.map((column) => column.field)).toEqual(["status", "permit_count"]);
    }
  });
});

describe("production API contracts", () => {
  it("returns health and catalog health reports", async () => {
    const health = await healthGET();
    const healthBody = await health.json();
    expect(healthBody.ok).toBe(true);
    expect(healthBody.catalogCount).toBeGreaterThan(0);

    const catalogHealth = await catalogHealthGET();
    const catalogBody = await catalogHealth.json();
    expect(catalogBody.health.status).toBe("ok");
    expect(catalogBody.health.sampleFallbacks.length).toBeGreaterThan(0);
  });

  it("returns structured API errors for invalid query fields", async () => {
    const response = await queryPOST(new Request("http://localhost/api/query", {
      method: "POST",
      body: JSON.stringify({
        datasetId: "dallas_311_requests",
        groupBy: ["private_field"],
        metrics: [{ type: "count", alias: "request_count" }],
        limit: 10
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("query_failed");
    expect(JSON.stringify(body)).not.toContain("at ");
  });

  it("returns fallback mode when live query is requested for a sample-first dataset", async () => {
    const response = await queryPOST(new Request("http://localhost/api/query", {
      method: "POST",
      body: JSON.stringify({
        datasetId: "austin_building_permits",
        mode: "live_if_available",
        groupBy: ["permit_type"],
        metrics: [{ type: "count", alias: "permit_count" }],
        limit: 10
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result.dataMode).toBe("fallback");
    expect(body.result.caveats.join(" ")).toContain("not live-enabled");
  });

  it("rejects oversized JSON bodies before route parsing", async () => {
    await expect(parseJsonRequest(new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ value: "x".repeat(100) })
    }), z.object({ value: z.string() }), 16)).rejects.toThrow(/exceeds/);
  });

  it("keeps canvas generation and Miro export routes governed", async () => {
    const response = await canvasGeneratePOST(new Request("http://localhost/api/canvas/generate", {
      method: "POST",
      body: JSON.stringify({ prompt: "Show Dallas 311 service requests by category and ZIP code for 2024." })
    }));
    const body = await response.json();
    expect(body.canvas.blocks.map((block: { type: string }) => block.type)).toContain("SourceMethodBlock");

    const invalidMiro = await miroExportPOST(new Request("http://localhost/api/export/miro-spec", {
      method: "POST",
      body: JSON.stringify({ canvas: { blocks: [{ type: "UnknownBlock" }] } })
    }));
    const invalidBody = await invalidMiro.json();
    expect(invalidMiro.status).toBe(400);
    expect(invalidBody.ok).toBe(false);
  });
});
