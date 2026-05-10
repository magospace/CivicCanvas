#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const jsonMode = process.argv.includes("--json");

function readJson(pathFromRoot) {
  return JSON.parse(readFileSync(join(root, pathFromRoot), "utf8"));
}

const catalog = readJson("data/catalog/approved-datasets.json");
const prompts = readJson("data/prompt-examples.json");
const promptByDataset = new Map(prompts.map((example) => [example.datasetId, example]));

const supportedDatasetIds = [
  "dallas_311_requests",
  "austin_building_permits",
  "houston_transportation_incidents"
];

function classifyDataset(dataset) {
  const verification = dataset.liveVerification;
  const hiddenFields = dataset.fields
    .filter((field) => field.classification === "sensitive_hide" || field.classification === "unknown_review")
    .map((field) => field.name);
  const sampleFile = dataset.fallbackSampleFile ?? null;
  const sampleExists = sampleFile ? existsSync(join(root, "data/samples", sampleFile)) : false;
  const prompt = promptByDataset.get(dataset.id);
  const fallbackStatus = dataset.liveAvailable
    ? "live-capable for approved aggregate fields; fallback remains available"
    : sampleFile
      ? "deterministic sample fallback"
      : "metadata only / not query-ready";

  return {
    datasetId: dataset.id,
    title: dataset.title,
    city: dataset.city,
    sourceName: dataset.sourceName,
    sourceUrl: dataset.sourceUrl,
    externalDatasetId: dataset.externalDatasetId ?? null,
    liveAvailable: Boolean(dataset.liveAvailable),
    livePromotionStatus: verification?.promotionStatus ?? "not verified",
    liveCapableFields: verification?.liveCapableFields ?? [],
    sampleOnlyFields: verification?.sampleOnlyFields ?? [],
    hiddenOrReviewFields: hiddenFields,
    fallbackSampleFile: sampleFile,
    fallbackSampleExists: sampleExists,
    supportedPrompt: prompt?.prompt ?? null,
    promptDataModeNote: prompt?.dataModeNote ?? null,
    dataRealismClassification: sampleFile
      ? "fixture/catalog through data loader + deterministic fallback / acceptable when labeled"
      : "catalog metadata only / do not imply query readiness",
    fallbackStatus
  };
}

const supported = supportedDatasetIds.map((datasetId) => {
  const dataset = catalog.find((candidate) => candidate.id === datasetId);
  if (!dataset) {
    throw new Error(`Missing supported dataset in catalog: ${datasetId}`);
  }
  return classifyDataset(dataset);
});

const unsupported = catalog
  .filter((dataset) => !supportedDatasetIds.includes(dataset.id))
  .map(classifyDataset);

const missingPrompt = supported.filter((dataset) => !dataset.supportedPrompt);
const missingSample = supported.filter((dataset) => dataset.fallbackSampleFile && !dataset.fallbackSampleExists);

const summary = {
  checkedAt: new Date().toISOString(),
  networkCallsMade: 0,
  supported,
  unsupported,
  issues: [
    ...missingPrompt.map((dataset) => `${dataset.datasetId} is missing a supported prompt example.`),
    ...missingSample.map((dataset) => `${dataset.datasetId} fallback sample file is missing: ${dataset.fallbackSampleFile}`)
  ]
};

if (jsonMode) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log("CivicCanvas source provenance summary");
  console.log("Network calls made: 0 (catalog/sample files only)");
  console.log("");
  for (const dataset of supported) {
    console.log(`${dataset.city}: ${dataset.title}`);
    console.log(`- Source: ${dataset.sourceName} (${dataset.sourceUrl})`);
    console.log(`- External ID: ${dataset.externalDatasetId ?? "none"}`);
    console.log(`- Prompt: ${dataset.supportedPrompt}`);
    console.log(`- Mode note: ${dataset.promptDataModeNote}`);
    console.log(`- Live status: ${dataset.livePromotionStatus}; liveAvailable=${dataset.liveAvailable}`);
    console.log(`- Fallback: ${dataset.fallbackStatus}; sample=${dataset.fallbackSampleFile ?? "none"}; exists=${dataset.fallbackSampleExists}`);
    console.log(`- Live-capable fields: ${dataset.liveCapableFields.join(", ") || "none"}`);
    console.log(`- Sample-only fields: ${dataset.sampleOnlyFields.join(", ") || "none"}`);
    console.log(`- Hidden/review fields: ${dataset.hiddenOrReviewFields.join(", ") || "none"}`);
    console.log(`- Classification: ${dataset.dataRealismClassification}`);
    console.log("");
  }

  if (unsupported.length > 0) {
    console.log("Catalog metadata not wired to Explore prompts yet:");
    for (const dataset of unsupported) {
      console.log(`- ${dataset.datasetId}: ${dataset.title} (${dataset.fallbackStatus})`);
    }
    console.log("");
  }

  if (summary.issues.length === 0) {
    console.log("Issues: 0");
  } else {
    console.log("Issues:");
    for (const issue of summary.issues) {
      console.log(`- ${issue}`);
    }
  }
}

if (summary.issues.length > 0) {
  process.exit(1);
}
