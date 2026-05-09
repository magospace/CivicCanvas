import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  approvedDatasetCatalogSchema,
  createAdapterRouter,
  type DatasetMetadata,
  type DatasetSamples,
  type SampleRow
} from "@texas-data-canvas/shared";

const sampleFiles: Record<string, string> = {
  austin_building_permits: "austin-building-permits.sample.json",
  dallas_311_requests: "dallas-311.sample.json"
};

function repoRoot() {
  return join(fileURLToPath(new URL(".", import.meta.url)), "../../..");
}

function readJson(pathFromRepoRoot: string): unknown {
  return JSON.parse(readFileSync(join(repoRoot(), pathFromRepoRoot), "utf8"));
}

export function getCatalog(): DatasetMetadata[] {
  return approvedDatasetCatalogSchema.parse(readJson("data/catalog/approved-datasets.json"));
}

export function getRows(datasetId: string): SampleRow[] {
  const fileName = sampleFiles[datasetId];

  if (!fileName) {
    return [];
  }

  const sample = readJson(`data/samples/${fileName}`) as { rows: SampleRow[] };
  return sample.rows;
}

export function getSamples(): DatasetSamples {
  return Object.fromEntries(Object.keys(sampleFiles).map((datasetId) => [datasetId, getRows(datasetId)]));
}

export function getAdapter() {
  return createAdapterRouter({
    catalog: getCatalog(),
    samples: getSamples(),
    accessedAt: new Date().toISOString()
  });
}
