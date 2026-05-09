import { readFileSync } from "node:fs";
import { existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const catalog = JSON.parse(readFileSync(join(root, "data/catalog/approved-datasets.json"), "utf8"));

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
    const samplePath = join(root, "data/samples", dataset.fallbackSampleFile);
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
