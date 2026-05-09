import { readFileSync } from "node:fs";
import { join } from "node:path";

const catalog = JSON.parse(readFileSync(join(process.cwd(), "data/catalog/approved-datasets.json"), "utf8"));
const liveDatasets = catalog.filter((dataset) => dataset.liveAvailable && dataset.adapter === "socrata");
const jsonMode = process.argv.includes("--json");
const checkedAt = new Date().toISOString();
const results = [];

function directIdentifier(value) {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value);
}

function record(result) {
  const normalized = {
    schemaVersion: "1.0",
    checkedAt,
    ...result
  };
  results.push(normalized);
  return normalized;
}

function printHuman(result) {
  if (jsonMode) {
    return;
  }
  const label = result.ok ? "OK" : "FAILED";
  const source = result.externalDatasetId ? ` from ${result.externalDatasetId}` : "";
  const rows = typeof result.rowCount === "number" ? `: ${result.rowCount} aggregate rows` : "";
  console.log(`Live smoke ${label} for ${result.datasetId}${rows}${source}. ${result.reason}`);
}

if (liveDatasets.length === 0) {
  record({
    datasetId: "catalog",
    dataMode: "sample",
    ok: true,
    reason: "Live smoke skipped: no catalog entries have liveAvailable=true."
  });
  if (jsonMode) {
    console.log(JSON.stringify({ results }, null, 2));
  } else {
    console.log(results[0].reason);
  }
  process.exit(0);
}

for (const dataset of liveDatasets) {
  const groupField = ["category", "permit_type", "status", "month"].find((field) => dataset.liveFieldMap?.[field]);
  const dateField = ["created_date", "issued_date"].find((field) => dataset.liveFieldMap?.[field]);

  if (!groupField || !dateField || !dataset.externalDatasetId || !dataset.apiBaseUrl) {
    printHuman(record({
      datasetId: dataset.id,
      externalDatasetId: dataset.externalDatasetId,
      dataMode: "sample",
      ok: true,
      reason: "Skipped: missing safe field mapping."
    }));
    continue;
  }

  const groupExpression = dataset.liveFieldMap[groupField];
  const dateExpression = dataset.liveFieldMap[dateField];
  if (!directIdentifier(groupExpression) || !directIdentifier(dateExpression)) {
    printHuman(record({
      datasetId: dataset.id,
      externalDatasetId: dataset.externalDatasetId,
      dataMode: "sample",
      ok: true,
      reason: "Skipped: selected mapping is not a direct identifier."
    }));
    continue;
  }

  const params = new URLSearchParams({
    "$select": `${groupExpression} as ${groupField}, count(*) as row_count`,
    "$where": `${dateExpression} between '2024-01-01' and '2024-12-31'`,
    "$group": groupExpression,
    "$order": "row_count DESC",
    "$limit": "3"
  });
  const url = `${dataset.apiBaseUrl.replace(/\/$/, "")}/resource/${dataset.externalDatasetId}.json?${params}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const rows = await response.json();
    if (!Array.isArray(rows)) {
      throw new Error("Response was not an array.");
    }

    printHuman(record({
      datasetId: dataset.id,
      externalDatasetId: dataset.externalDatasetId,
      url,
      dataMode: "live",
      ok: true,
      rowCount: rows.length,
      reason: "Live aggregate query returned an array response."
    }));
  } catch (error) {
    printHuman(record({
      datasetId: dataset.id,
      externalDatasetId: dataset.externalDatasetId,
      url,
      dataMode: "fallback",
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown live smoke failure."
    }));
  }
}

if (jsonMode) {
  console.log(JSON.stringify({ results }, null, 2));
}

if (results.some((result) => !result.ok)) {
  process.exit(1);
}
