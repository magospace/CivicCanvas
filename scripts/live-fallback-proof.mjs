import { readFileSync } from "node:fs";
import { join } from "node:path";

const jsonMode = process.argv.includes("--json");
const catalog = JSON.parse(readFileSync(join(process.cwd(), "data/catalog/approved-datasets.json"), "utf8"));

function dataset(id) {
  const found = catalog.find((candidate) => candidate.id === id);
  if (!found) {
    throw new Error(`Missing dataset ${id}`);
  }
  return found;
}

function proofRow({ id, prompt, requestedMode, renderedMode, liveProof, fallbackReason, hiddenBoundary }) {
  const source = dataset(id);
  return {
    datasetId: id,
    title: source.title,
    prompt,
    requestedMode,
    renderedMode,
    liveAvailable: source.liveAvailable,
    promotionStatus: source.liveVerification?.promotionStatus ?? null,
    liveMappedFields: Object.keys(source.liveFieldMap ?? {}).sort(),
    sampleOnlyFields: source.liveVerification?.sampleOnlyFields ?? [],
    hiddenFields: source.fields.filter((field) => field.classification === "sensitive_hide").map((field) => field.name),
    liveProof,
    fallbackReason,
    hiddenBoundary
  };
}

const rows = [
  proofRow({
    id: "dallas_311_requests",
    prompt: "Show Dallas 311 service requests by category and ZIP code for 2024.",
    requestedMode: "auto_or_live",
    renderedMode: "fallback_for_zip_dashboard",
    liveProof: "Dallas has verified Socrata live mappings for narrow non-ZIP aggregate fields such as category/status/created_date, but not for the ZIP dashboard.",
    fallbackReason: "Core demo requires zip_code; catalog liveFieldMap does not expose zip_code and marks it sample-only.",
    hiddenBoundary: "No sensitive hidden field is promoted; ZIP appears only from approved sample fallback for this dashboard."
  }),
  proofRow({
    id: "austin_building_permits",
    prompt: "Show Austin building permits by month and ZIP code for 2024.",
    requestedMode: "auto_or_live",
    renderedMode: "sample_or_fallback",
    liveProof: "No promoted live dashboard path; source-owned month grouping remains blocked.",
    fallbackReason: "Catalog marks Austin liveAvailable=false and month as sample-only.",
    hiddenBoundary: "No hidden fields are used in the core demo."
  }),
  proofRow({
    id: "houston_transportation_incidents",
    prompt: "Show Houston transportation incidents by ZIP and incident type for 2024.",
    requestedMode: "auto_or_live",
    renderedMode: "sample_first",
    liveProof: "No promoted live dashboard path; Houston remains sample-first until feed access and aggregate-safe mappings are approved.",
    fallbackReason: "Catalog marks Houston liveAvailable=false and promotionStatus=sample_first.",
    hiddenBoundary: "precise_address is sensitive_hide and must stay out of queries, dashboards, exports, saved bundles, and Miro specs."
  })
];

const checks = [
  {
    name: "Dallas live proof is narrow and ZIP fallback remains required",
    ok: rows[0].liveAvailable === true && rows[0].liveMappedFields.includes("category") && !rows[0].liveMappedFields.includes("zip_code") && rows[0].sampleOnlyFields.includes("zip_code")
  },
  {
    name: "Austin core demo is not promoted as live",
    ok: rows[1].liveAvailable === false && rows[1].sampleOnlyFields.includes("month")
  },
  {
    name: "Houston core demo is sample-first with precise address hidden",
    ok: rows[2].liveAvailable === false && rows[2].promotionStatus === "sample_first" && rows[2].hiddenFields.includes("precise_address")
  }
];

const output = {
  schemaVersion: "1.0",
  ok: checks.every((check) => check.ok),
  generatedAt: new Date().toISOString(),
  network: "not_used",
  note: "This proof is catalog-driven and no-network. Use pnpm smoke:live:json separately for optional live public API smoke checks.",
  rows,
  checks
};

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Live/fallback proof ${output.ok ? "OK" : "FAILED"}: ${checks.filter((check) => check.ok).length}/${checks.length} checks passed.`);
  for (const row of rows) {
    console.log(`- ${row.datasetId}: ${row.renderedMode}. ${row.fallbackReason}`);
  }
}

if (!output.ok) {
  process.exitCode = 1;
}
