import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const jsonMode = process.argv.includes("--json");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function countValues(rows, field) {
  const counts = new Map();
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

function qualityForDataset(dataset) {
  const samplePath = join(root, "data/samples", dataset.fallbackSampleFile);
  const sample = readJson(samplePath);
  const rows = Array.isArray(sample.rows) ? sample.rows : [];
  const dateFields = dataset.fields.filter((field) => field.type === "date").map((field) => field.name);
  const dateValues = dateFields
    .flatMap((field) => rows.map((row) => row[field]).filter((value) => typeof value === "string"))
    .sort();
  const categoryField = dataset.fields.find((field) =>
    ["category", "permit_type", "incident_type"].includes(field.name)
  )?.name;
  const expectedZip = dataset.fields.some((field) => field.name === "zip_code");

  return {
    datasetId: dataset.id,
    title: dataset.title,
    sampleFile: dataset.fallbackSampleFile,
    sampleDatasetId: sample.datasetId,
    datasetIdMatches: sample.datasetId === dataset.id,
    rowCount: rows.length,
    dateRange: dateValues.length > 0 ? { min: dateValues[0], max: dateValues[dateValues.length - 1] } : null,
    expectedZip,
    missingZipRows: expectedZip
      ? rows.filter((row) => typeof row.zip_code !== "string" || row.zip_code.length === 0).length
      : 0,
    topCategories: categoryField ? countValues(rows, categoryField) : [],
    topStatuses: countValues(rows, "status")
  };
}

const catalog = readJson(join(root, "data/catalog/approved-datasets.json"));
const datasets = catalog
  .filter((dataset) => dataset.fallbackSampleFile)
  .map(qualityForDataset);
const galleryFiles = readdirSync(join(root, "data/gallery")).filter((file) => file.endsWith(".canvas.json"));
const output = {
  schemaVersion: "1.0",
  checkedAt: new Date().toISOString(),
  ok: datasets.every((dataset) => dataset.datasetIdMatches),
  summary: {
    datasetCount: datasets.length,
    galleryCanvasCount: galleryFiles.length,
    totalSampleRows: datasets.reduce((sum, dataset) => sum + dataset.rowCount, 0),
    missingZipRows: datasets.reduce((sum, dataset) => sum + dataset.missingZipRows, 0)
  },
  datasets
};

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Data quality ${output.ok ? "OK" : "FAILED"}: ${output.summary.datasetCount} samples, ${output.summary.totalSampleRows} rows, ${output.summary.galleryCanvasCount} gallery canvases.`);
  for (const dataset of datasets) {
    const dateRange = dataset.dateRange ? `${dataset.dateRange.min} to ${dataset.dateRange.max}` : "no date field";
    console.log(`- ${dataset.datasetId}: ${dataset.rowCount} rows, ${dateRange}, missing ZIP rows ${dataset.missingZipRows}`);
  }
}

if (!output.ok) {
  process.exitCode = 1;
}
