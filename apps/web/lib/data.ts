import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
  approvedDatasetCatalogSchema,
  createAdapterRouter,
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
  dallas_311_requests: "dallas-311.sample.json"
};

function readJson(pathFromRepoRoot: string): unknown {
  const cwd = process.cwd();
  const repoRoot = cwd.endsWith("apps/web") ? join(cwd, "../..") : cwd;
  const absolutePath = join(repoRoot, pathFromRepoRoot);
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

export function getDatasetAdapter() {
  return createAdapterRouter({
    catalog: getDatasetCatalog(),
    samples: getDatasetSamples(),
    accessedAt: "2026-05-09T00:00:00.000Z"
  });
}

export function findDataset(datasets: DatasetMetadata[], datasetId: string): DatasetMetadata {
  const dataset = datasets.find((candidate) => candidate.id === datasetId);

  if (!dataset) {
    throw new Error(`Unknown approved dataset: ${datasetId}`);
  }

  return dataset;
}
