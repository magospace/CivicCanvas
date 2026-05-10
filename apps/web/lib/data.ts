import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  approvedDatasetCatalogSchema,
  catalogHealthReportSchema,
  createAdapterRouter,
  releaseEvidenceSchema,
  validateCanvasDocument,
  type CanvasDocument,
  type DatasetMetadata,
  type DatasetSamples,
  type ReleaseEvidence
} from "@texas-data-canvas/shared";

const sampleFileSchema = z.object({
  datasetId: z.string(),
  note: z.string(),
  rows: z.array(z.record(z.union([z.string(), z.number(), z.boolean(), z.null()])))
});

const sampleFiles: Record<string, string> = {
  austin_building_permits: "austin-building-permits.sample.json",
  dallas_311_requests: "dallas-311.sample.json",
  houston_transportation_incidents: "houston-transportation-incidents.sample.json"
};

const galleryCanvasFiles = [
  "dallas-311-sample.canvas.json",
  "austin-permits-sample.canvas.json",
  "houston-transportation-sample.canvas.json",
  "unsupported-sensitive-prompt.canvas.json"
];

function repoRoot() {
  const cwd = process.cwd();
  return cwd.endsWith("apps/web") ? join(cwd, "../..") : cwd;
}

function readJson(pathFromRepoRoot: string): unknown {
  const absolutePath = join(repoRoot(), pathFromRepoRoot);
  return JSON.parse(readFileSync(absolutePath, "utf8"));
}

export function getDatasetCatalog(): DatasetMetadata[] {
  return approvedDatasetCatalogSchema.parse(readJson("data/catalog/approved-datasets.json"));
}

export function getSampleRows(datasetId: string) {
  const fileName = sampleFiles[datasetId];

  if (!fileName) {
    return [];
  }

  const sample = sampleFileSchema.parse(readJson(`data/samples/${fileName}`));
  return sample.rows;
}

export function getDatasetSamples(): DatasetSamples {
  return Object.fromEntries(
    Object.keys(sampleFiles).map((datasetId) => [datasetId, getSampleRows(datasetId)])
  );
}

export function getCuratedGalleryCanvases(): CanvasDocument[] {
  return galleryCanvasFiles.map((fileName) =>
    validateCanvasDocument(readJson(`data/gallery/${fileName}`))
  );
}

export function getReleaseEvidence(): ReleaseEvidence {
  return releaseEvidenceSchema.parse(readJson("docs/release-evidence.json"));
}

function countValues(rows: Array<Record<string, unknown>>, field: string) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = row[field];
    if (typeof value === "string" && value.trim()) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 5)
    .map(([value, count]) => ({ value, count }));
}

export function getSampleDataQualityReport() {
  const catalog = getDatasetCatalog();
  const datasets = catalog
    .filter((dataset) => dataset.fallbackSampleFile)
    .map((dataset) => {
      const fileName = dataset.fallbackSampleFile!;
      const sample = sampleFileSchema.parse(readJson(`data/samples/${fileName}`));
      const dateFields = dataset.fields.filter((field) => field.type === "date").map((field) => field.name);
      const dateValues = dateFields.flatMap((field) =>
        sample.rows.map((row) => row[field]).filter((value): value is string => typeof value === "string")
      ).sort();
      const expectedZip = dataset.fields.some((field) => field.name === "zip_code");
      const missingZipRows = expectedZip
        ? sample.rows.filter((row) => typeof row.zip_code !== "string" || row.zip_code.length === 0).length
        : 0;
      const categoryField = dataset.fields.find((field) =>
        ["category", "permit_type", "incident_type"].includes(field.name)
      )?.name;

      return {
        datasetId: dataset.id,
        title: dataset.title,
        file: fileName,
        rowCount: sample.rows.length,
        dateRange: dateValues.length > 0 ? { min: dateValues[0], max: dateValues[dateValues.length - 1] } : null,
        expectedZip,
        missingZipRows,
        topCategories: categoryField ? countValues(sample.rows, categoryField) : [],
        topStatuses: countValues(sample.rows, "status")
      };
    });

  return {
    checkedAt: new Date().toISOString(),
    datasets
  };
}

export function getDatasetAdapter() {
  return createAdapterRouter({
    catalog: getDatasetCatalog(),
    samples: getDatasetSamples(),
    accessedAt: new Date().toISOString()
  });
}

export function findDataset(datasets: DatasetMetadata[], datasetId: string): DatasetMetadata {
  const dataset = datasets.find((candidate) => candidate.id === datasetId);

  if (!dataset) {
    throw new Error(`Unknown approved dataset: ${datasetId}`);
  }

  return dataset;
}

export function getCatalogHealth() {
  const checkedAt = new Date().toISOString();
  const issues: { path: string[]; code: string; message: string }[] = [];
  let datasets: DatasetMetadata[] = [];

  try {
    datasets = getDatasetCatalog();
  } catch (error) {
    issues.push({
      path: ["data", "catalog"],
      code: "invalid_catalog",
      message: error instanceof Error ? error.message : "Catalog failed validation."
    });
  }

  const sampleFallbacks = datasets
    .filter((dataset) => dataset.fallbackSampleFile)
    .map((dataset) => {
      const file = dataset.fallbackSampleFile!;
      const available = existsSync(join(repoRoot(), "data/samples", file));
      if (!available) {
        issues.push({
          path: ["data", "samples", file],
          code: "missing_sample",
          message: `Missing fallback sample for ${dataset.id}.`
        });
      }
      return { datasetId: dataset.id, file, available };
    });

  return catalogHealthReportSchema.parse({
    status: issues.length === 0 ? "ok" : datasets.length > 0 ? "degraded" : "failed",
    checkedAt,
    datasetCount: datasets.length,
    liveEnabledDatasets: datasets.filter((dataset) => dataset.liveAvailable).map((dataset) => dataset.id),
    sampleFallbacks,
    issues
  });
}
