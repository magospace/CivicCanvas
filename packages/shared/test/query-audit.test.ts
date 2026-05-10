import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  approvedDatasetCatalogSchema,
  executeBoundedQuery,
  UnsupportedFieldError,
  type DatasetMetadata,
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

describe("query audit safety decisions", () => {
  it("records Dallas sample aggregate audit metadata", () => {
    const { result, audit } = executeBoundedQuery({
      catalog: catalog(),
      rows: rows("dallas-311.sample.json"),
      spec: {
        datasetId: "dallas_311_requests",
        mode: "sample_only",
        filters: [{ field: "created_date", operator: "between", value: ["2024-01-01", "2024-12-31"] }],
        groupBy: ["category", "zip_code"],
        metrics: [{ type: "count", alias: "request_count" }],
        orderBy: [{ field: "request_count", direction: "desc" }],
        limit: 25
      },
      accessedAt: "2026-05-10T00:00:00.000Z",
      dataMode: "sample"
    });

    expect(result.dataMode).toBe("sample");
    expect(audit.datasetId).toBe("dallas_311_requests");
    expect(audit.fieldsUsed).toEqual(expect.arrayContaining(["created_date", "category", "zip_code"]));
    expect(audit.filtersApplied).toContain("created_date between 2024-01-01 and 2024-12-31");
    expect(audit.rowLimit).toBe(25);
    expect(audit.aggregation).toBe(true);
    expect(audit.dataMode).toBe("sample");
    expect(audit.safetyDecisions).toEqual(expect.arrayContaining([
      "Dataset ID matched approved catalog.",
      "Fields and operators validated before execution.",
      "Row limit enforced at 25.",
      "Aggregate result returned."
    ]));
  });

  it("records Austin fallback audit metadata without promoting live behavior", () => {
    const { result, audit } = executeBoundedQuery({
      catalog: catalog(),
      rows: rows("austin-building-permits.sample.json"),
      spec: {
        datasetId: "austin_building_permits",
        mode: "live_if_available",
        groupBy: ["permit_type"],
        metrics: [{ type: "count", alias: "permit_count" }],
        orderBy: [{ field: "permit_count", direction: "desc" }],
        limit: 10
      },
      accessedAt: "2026-05-10T00:00:00.000Z",
      dataMode: "fallback",
      caveats: ["Live public API requested, but this dataset is not live-enabled."]
    });

    expect(result.dataMode).toBe("fallback");
    expect(result.caveats.join(" ")).toContain("not live-enabled");
    expect(audit.fieldsUsed).toEqual(expect.arrayContaining(["permit_type"]));
    expect(audit.rowLimit).toBe(10);
    expect(audit.aggregation).toBe(true);
    expect(audit.dataMode).toBe("fallback");
    expect(audit.safetyDecisions.join(" ")).toContain("Fields and operators validated before execution.");
  });

  it("records Houston sample audit metadata and rejects hidden fields", () => {
    const { result, audit } = executeBoundedQuery({
      catalog: catalog(),
      rows: rows("houston-transportation-incidents.sample.json"),
      spec: {
        datasetId: "houston_transportation_incidents",
        mode: "sample_only",
        filters: [{ field: "reported_date", operator: "between", value: ["2024-01-01", "2024-12-31"] }],
        groupBy: ["incident_type", "zip_code"],
        metrics: [{ type: "count", alias: "incident_count" }],
        orderBy: [{ field: "incident_count", direction: "desc" }],
        limit: 10
      },
      accessedAt: "2026-05-10T00:00:00.000Z",
      dataMode: "sample"
    });

    expect(result.dataMode).toBe("sample");
    expect(JSON.stringify(result)).not.toContain("precise_address");
    expect(audit.fieldsUsed).toEqual(expect.arrayContaining(["reported_date", "incident_type", "zip_code"]));
    expect(audit.rowLimit).toBe(10);
    expect(audit.aggregation).toBe(true);
    expect(audit.dataMode).toBe("sample");

    expect(() =>
      executeBoundedQuery({
        catalog: catalog(),
        rows: rows("houston-transportation-incidents.sample.json"),
        spec: {
          datasetId: "houston_transportation_incidents",
          mode: "sample_only",
          groupBy: ["precise_address"],
          metrics: [{ type: "count", alias: "incident_count" }],
          limit: 10
        }
      })
    ).toThrow(UnsupportedFieldError);
  });
});
