import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  approvedDatasetCatalogSchema,
  buildSocrataQueryUrl,
  createSocrataAdapter,
  createStaticJsonAdapter,
  deleteCanvasFromStorage,
  executeBoundedQuery,
  parsePromptIntent,
  safeValidateCanvasDocument,
  saveCanvasToStorage,
  createSavedCanvas,
  validateCanvasDocument,
  type DatasetMetadata,
  type StorageLike,
  type SampleRow
} from "../src/index";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function readJson(pathFromRoot: string) {
  return JSON.parse(readFileSync(join(repoRoot, pathFromRoot), "utf8"));
}

function catalog(): DatasetMetadata[] {
  return approvedDatasetCatalogSchema.parse(readJson("data/catalog/approved-datasets.json"));
}

function rows(fileName: string): SampleRow[] {
  return readJson(`data/samples/${fileName}`).rows;
}

describe("bounded local query execution", () => {
  it("groups Dallas 311 requests by category and ZIP", () => {
    const { result, audit } = executeBoundedQuery({
      catalog: catalog(),
      rows: rows("dallas-311.sample.json"),
      spec: {
        datasetId: "dallas_311_requests",
        filters: [
          { field: "created_date", operator: "between", value: ["2024-01-01", "2024-12-31"] }
        ],
        groupBy: ["category", "zip_code"],
        metrics: [{ type: "count", alias: "request_count" }],
        orderBy: [{ field: "request_count", direction: "desc" }],
        limit: 25
      },
      accessedAt: "2026-05-09T00:00:00.000Z"
    });

    expect(result.datasetId).toBe("dallas_311_requests");
    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0]).toHaveProperty("category");
    expect(result.rows[0]).toHaveProperty("zip_code");
    expect(result.rows[0]).toHaveProperty("request_count");
    expect(audit.safetyDecisions.join(" ")).toContain("approved catalog");
  });

  it("groups Dallas 311 requests by month", () => {
    const { result } = executeBoundedQuery({
      catalog: catalog(),
      rows: rows("dallas-311.sample.json"),
      spec: {
        datasetId: "dallas_311_requests",
        groupBy: ["month"],
        metrics: [{ type: "count", alias: "request_count" }],
        orderBy: [{ field: "month", direction: "asc" }],
        limit: 12
      },
      accessedAt: "2026-05-09T00:00:00.000Z"
    });

    expect(result.rows[0]).toHaveProperty("month");
    expect(result.columns.map((column) => column.field)).toEqual(["month", "request_count"]);
  });

  it("groups Austin permits by month and ZIP", () => {
    const { result } = executeBoundedQuery({
      catalog: catalog(),
      rows: rows("austin-building-permits.sample.json"),
      spec: {
        datasetId: "austin_building_permits",
        groupBy: ["month", "zip_code"],
        metrics: [
          { type: "count", alias: "permit_count" },
          { type: "sum", field: "estimated_value", alias: "total_estimated_value" }
        ],
        orderBy: [{ field: "permit_count", direction: "desc" }],
        limit: 25
      },
      accessedAt: "2026-05-09T00:00:00.000Z"
    });

    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0]).toHaveProperty("permit_count");
    expect(result.rows[0]).toHaveProperty("total_estimated_value");
  });

  it("rejects unsafe query shapes", () => {
    expect(() =>
      executeBoundedQuery({
        catalog: catalog(),
        rows: rows("dallas-311.sample.json"),
        spec: {
          datasetId: "not_approved",
          groupBy: ["month"],
          metrics: [{ type: "count", alias: "request_count" }],
          limit: 10
        }
      })
    ).toThrow(/not approved/);

    expect(() =>
      executeBoundedQuery({
        catalog: catalog(),
        rows: rows("dallas-311.sample.json"),
        spec: {
          datasetId: "dallas_311_requests",
          groupBy: ["private_field"],
          metrics: [{ type: "count", alias: "request_count" }],
          limit: 10
        }
      })
    ).toThrow(/not allowlisted/);

    expect(() =>
      executeBoundedQuery({
        catalog: catalog(),
        rows: rows("dallas-311.sample.json"),
        spec: {
          datasetId: "dallas_311_requests",
          filters: [{ field: "month", operator: "regex", value: "2024" }],
          groupBy: ["month"],
          metrics: [{ type: "count", alias: "request_count" }],
          limit: 10
        }
      })
    ).toThrow();

    expect(() =>
      executeBoundedQuery({
        catalog: catalog(),
        rows: rows("dallas-311.sample.json"),
        spec: {
          datasetId: "dallas_311_requests",
          groupBy: [],
          metrics: [{ type: "count", alias: "request_count" }],
          limit: 101
        }
      })
    ).toThrow(/exceeds max 100/);
  });
});

