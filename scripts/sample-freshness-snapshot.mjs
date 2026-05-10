import { readFileSync } from "node:fs";
import { join } from "node:path";

const jsonMode = process.argv.includes("--json");
const root = process.cwd();

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function dateRangeForRows(rows, dateFields) {
  const values = dateFields
    .flatMap((field) => rows.map((row) => row[field]).filter((value) => typeof value === "string" && value.length > 0))
    .sort();
  return values.length > 0 ? { min: values[0], max: values[values.length - 1] } : null;
}

const catalog = readJson("data/catalog/approved-datasets.json");
const sampleDatasets = catalog.filter((dataset) => dataset.fallbackSampleFile);
const samples = sampleDatasets.map((dataset) => {
  const sample = readJson(`data/samples/${dataset.fallbackSampleFile}`);
  const rows = Array.isArray(sample.rows) ? sample.rows : [];
  const dateFields = dataset.fields.filter((field) => field.type === "date").map((field) => field.name);
  const hiddenFields = dataset.fields
    .filter((field) => field.classification === "sensitive_hide")
    .map((field) => field.name);
  const hiddenFieldsPresent = hiddenFields.filter((field) =>
    rows.some((row) => Object.prototype.hasOwnProperty.call(row, field))
  );

  return {
    datasetId: dataset.id,
    title: dataset.title,
    sampleFile: dataset.fallbackSampleFile,
    sampleDatasetId: sample.datasetId,
    rowCount: rows.length,
    dateFields,
    dateRange: dateRangeForRows(rows, dateFields),
    distinctMonths: new Set(
      dateFields.flatMap((field) =>
        rows.map((row) => (typeof row[field] === "string" ? row[field].slice(0, 7) : null)).filter(Boolean)
      )
    ).size,
    liveAvailable: dataset.liveAvailable,
    promotionStatus: dataset.liveVerification?.promotionStatus ?? null,
    sampleOnlyFields: dataset.liveVerification?.sampleOnlyFields ?? [],
    hiddenFieldsChecked: hiddenFields,
    hiddenFieldsAbsent: hiddenFieldsPresent.length === 0,
    sourceFreshnessClaim: "synthetic_schema_aligned_sample_not_source_owned_live_freshness"
  };
});

const output = {
  schemaVersion: "1.0",
  ok: samples.every((sample) => sample.hiddenFieldsAbsent && sample.sampleDatasetId === sample.datasetId),
  checkedAt: new Date().toISOString(),
  network: "not_used",
  mutatesFiles: false,
  sourceFreshnessChecklist: "docs/SOURCE_FRESHNESS_CHECKLIST.md",
  note: "This snapshot summarizes checked-in synthetic/schema-aligned fallback samples. It does not prove source-owned live freshness.",
  summary: {
    datasetCount: samples.length,
    totalRows: samples.reduce((sum, sample) => sum + sample.rowCount, 0),
    hiddenFieldDatasets: samples.filter((sample) => sample.hiddenFieldsChecked.length > 0).map((sample) => sample.datasetId)
  },
  samples
};

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Sample freshness snapshot ${output.ok ? "OK" : "FAILED"}: ${output.summary.datasetCount} samples, ${output.summary.totalRows} rows.`);
  console.log("No network used; this does not claim source-owned live freshness.");
  for (const sample of samples) {
    const range = sample.dateRange ? `${sample.dateRange.min} to ${sample.dateRange.max}` : "no date field";
    console.log(`- ${sample.datasetId}: ${sample.rowCount} rows, ${range}, hidden absent=${sample.hiddenFieldsAbsent}`);
  }
}

if (!output.ok) {
  process.exitCode = 1;
}
