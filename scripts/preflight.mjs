import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalogPath = join(root, "data/catalog/approved-datasets.json");
const sampleDir = join(root, "data/samples");

function webRuntimeRepoRoot(cwd) {
  return cwd.endsWith("apps/web") ? join(cwd, "../..") : cwd;
}

for (const cwd of [root, join(root, "apps/web")]) {
  const runtimeRoot = webRuntimeRepoRoot(cwd);
  const runtimeCatalogPath = join(runtimeRoot, "data/catalog/approved-datasets.json");
  const runtimeSampleDir = join(runtimeRoot, "data/samples");
  if (!existsSync(runtimeCatalogPath)) {
    throw new Error(`Runtime catalog path is unavailable from ${cwd}: ${runtimeCatalogPath}`);
  }
  if (!existsSync(runtimeSampleDir)) {
    throw new Error(`Runtime sample directory is unavailable from ${cwd}: ${runtimeSampleDir}`);
  }
}

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

for (const dataset of catalog) {
  if (!dataset.id || !dataset.title || !dataset.sourceUrl) {
    throw new Error(`Catalog entry missing required metadata: ${JSON.stringify(dataset)}`);
  }

  if (dataset.liveAvailable) {
    if (!dataset.fallbackSampleFile) {
      throw new Error(`Live dataset must keep a fallback sample: ${dataset.id}`);
    }
    if (!dataset.externalDatasetId || !dataset.apiBaseUrl || !dataset.liveFieldMap) {
      throw new Error(`Live dataset missing adapter metadata: ${dataset.id}`);
    }
  }

  if (dataset.liveVerification) {
    if (!dataset.liveVerification.lastCheckedAt || !dataset.liveVerification.promotionStatus) {
      throw new Error(`Live verification missing status metadata: ${dataset.id}`);
    }
    if (dataset.liveVerification.externalDatasetId && dataset.externalDatasetId &&
      dataset.liveVerification.externalDatasetId !== dataset.externalDatasetId) {
      throw new Error(`Live verification external ID mismatch: ${dataset.id}`);
    }
    for (const field of dataset.liveVerification.liveCapableFields ?? []) {
      if (!dataset.liveFieldMap?.[field]) {
        throw new Error(`Live-capable field lacks liveFieldMap entry: ${dataset.id}.${field}`);
      }
    }
  }

  if (dataset.fallbackSampleFile) {
    const samplePath = join(sampleDir, dataset.fallbackSampleFile);
    if (!existsSync(samplePath)) {
      throw new Error(`Missing fallback sample for ${dataset.id}: ${dataset.fallbackSampleFile}`);
    }
    const sample = JSON.parse(readFileSync(samplePath, "utf8"));
    if (!Array.isArray(sample.rows)) {
      throw new Error(`Sample file has no rows array: ${dataset.fallbackSampleFile}`);
    }
  }
}

console.log(`Preflight OK: ${catalog.length} catalog entries validated.`);
