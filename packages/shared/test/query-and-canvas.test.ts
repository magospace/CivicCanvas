import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  approvedDatasetCatalogSchema,
  buildSocrataQueryUrl,
  createAdapterRouter,
  createSocrataAdapter,
  createStaticJsonAdapter,
  createSavedCanvasBundle,
  deleteCanvasFromStorage,
  executeBoundedQuery,
  parseSavedCanvasImport,
  parseSavedCanvases,
  parsePromptIntent,
  runtimeLimits,
  safeValidateCanvasDocument,
  saveCanvasToStorage,
  createSavedCanvas,
  validateCanvasDocument,
  RowLimitExceededError,
  UnsupportedDatasetError,
  UnsupportedFieldError,
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

  it("throws typed governed errors for unsafe query failures", () => {
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
    ).toThrow(UnsupportedDatasetError);

    expect(() =>
      executeBoundedQuery({
        catalog: catalog(),
        rows: rows("dallas-311.sample.json"),
        spec: {
          datasetId: "dallas_311_requests",
          groupBy: ["not_a_field"],
          metrics: [{ type: "count", alias: "request_count" }],
          limit: 10
        }
      })
    ).toThrow(UnsupportedFieldError);

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
    ).toThrow(RowLimitExceededError);
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
    expect(decodeURIComponent(url).replace(/\+/g, " ")).toContain("$select=service_request_type as category");
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

  it("builds safe Austin Socrata URLs for verified field mappings without network", () => {
    const dataset = catalog().find((item) => item.id === "austin_building_permits")!;
    const baseSpec = {
      datasetId: "austin_building_permits",
      filters: [{ field: "issued_date", operator: "between" as const, value: ["2024-01-01", "2024-12-31"] }],
      metrics: [{ type: "count" as const, alias: "permit_count" }],
      limit: 10
    };

    const permitTypeUrl = decodeURIComponent(buildSocrataQueryUrl({
      dataset,
      spec: { ...baseSpec, groupBy: ["permit_type"] }
    })).replace(/\+/g, " ");
    const zipUrl = decodeURIComponent(buildSocrataQueryUrl({
      dataset,
      spec: { ...baseSpec, groupBy: ["zip_code"] }
    })).replace(/\+/g, " ");
    const monthUrl = decodeURIComponent(buildSocrataQueryUrl({
      dataset,
      spec: { ...baseSpec, groupBy: ["month"] }
    })).replace(/\+/g, " ");
    const valueUrl = decodeURIComponent(buildSocrataQueryUrl({
      dataset,
      spec: {
        ...baseSpec,
        groupBy: ["permit_type"],
        metrics: [{ type: "sum" as const, field: "estimated_value", alias: "total_estimated_value" }]
      }
    })).replace(/\+/g, " ");

    expect(permitTypeUrl).toContain("$select=permit_type as permit_type");
    expect(zipUrl).toContain("$select=zip_code as zip_code");
    expect(monthUrl).toContain("date_trunc_ym(issue_date) as month");
    expect(valueUrl).toContain("sum(total_job_valuation) as total_estimated_value");
  });

  it("records Dallas and Austin live verification decisions in catalog metadata", () => {
    const datasets = catalog();
    const dallas = datasets.find((item) => item.id === "dallas_311_requests")!;
    const austin = datasets.find((item) => item.id === "austin_building_permits")!;

    expect(dallas.liveVerification?.promotionStatus).toBe("promoted");
    expect(dallas.liveVerification?.liveCapableFields).toEqual(expect.arrayContaining(["created_date", "category"]));
    expect(dallas.liveVerification?.sampleOnlyFields).toContain("zip_code");
    expect(dallas.liveVerification?.checks.some((check) => check.status === "blocked" && check.fields.includes("zip_code"))).toBe(true);

    expect(austin.liveVerification?.promotionStatus).toBe("blocked");
    expect(austin.liveVerification?.liveCapableFields).toEqual(expect.arrayContaining(["issued_date", "permit_type", "zip_code"]));
    expect(austin.liveVerification?.sampleOnlyFields).toContain("month");
    expect(austin.liveVerification?.checks.some((check) => check.status === "blocked" && check.fields.includes("month"))).toBe(true);

    for (const dataset of [dallas, austin]) {
      for (const field of dataset.liveVerification?.liveCapableFields ?? []) {
        expect(dataset.liveFieldMap[field], `${dataset.id}.${field}`).toBeTruthy();
      }
      for (const check of dataset.liveVerification?.checks.filter((item) => item.status === "passed") ?? []) {
        expect(check.url).toContain(dataset.externalDatasetId);
      }
    }
  });

  it("rejects unsafe live field mappings before URL generation", () => {
    const dataset = {
      ...catalog().find((item) => item.id === "dallas_311_requests")!,
      liveFieldMap: {
        ...catalog().find((item) => item.id === "dallas_311_requests")!.liveFieldMap,
        category: "service_request_type;drop"
      }
    };

    expect(() =>
      buildSocrataQueryUrl({
        dataset,
        spec: {
          datasetId: "dallas_311_requests",
          groupBy: ["category"],
          metrics: [{ type: "count", alias: "request_count" }],
          limit: 10
        }
      })
    ).toThrow(/Unsafe Socrata expression/);
  });

  it("parses governed prompt intent", () => {
    const intent = parsePromptIntent({
      prompt: "Show Dallas 311 service requests by category and ZIP code for 2024.",
      catalog: catalog()
    });

    expect(intent.datasetCandidates).toContain("dallas_311_requests");
    expect(intent.groupBy).toContain("zip_code");
    expect(intent.dateRange).toEqual(["2024-01-01", "2024-12-31"]);
    expect(parsePromptIntent({
      prompt: "Show top 5 Austin permit applicant phone numbers by status using sample data last year",
      catalog: catalog(),
      referenceDate: new Date("2026-05-09T00:00:00.000Z")
    }).safetyWarnings.join(" ")).toContain("phone");
    const detailedIntent = parsePromptIntent({
      prompt: "Show top 5 Austin permits by status using sample data last year",
      catalog: catalog(),
      referenceDate: new Date("2026-05-09T00:00:00.000Z")
    });
    expect(detailedIntent.dateRange).toEqual(["2025-01-01", "2025-12-31"]);
    expect(detailedIntent.reasonCodes).toContain("mode_sample_requested");
    expect(detailedIntent.reasonCodes).toContain("top_n:5");
    expect(detailedIntent.matchedTerms).toContain("austin");
  });

  it("recognizes supported prompt synonyms without hallucinating unsupported data", () => {
    const dallas = parsePromptIntent({
      prompt: "Show Dallas trash complaints by ZIP and top categories for 2024",
      catalog: catalog()
    });
    expect(dallas.datasetCandidates).toContain("dallas_311_requests");
    expect(dallas.groupBy).toEqual(expect.arrayContaining(["zip_code", "category"]));
    expect(dallas.matchedTerms).toEqual(expect.arrayContaining(["complaints", "categories"]));

    const austin = parsePromptIntent({
      prompt: "Show Austin building activity trend for issued permits",
      catalog: catalog()
    });
    expect(austin.datasetCandidates).toContain("austin_building_permits");
    expect(austin.groupBy).toContain("month");
    expect(austin.matchedTerms).toEqual(expect.arrayContaining(["building activity", "issued permits", "trend"]));

    const sensitive = parsePromptIntent({
      prompt: "Show Dallas 311 names, emails, and addresses for all complaints",
      catalog: catalog()
    });
    expect(sensitive.safetyWarnings.join(" ")).toContain("governed dashboards");
    expect(sensitive.rejectedFields).toEqual(expect.arrayContaining(["name", "email", "address"]));
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
    expect(execution.result.dataMode).toBe("fallback");
    expect(execution.audit.safetyDecisions.join(" ")).toContain("static fallback");
  });

  it("normalizes successful live Socrata aggregate responses without network", async () => {
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
    let requestedUrl = "";
    const adapter = createSocrataAdapter({
      catalog: [dataset],
      fallback,
      fetcher: async (url) => {
        requestedUrl = String(url);
        return new Response(JSON.stringify([
          { category: "Sanitation", request_count: "7" },
          { category: "Streets", request_count: "5" }
        ]), {
          status: 200,
          headers: { "content-type": "application/json" }
        });
      },
      accessedAt: "2026-05-09T00:00:00.000Z"
    });

    const execution = await adapter.queryDataset({
      datasetId: "dallas_311_requests",
      mode: "live_if_available",
      groupBy: ["category"],
      metrics: [{ type: "count", alias: "request_count" }],
      orderBy: [{ field: "request_count", direction: "desc" }],
      limit: 10
    });

    expect(decodeURIComponent(requestedUrl).replace(/\+/g, " ")).toContain("service_request_type as category");
    expect(execution.result.dataMode).toBe("live");
    expect(execution.result.rows).toEqual([
      { category: "Sanitation", request_count: 7 },
      { category: "Streets", request_count: 5 }
    ]);
    expect(execution.result.source.queryMethod).toContain("live Socrata endpoint");
    expect(execution.audit.safetyDecisions.join(" ")).toContain("live query generation");
  });

  it("falls back when a live Socrata request times out", async () => {
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
      fetcher: async (_url, init) => new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted by test timeout")));
      }),
      accessedAt: "2026-05-09T00:00:00.000Z",
      timeoutMs: 1
    });

    const execution = await adapter.queryDataset({
      datasetId: "dallas_311_requests",
      groupBy: ["category"],
      metrics: [{ type: "count", alias: "request_count" }],
      limit: 10
    });

    expect(execution.result.dataMode).toBe("fallback");
    expect(execution.result.caveats.join(" ")).toContain("aborted by test timeout");
  });

  it("marks explicit live requests as fallback when the dataset is sample-first", async () => {
    const datasets = catalog();
    const samples = { austin_building_permits: rows("austin-building-permits.sample.json") };
    const adapter = createAdapterRouter({
      catalog: datasets,
      samples,
      accessedAt: "2026-05-09T00:00:00.000Z"
    });

    const execution = await adapter.queryDataset({
      datasetId: "austin_building_permits",
      mode: "live_if_available",
      groupBy: ["permit_type"],
      metrics: [{ type: "count", alias: "permit_count" }],
      limit: 10
    });

    expect(execution.result.dataMode).toBe("fallback");
    expect(execution.result.caveats.join(" ")).toContain("not live-enabled");
    expect(execution.audit.safetyDecisions.join(" ")).toContain("Live public API was requested");
  });

  it("falls back when a live dashboard asks for an unmapped field", async () => {
    const dataset = catalog().find((item) => item.id === "dallas_311_requests")!;
    const fallback = createStaticJsonAdapter({
      catalog: [dataset],
      samples: { dallas_311_requests: rows("dallas-311.sample.json") },
      accessedAt: "2026-05-09T00:00:00.000Z"
    });
    const adapter = createSocrataAdapter({
      catalog: [dataset],
      fallback,
      fetcher: async () => {
        throw new Error("Should not fetch when mapping is missing.");
      },
      accessedAt: "2026-05-09T00:00:00.000Z"
    });

    const execution = await adapter.queryDataset({
      datasetId: "dallas_311_requests",
      groupBy: ["zip_code"],
      metrics: [{ type: "count", alias: "request_count" }],
      limit: 10
    });

    expect(execution.result.dataMode).toBe("fallback");
    expect(execution.result.caveats.join(" ")).toContain("not available in verified live mapping");
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
    expect(() => parseSavedCanvases(JSON.stringify([{ ...saved, canvas: { blocks: [] } }]))).toThrow();
    const bundle = createSavedCanvasBundle({ canvases: [saved], appVersion: "test" });
    expect(parseSavedCanvasImport(JSON.stringify(bundle))).toHaveLength(1);
    expect(parseSavedCanvasImport(JSON.stringify(saved))).toHaveLength(1);
    expect(parseSavedCanvasImport(JSON.stringify(canvas))[0].canvasId).toBe("canvas_saved");
    expect(parseSavedCanvasImport(JSON.stringify({ canvas, prompt: "Legacy saved canvas" }))[0].prompt).toBe("Legacy saved canvas");
    expect(() => parseSavedCanvasImport("x".repeat(runtimeLimits.maxSavedCanvasImportBytes + 1))).toThrow(/exceeds/);
    expect(() => parseSavedCanvasImport(JSON.stringify({ ...bundle, canvases: [{ ...saved, canvas: { blocks: [] } }] }))).toThrow();
  });
});
