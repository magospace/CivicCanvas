import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { approvedDatasetCatalogSchema, parsePromptIntent, type DatasetMetadata } from "../src/index";

const repoRoot = join(fileURLToPath(new URL(".", import.meta.url)), "../../..");

function catalog(): DatasetMetadata[] {
  return approvedDatasetCatalogSchema.parse(
    JSON.parse(readFileSync(join(repoRoot, "data/catalog/approved-datasets.json"), "utf8"))
  );
}

describe("prompt intent parsing", () => {
  it("parses month ranges and relative years", () => {
    const datasets = catalog();
    const monthRange = parsePromptIntent({
      prompt: "Show Dallas 311 complaints from Jan 2024 to Mar 2024 by ZIP.",
      catalog: datasets
    });
    expect(monthRange.dateRange).toEqual(["2024-01-01", "2024-03-31"]);
    expect(monthRange.groupBy).toEqual(expect.arrayContaining(["zip_code"]));

    const lastYear = parsePromptIntent({
      prompt: "Show Austin permits last year by month.",
      catalog: datasets,
      referenceDate: new Date("2026-05-10T00:00:00.000Z")
    });
    expect(lastYear.dateRange).toEqual(["2025-01-01", "2025-12-31"]);

    const thisYear = parsePromptIntent({
      prompt: "Show Houston traffic incidents this year.",
      catalog: datasets,
      referenceDate: new Date("2026-05-10T00:00:00.000Z")
    });
    expect(thisYear.dateRange).toEqual(["2026-01-01", "2026-12-31"]);
  });

  it("rejects sensitive prompt terms without losing governed suggestions", () => {
    const intent = parsePromptIntent({
      prompt: "Show Houston private phone numbers and exact addresses for raw incidents.",
      catalog: catalog()
    });

    expect(intent.datasetCandidates).toContain("houston_transportation_incidents");
    expect(intent.rejectedFields).toEqual(expect.arrayContaining(["phone", "exact address", "raw incident", "private"]));
    expect(intent.safetyWarnings.join(" ")).toContain("governed dashboards only expose approved aggregate/public fields");
    expect(intent.confidence).toBeGreaterThan(0.5);
  });

  it("matches supported Dallas, Austin, and Houston synonyms", () => {
    const datasets = catalog();

    const dallas = parsePromptIntent({
      prompt: "Show Dallas trash complaints by top categories.",
      catalog: datasets
    });
    expect(dallas.datasetCandidates).toContain("dallas_311_requests");
    expect(dallas.matchedTerms).toEqual(expect.arrayContaining(["complaints", "categories"]));
    expect(dallas.reasonCodes).toEqual(expect.arrayContaining(["synonym:complaints", "category_grouping_requested"]));

    const austin = parsePromptIntent({
      prompt: "Show Austin building activity trend for issued permits.",
      catalog: datasets
    });
    expect(austin.datasetCandidates).toContain("austin_building_permits");
    expect(austin.matchedTerms).toEqual(expect.arrayContaining(["building activity", "issued permits", "trend"]));
    expect(austin.groupBy).toContain("month");

    const houston = parsePromptIntent({
      prompt: "Show Houston road hazards and lane closures by ZIP.",
      catalog: datasets
    });
    expect(houston.datasetCandidates).toContain("houston_transportation_incidents");
    expect(houston.matchedTerms).toEqual(expect.arrayContaining(["road hazards", "lane closures", "zip"]));
    expect(houston.groupBy).toEqual(expect.arrayContaining(["incident_type", "zip_code"]));
  });
});