describe("canvas validation", () => {
  const source = {
    datasetId: "dallas_311_requests",
    datasetTitle: "Dallas 311 Service Requests",
    sourceName: "City of Dallas Open Data",
    sourceUrl: "https://www.dallasopendata.com/",
    accessedAt: "2026-05-09T00:00:00.000Z",
    fieldsUsed: ["month"],
    filtersApplied: [],
    queryMethod: "Test",
    caveats: ["Sample data"],
    license: "Source terms"
  };

  it("accepts a canvas with SourceMethodBlock", () => {
    const canvas = validateCanvasDocument({
      id: "canvas_test",
      title: "Safe canvas",
      createdAt: "2026-05-09T00:00:00.000Z",
      updatedAt: "2026-05-09T00:00:00.000Z",
      sources: [source],
      queries: [],
      blocks: [
        {
          id: "summary",
          type: "SummaryBlock",
          props: { heading: "Summary", text: "Safe summary", bullets: [] }
        },
        {
          id: "source",
          type: "SourceMethodBlock",
          props: { attribution: source, methodology: "Safe method" }
        }
      ]
    });

    expect(canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");
  });

  it("rejects unknown blocks, missing SourceMethodBlock, and script-like strings", () => {
    const missingSource = safeValidateCanvasDocument({
      id: "canvas_test",
      title: "Unsafe canvas",
      createdAt: "2026-05-09T00:00:00.000Z",
      updatedAt: "2026-05-09T00:00:00.000Z",
      sources: [source],
      queries: [],
      blocks: [
        {
          id: "summary",
          type: "SummaryBlock",
          props: { heading: "Summary", text: "Safe summary", bullets: [] }
        }
      ]
    });

    expect(missingSource.ok).toBe(false);
    expect(missingSource.errors.join(" ")).toContain("SourceMethodBlock");

    const unknownBlock = safeValidateCanvasDocument({
      id: "canvas_test",
      title: "Unsafe canvas",
      createdAt: "2026-05-09T00:00:00.000Z",
      updatedAt: "2026-05-09T00:00:00.000Z",
      sources: [source],
      queries: [],
      blocks: [{ id: "raw", type: "RawHtmlBlock", props: { html: "<b>no</b>" } }]
    });

    expect(unknownBlock.ok).toBe(false);

    const scriptLike = safeValidateCanvasDocument({
      id: "canvas_test",
      title: "Unsafe canvas",
      createdAt: "2026-05-09T00:00:00.000Z",
      updatedAt: "2026-05-09T00:00:00.000Z",
      sources: [source],
      queries: [],
      blocks: [
        {
          id: "summary",
          type: "SummaryBlock",
          props: { heading: "Summary", text: "<script>alert(1)</script>", bullets: [] }
        },
        {
          id: "source",
          type: "SourceMethodBlock",
          props: { attribution: source, methodology: "Safe method" }
        }
      ]
    });

    expect(scriptLike.ok).toBe(false);
    expect(scriptLike.errors.join(" ")).toContain("unsafe generated markup");
  });

  it("rejects external map layer props and accepts governed ZIP features", () => {
    const source = {
      datasetId: "dallas_311_requests",
      datasetTitle: "Dallas 311 Service Requests",
      sourceName: "City of Dallas Open Data",
      sourceUrl: "https://www.dallasopendata.com/",
      accessedAt: "2026-05-09T00:00:00.000Z",
      fieldsUsed: ["zip_code"],
      filtersApplied: [],
      queryMethod: "Test",
      caveats: ["Sample data"],
      license: "Source terms"
    };
    const valid = safeValidateCanvasDocument({
      id: "canvas_map",
      title: "Map",
      createdAt: "2026-05-09T00:00:00.000Z",
      updatedAt: "2026-05-09T00:00:00.000Z",
      sources: [source],
      queries: [],
      blocks: [
        {
          id: "map",
          type: "MapBlock",
          props: {
            title: "ZIP map",
            geographyMode: "zip_bubble",
            geographyField: "zip_code",
            metricField: "request_count",
            data: [{ zip_code: "75201", request_count: 4 }],
            features: [{ id: "75201", label: "75201", longitude: -96.8, latitude: 32.78 }]
          }
        },
        {
          id: "source",
          type: "SourceMethodBlock",
          props: { attribution: source, methodology: "Safe method" }
        }
      ]
    });
    expect(valid.ok).toBe(true);

    const unsafe = safeValidateCanvasDocument({
      id: "canvas_map",
      title: "Map",
      createdAt: "2026-05-09T00:00:00.000Z",
      updatedAt: "2026-05-09T00:00:00.000Z",
      sources: [source],
      queries: [],
      blocks: [
        {
          id: "map",
          type: "MapBlock",
          props: {
            title: "ZIP map",
            geographyField: "zip_code",
            metricField: "request_count",
            data: [],
            externalLayerUrl: "javascript:alert(1)"
          }
        },
        {
          id: "source",
          type: "SourceMethodBlock",
          props: { attribution: source, methodology: "Safe method" }
        }
      ]
    });
    expect(unsafe.ok).toBe(false);
  });
});

describe("adapter and intent helpers", () => {
  it("static adapter returns bounded Dallas results", async () => {
    const adapter = createStaticJsonAdapter({
      catalog: catalog(),
      samples: { dallas_311_requests: rows("dallas-311.sample.json") },
      accessedAt: "2026-05-09T00:00:00.000Z"
    });

    const execution = await adapter.queryDataset({
      datasetId: "dallas_311_requests",
      groupBy: ["category"],
      metrics: [{ type: "count", alias: "request_count" }],
      orderBy: [{ field: "request_count", direction: "desc" }],
      limit: 10
    });

    expect(execution.result.rows.length).toBeGreaterThan(0);
  });

  it("builds safe Socrata URLs and rejects unsafe fields", () => {
    const dataset = {
      ...catalog().find((item) => item.id === "dallas_311_requests")!,
      liveAvailable: true,
      externalDatasetId: "abcd-1234",
      apiBaseUrl: "https://www.dallasopendata.com"
    };
    const url = buildSocrataQueryUrl({
      dataset,
      spec: {
        datasetId: "dallas_311_requests",
        filters: [{ field: "created_date", operator: "between", value: ["2024-01-01", "2024-12-31"] }],
        groupBy: ["category"],
        metrics: [{ type: "count", alias: "request_count" }],
        orderBy: [{ field: "request_count", direction: "desc" }],
        limit: 10
      }
    });
    expect(decodeURIComponent(url)).toContain("$select=category");
    expect(url).toContain("count");

    expect(() =>
      buildSocrataQueryUrl({
        dataset,
        spec: {
          datasetId: "dallas_311_requests",
          groupBy: ["category;drop"],
          metrics: [{ type: "count", alias: "request_count" }],
          limit: 10
        }
      })
    ).toThrow();
  });

  it("parses governed prompt intent", () => {
    const intent = parsePromptIntent({
      prompt: "Show Dallas 311 service requests by category and ZIP code for 2024.",
      catalog: catalog()
    });

    expect(intent.datasetCandidates).toContain("dallas_311_requests");
    expect(intent.groupBy).toContain("zip_code");
    expect(intent.dateRange).toEqual(["2024-01-01", "2024-12-31"]);
  });

  it("falls back to static samples when a live Socrata request fails", async () => {
    const dataset = {
      ...catalog().find((item) => item.id === "dallas_311_requests")!,
      liveAvailable: true,
      externalDatasetId: "abcd-1234",
      apiBaseUrl: "https://www.dallasopendata.com"
    };
    const fallback = createStaticJsonAdapter({
      catalog: [dataset],
      samples: { dallas_311_requests: rows("dallas-311.sample.json") },
      accessedAt: "2026-05-09T00:00:00.000Z"
    });
    const adapter = createSocrataAdapter({
      catalog: [dataset],
      fallback,
      fetcher: async () => {
        throw new Error("network down");
      },
      accessedAt: "2026-05-09T00:00:00.000Z"
    });

    const execution = await adapter.queryDataset({
      datasetId: "dallas_311_requests",
      groupBy: ["category"],
      metrics: [{ type: "count", alias: "request_count" }],
      limit: 10
    });

    expect(execution.result.caveats.join(" ")).toContain("static sample fallback");
    expect(execution.audit.safetyDecisions.join(" ")).toContain("static fallback");
  });
});

describe("local saved canvas persistence", () => {
  class MemoryStorage implements StorageLike {
    private values = new Map<string, string>();
    getItem(key: string) {
      return this.values.get(key) ?? null;
    }
    setItem(key: string, value: string) {
      this.values.set(key, value);
    }
    removeItem(key: string) {
      this.values.delete(key);
    }
  }

  it("saves and deletes valid canvases", () => {
    const storage = new MemoryStorage();
    const source = {
      datasetId: "dallas_311_requests",
      datasetTitle: "Dallas 311 Service Requests",
      sourceName: "City of Dallas Open Data",
      sourceUrl: "https://www.dallasopendata.com/",
      accessedAt: "2026-05-09T00:00:00.000Z",
      fieldsUsed: ["month"],
      filtersApplied: [],
      queryMethod: "Test",
      caveats: ["Sample data"],
      license: "Source terms"
    };
    const canvas = validateCanvasDocument({
      id: "canvas_saved",
      title: "Saved",
      createdAt: "2026-05-09T00:00:00.000Z",
      updatedAt: "2026-05-09T00:00:00.000Z",
      sources: [source],
      queries: [],
      blocks: [
        {
          id: "summary",
          type: "SummaryBlock",
          props: { heading: "Summary", text: "Safe summary", bullets: [] }
        },
        {
          id: "source",
          type: "SourceMethodBlock",
          props: { attribution: source, methodology: "Safe method" }
        }
      ]
    });
    const saved = createSavedCanvas({ canvas, prompt: "Show Dallas 311" });
    expect(saveCanvasToStorage(storage, saved)).toHaveLength(1);
    expect(deleteCanvasFromStorage(storage, saved.canvasId)).toHaveLength(0);
  });
});
