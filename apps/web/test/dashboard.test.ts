import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { validateCanvasDocument, type CanvasBlock } from "@texas-data-canvas/shared";
import { createDatasetSuggestionCanvas, generateCanvasForPrompt } from "../lib/dashboard";
import { getCuratedGalleryCanvases, getDatasetCatalog } from "../lib/data";

const allowedGalleryBlockTypes = new Set<CanvasBlock["type"]>([
  "SummaryBlock",
  "MetricBlock",
  "ChartBlock",
  "MapBlock",
  "TableBlock",
  "FilterBlock",
  "SourceMethodBlock",
  "DatasetCardBlock"
]);

describe("dashboard generation", () => {
  it("generates the Dallas demo dashboard", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");

    expect(generation.canvas.title).toContain("Dallas 311");
    expect(generation.canvas.id).toMatch(/^canvas_dallas_311_requests_/);
    expect(generation.canvas.createdAt).not.toBe("2026-05-09T00:00:00.000Z");
    expect(generation.canvas.sources[0].accessedAt).toBe(generation.canvas.createdAt);
    expect(generation.dataMode).toBe("fallback");
    expect(generation.audits.length).toBeGreaterThan(0);
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("ChartBlock");
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("TableBlock");
  });

  it("generates distinct canvas IDs for repeated saves", async () => {
    const first = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    const second = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");

    expect(first.canvas.id).not.toBe(second.canvas.id);
  });

  it("generates the Austin demo dashboard", async () => {
    const generation = await generateCanvasForPrompt("Show Austin building permits by month and ZIP code.");

    expect(generation.canvas.title).toContain("Austin Building Permits");
    expect(generation.audits.length).toBeGreaterThan(0);
    expect(generation.canvas.sources[0].datasetId).toBe("austin_building_permits");
  });

  it("generates the governed Houston transportation dashboard", async () => {
    const generation = await generateCanvasForPrompt("Show Houston transportation incidents by ZIP and incident type for 2024.");

    expect(generation.canvas.title).toContain("Houston Transportation");
    expect(generation.canvas.sources[0].datasetId).toBe("houston_transportation_incidents");
    expect(generation.dataMode).toBe("sample");
    expect(generation.audits.length).toBeGreaterThan(0);
    expect(generation.intent?.matchedTerms).toEqual(expect.arrayContaining(["transportation", "incident"]));
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");
    expect(generation.canvas.blocks.find((block) => block.id === "status-chart")?.type).toBe("ChartBlock");
    expect(generation.canvas.blocks.some((block) => block.type === "DatasetCardBlock")).toBe(false);
    expect(JSON.stringify(generation.canvas)).not.toContain("precise_address");
  });

  it("returns exact supported prompt and approved source suggestions for unsupported prompts", async () => {
    const generation = await generateCanvasForPrompt("Compare tax abatements across El Paso.");

    expect(generation.suggestedDatasets?.length).toBeGreaterThan(0);
    expect(generation.audits).toEqual([]);
    expect(generation.canvas.title).toContain("Choose");

    const summary = generation.canvas.blocks.find((block) => block.id === "summary");
    expect(summary?.type).toBe("SummaryBlock");
    if (summary?.type === "SummaryBlock") {
      expect(summary.props.bullets).toEqual([
        "Show Dallas 311 service requests by category and ZIP code for 2024.",
        "Show Austin building permits by month and ZIP code for 2024.",
        "Show Houston transportation incidents by ZIP and incident type for 2024."
      ]);
      expect(summary.props.text).toContain(
        "Approved sources include City of Dallas Open Data, City of Austin Open Data, and Houston TranStar Traffic Data Feeds."
      );
    }

    const sourceNames = generation.canvas.blocks
      .filter((block) => block.type === "DatasetCardBlock")
      .map((block) => block.props.dataset.sourceName);
    expect(sourceNames).toEqual([
      "City of Dallas Open Data",
      "City of Austin Open Data",
      "Houston TranStar Traffic Data Feeds"
    ]);
  });

  it("refuses Houston exact-location prompts before dashboard generation", async () => {
    const generation = await generateCanvasForPrompt("Show Houston exact addresses and raw incident locations by ZIP for 2024.");

    expect(generation.canvas.title).toContain("Choose");
    expect(generation.audits).toEqual([]);
    expect(generation.intent?.rejectedFields).toEqual(expect.arrayContaining(["exact address", "raw incident"]));
    expect(generation.intent?.safetyWarnings.join(" ")).toContain("governed dashboards");
  });

  it("routes supported synonym prompts through governed deterministic dashboards", async () => {
    const dallas = await generateCanvasForPrompt("Show Dallas trash complaints by ZIP and top categories for 2024.");
    expect(dallas.canvas.sources[0].datasetId).toBe("dallas_311_requests");
    expect(dallas.intent?.matchedTerms).toEqual(expect.arrayContaining(["complaints", "categories"]));

    const austin = await generateCanvasForPrompt("Show Austin building activity trend for issued permits.");
    expect(austin.canvas.sources[0].datasetId).toBe("austin_building_permits");
    expect(austin.intent?.matchedTerms).toEqual(expect.arrayContaining(["building activity", "issued permits", "trend"]));

    const houston = await generateCanvasForPrompt("Show Houston traffic incidents by ZIP and top incident types for 2024.");
    expect(houston.canvas.sources[0].datasetId).toBe("houston_transportation_incidents");
    expect(houston.intent?.matchedTerms).toEqual(expect.arrayContaining(["traffic incidents", "zip", "top"]));
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

    const houstonLive = await generateCanvasForPrompt(
      "Show Houston transportation incidents by ZIP and incident type for 2024.",
      {},
      "live"
    );
    expect(houstonLive.requestedDataMode).toBe("live");
    expect(houstonLive.dataMode).toBe("fallback");
    expect(houstonLive.fallbackReason).toContain("not live-enabled");
  });

  it("keeps a validated dashboard when one aggregate query fails and records the failure caveat", async () => {
    const generation = await generateCanvasForPrompt(
      "Show Dallas 311 service requests by category and ZIP code for 2024.",
      {},
      "auto",
      {
        queryRunner: async (adapter, spec) => {
          if (spec.groupBy.includes("status")) {
            throw new Error("simulated status aggregate failure");
          }
          return adapter.queryDataset(spec);
        }
      }
    );

    expect(generation.canvas.title).toContain("Dallas 311");
    expect(generation.dataMode).toBe("fallback");
    expect(generation.fallbackReason).toContain("status");
    expect(generation.fallbackReason).toContain("simulated status aggregate failure");
    expect(generation.canvas.sources[0].caveats.join(" ")).toContain("status query failed");
    expect(generation.audits.some((audit) => audit.safetyDecisions.join(" ").includes("simulated status aggregate failure"))).toBe(true);
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");
    expect(generation.canvas.blocks.find((block) => block.id === "detail-table")?.type).toBe("TableBlock");
  });

  it("verifies data mode, fallback caveats, and source attribution for each supported dashboard", async () => {
    const dallas = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    expect(dallas.requestedDataMode).toBe("auto");
    expect(dallas.dataMode).toBe("fallback");
    expect(dallas.fallbackReason).toContain("zip_code");
    expect(dallas.canvas.sources[0]).toEqual(expect.objectContaining({
      datasetId: "dallas_311_requests",
      dataMode: "fallback",
      sourceName: "City of Dallas Open Data"
    }));
    expect(dallas.canvas.sources[0].caveats.join(" ")).toContain("Approved sample fallback");

    const austin = await generateCanvasForPrompt(
      "Show Austin building permits by month and ZIP code for 2024.",
      {},
      "live"
    );
    expect(austin.requestedDataMode).toBe("live");
    expect(austin.dataMode).toBe("fallback");
    expect(austin.fallbackReason).toContain("not live-enabled");
    expect(austin.canvas.sources[0]).toEqual(expect.objectContaining({
      datasetId: "austin_building_permits",
      dataMode: "fallback",
      sourceName: "City of Austin Open Data"
    }));
    expect(austin.canvas.sources[0].caveats.join(" ")).toContain("Approved sample fallback");

    const houston = await generateCanvasForPrompt("Show Houston transportation incidents by ZIP and incident type for 2024.");
    expect(houston.requestedDataMode).toBe("auto");
    expect(houston.dataMode).toBe("sample");
    expect(houston.fallbackReason).toBeUndefined();
    expect(houston.canvas.sources[0]).toEqual(expect.objectContaining({
      datasetId: "houston_transportation_incidents",
      dataMode: "sample",
      sourceName: "Houston TranStar Traffic Data Feeds"
    }));
    expect(houston.canvas.sources[0].caveats.join(" ")).toContain("sample-first");
  });

  it("rejects filters outside the fixed dataset field allowlist before querying", async () => {
    await expect(generateCanvasForPrompt(
      "Show Dallas 311 service requests by category and ZIP code for 2024.",
      { permit_type: "Electrical" }
    )).rejects.toThrow(/not approved for dallas_311_requests/);
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

  it("returns a governed unsupported-prompt canvas even when suggestion catalog is empty", () => {
    const canvas = createDatasetSuggestionCanvas("Show something outside the catalog.", []);

    expect(canvas.title).toContain("Choose");
    expect(canvas.sources[0].datasetId).toBe("catalog_suggestions");
    expect(canvas.blocks.some((block) => block.type === "DatasetCardBlock")).toBe(false);
    expect(JSON.stringify(canvas)).toContain("No approved suggestion datasets are available");
  });

  it("loads curated gallery canvases from checked-in validated JSON", () => {
    const canvases = getCuratedGalleryCanvases();

    expect(canvases.map((canvas) => canvas.id)).toEqual([
      "gallery_dallas_311_sample",
      "gallery_austin_permits_sample",
      "gallery_houston_transportation_sample",
      "gallery_unsupported_sensitive_prompt"
    ]);
    expect(canvases.every((canvas) => canvas.blocks.some((block) => block.type === "SourceMethodBlock"))).toBe(true);
    expect(canvases.map((canvas) => canvas.prompt).join(" ")).toContain("personal contact details");
  });

  it("validates every checked-in gallery fixture against governed canvas boundaries", () => {
    const galleryDir = join(process.cwd(), "data/gallery");
    const galleryFiles = readdirSync(galleryDir)
      .filter((fileName) => fileName.endsWith(".canvas.json"))
      .sort();
    const catalog = getDatasetCatalog();
    const approvedDatasetIds = new Set(catalog.map((dataset) => dataset.id));
    const hiddenFieldNames = catalog.flatMap((dataset) =>
      dataset.fields
        .filter((field) => ["sensitive_hide", "unknown_review"].includes(field.classification))
        .map((field) => field.name)
    );

    expect(galleryFiles).toEqual([
      "austin-permits-sample.canvas.json",
      "dallas-311-sample.canvas.json",
      "houston-transportation-sample.canvas.json",
      "unsupported-sensitive-prompt.canvas.json"
    ]);
    expect(hiddenFieldNames).toContain("precise_address");

    for (const fileName of galleryFiles) {
      const rawCanvas = JSON.parse(readFileSync(join(galleryDir, fileName), "utf8"));
      const canvas = validateCanvasDocument(rawCanvas);
      const serializedCanvas = JSON.stringify(canvas);
      const sourceMethodBlocks = canvas.blocks.filter((block) => block.type === "SourceMethodBlock");

      expect(sourceMethodBlocks.length, fileName).toBeGreaterThan(0);
      expect(canvas.blocks.every((block) => allowedGalleryBlockTypes.has(block.type)), fileName).toBe(true);

      for (const hiddenFieldName of hiddenFieldNames) {
        expect(serializedCanvas, `${fileName} should not expose hidden field ${hiddenFieldName}`).not.toContain(hiddenFieldName);
      }

      for (const source of canvas.sources) {
        if (source.datasetId === "catalog_suggestions") {
          expect(canvas.id).toBe("gallery_unsupported_sensitive_prompt");
        } else {
          expect(approvedDatasetIds.has(source.datasetId), `${fileName} source ${source.datasetId} must be approved`).toBe(true);
        }
        expect(source.queryMethod.length, fileName).toBeGreaterThan(0);
      }

      for (const block of sourceMethodBlocks) {
        if (block.type === "SourceMethodBlock") {
          const datasetId = block.props.attribution.datasetId;
          if (datasetId === "catalog_suggestions") {
            expect(canvas.id).toBe("gallery_unsupported_sensitive_prompt");
          } else {
            expect(approvedDatasetIds.has(datasetId), `${fileName} attribution ${datasetId} must be approved`).toBe(true);
          }
          expect(block.props.attribution.sourceName.length, fileName).toBeGreaterThan(0);
          expect(block.props.attribution.sourceUrl).toMatch(/^https?:\/\//);
          expect(block.props.methodology.length, fileName).toBeGreaterThan(0);
        }
      }
    }
  });
});
