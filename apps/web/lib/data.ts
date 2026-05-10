import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  approvedDatasetCatalogSchema,
  catalogHealthReportSchema,
  createAdapterRouter,
  validateCanvasDocument,
  type CanvasDocument,
  type DatasetMetadata,
  type DatasetSamples
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
