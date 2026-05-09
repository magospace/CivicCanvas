import { readFileSync } from "node:fs";
import { join } from "node:path";

const catalog = JSON.parse(readFileSync(join(process.cwd(), "data/catalog/approved-datasets.json"), "utf8"));
const liveDatasets = catalog.filter((dataset) => dataset.liveAvailable && dataset.adapter === "socrata");

if (liveDatasets.length === 0) {
  console.log("Live smoke skipped: no catalog entries have liveAvailable=true.");
  process.exit(0);
}

for (const dataset of liveDatasets) {
  const groupField = ["category", "permit_type", "status", "month"].find((field) => dataset.liveFieldMap?.[field]);
  const dateField = ["created_date", "issued_date"].find((field) => dataset.liveFieldMap?.[field]);

  if (!groupField || !dateField || !dataset.externalDatasetId || !dataset.apiBaseUrl) {
    console.log(`Live smoke skipped for ${dataset.id}: missing safe field mapping.`);
    continue;
  }

  const groupExpression = dataset.liveFieldMap[groupField];
  const dateExpression = dataset.liveFieldMap[dateField];
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(groupExpression) || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(dateExpression)) {
    console.log(`Live smoke skipped for ${dataset.id}: selected mapping is not a direct identifier.`);
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
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Live smoke failed for ${dataset.id}: HTTP ${response.status}`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) {
    throw new Error(`Live smoke failed for ${dataset.id}: response was not an array.`);
  }

  console.log(`Live smoke OK for ${dataset.id}: ${rows.length} aggregate rows from ${dataset.externalDatasetId}.`);
}
