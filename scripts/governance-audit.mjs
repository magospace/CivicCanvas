import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { readReleaseMetadata } from "./lib/release-metadata.mjs";

const root = process.cwd();
const args = process.argv.slice(2);
const jsonMode = args.includes("--json");
const extraCanvasPaths = [];

for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--extra-canvas" && args[index + 1]) {
    extraCanvasPaths.push(args[index + 1]);
    index += 1;
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function collectHiddenFields(catalog) {
  return catalog.flatMap((dataset) =>
    (dataset.fields ?? [])
      .filter((field) => field.classification === "sensitive_hide" || field.classification === "unknown_review")
      .map((field) => field.name)
  );
}

function objectContainsKeyOrValue(value, hiddenField) {
  if (Array.isArray(value)) {
    return value.some((item) => objectContainsKeyOrValue(item, hiddenField));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, item]) =>
      key === hiddenField || objectContainsKeyOrValue(item, hiddenField)
    );
  }
  return typeof value === "string" && value.includes(hiddenField);
}

function parseGovernanceLimits() {
  const source = readFileSync(join(root, "packages/shared/src/constants.ts"), "utf8");
  const limitNames = ["maxRawRows", "maxAggregateRows", "maxSampleRows", "maxDashboardBlocks"];

  return Object.fromEntries(limitNames.map((name) => {
    const match = source.match(new RegExp(`${name}:\\s*(\\d+)`));
    if (!match) {
      throw new Error(`Could not read governance limit ${name}`);
    }
    return [name, Number(match[1])];
  }));
}

function check(name, detail, fn) {
  try {
    const result = fn();
    return {
      name,
      ok: true,
      detail: typeof result === "string" ? result : detail
    };
  } catch (error) {
    return {
      name,
      ok: false,
      detail: error instanceof Error ? error.message : String(error)
    };
  }
}

const catalogPath = join(root, "data/catalog/approved-datasets.json");
const catalog = readJson(catalogPath);
const releaseMetadata = readReleaseMetadata(root);
const hiddenFields = collectHiddenFields(catalog);
const galleryDir = join(root, "data/gallery");
const galleryCanvasPaths = readdirSync(galleryDir)
  .filter((file) => file.endsWith(".canvas.json"))
  .sort()
  .map((file) => join(galleryDir, file));
const checkedCanvasPaths = [...galleryCanvasPaths, ...extraCanvasPaths];

const checks = [
  check(
    "live datasets keep fallback samples",
    "Every live-enabled catalog entry has a fallback sample file.",
    () => {
      for (const dataset of catalog.filter((entry) => entry.liveAvailable)) {
        if (!dataset.fallbackSampleFile) {
          throw new Error(`${dataset.id} is live-enabled but has no fallbackSampleFile`);
        }
        const samplePath = join(root, "data/samples", dataset.fallbackSampleFile);
        if (!existsSync(samplePath)) {
          throw new Error(`${dataset.id} fallback sample is missing: ${dataset.fallbackSampleFile}`);
        }
      }
      return `${catalog.filter((entry) => entry.liveAvailable).length} live-enabled dataset(s) checked.`;
    }
  ),
  check(
    "gallery and generated fixtures require SourceMethodBlock",
    "All checked canvas JSON files include SourceMethodBlock.",
    () => {
      for (const path of checkedCanvasPaths) {
        const canvas = readJson(path);
        if (!Array.isArray(canvas.blocks) || !canvas.blocks.some((block) => block.type === "SourceMethodBlock")) {
          throw new Error(`${relative(root, path)} is missing SourceMethodBlock`);
        }
      }
      return `${checkedCanvasPaths.length} canvas JSON file(s) checked.`;
    }
  ),
  check(
    "hidden fields stay out of canvas/export fixtures",
    "Hidden catalog field identifiers do not appear in gallery, export, or extra canvas fixtures.",
    () => {
      for (const path of checkedCanvasPaths) {
        const canvas = readJson(path);
        for (const hiddenField of hiddenFields) {
          if (objectContainsKeyOrValue(canvas, hiddenField)) {
            throw new Error(`${relative(root, path)} contains hidden field identifier ${hiddenField}`);
          }
        }
      }
      return `${hiddenFields.length} hidden field identifier(s) checked across ${checkedCanvasPaths.length} canvas file(s).`;
    }
  ),
  check(
    "sample row keys exclude hidden fields",
    "Fallback sample row objects do not include hidden catalog fields.",
    () => {
      for (const dataset of catalog.filter((entry) => entry.fallbackSampleFile)) {
        const sample = readJson(join(root, "data/samples", dataset.fallbackSampleFile));
        const rows = Array.isArray(sample.rows) ? sample.rows : [];
        for (const row of rows) {
          for (const hiddenField of hiddenFields) {
            if (Object.prototype.hasOwnProperty.call(row, hiddenField)) {
              throw new Error(`${dataset.id} sample row includes hidden field ${hiddenField}`);
            }
          }
        }
      }
      return `${catalog.filter((entry) => entry.fallbackSampleFile).length} sample file(s) checked.`;
    }
  ),
  check(
    "catalog datasets include source caveats",
    "Every approved catalog dataset includes at least one public-data caveat.",
    () => {
      for (const dataset of catalog) {
        if (!Array.isArray(dataset.caveats) || dataset.caveats.length === 0) {
          throw new Error(`${dataset.id} has no caveats`);
        }
      }
      return `${catalog.length} catalog dataset(s) checked.`;
    }
  ),
  check(
    "sample files match catalog dataset IDs",
    "Every fallback sample file declares the same datasetId as the catalog entry.",
    () => {
      for (const dataset of catalog.filter((entry) => entry.fallbackSampleFile)) {
        const sample = readJson(join(root, "data/samples", dataset.fallbackSampleFile));
        if (sample.datasetId !== dataset.id) {
          throw new Error(`${dataset.fallbackSampleFile} declares ${sample.datasetId}, expected ${dataset.id}`);
        }
      }
      return `${catalog.filter((entry) => entry.fallbackSampleFile).length} sample file(s) checked.`;
    }
  ),
  check(
    "gallery canvas sources reference approved catalog datasets",
    "Gallery sources either reference an approved dataset or the catalog suggestion fixture.",
    () => {
      const approvedIds = new Set(catalog.map((dataset) => dataset.id));
      approvedIds.add("catalog_suggestions");
      for (const path of checkedCanvasPaths) {
        const canvas = readJson(path);
        for (const source of canvas.sources ?? []) {
          if (source.datasetId && !approvedIds.has(source.datasetId)) {
            throw new Error(`${relative(root, path)} references unapproved source dataset ${source.datasetId}`);
          }
        }
      }
      return `${checkedCanvasPaths.length} canvas source list(s) checked.`;
    }
  ),
  check(
    "source method blocks include caveats",
    "Every SourceMethodBlock checked by the audit includes non-empty caveats.",
    () => {
      for (const path of checkedCanvasPaths) {
        const canvas = readJson(path);
        const sourceBlock = canvas.blocks?.find((block) => block.type === "SourceMethodBlock");
        const caveats = sourceBlock?.props?.attribution?.caveats ?? sourceBlock?.props?.caveats ?? [];
        if (!Array.isArray(caveats) || caveats.length === 0) {
          throw new Error(`${relative(root, path)} SourceMethodBlock has no caveats`);
        }
      }
      return `${checkedCanvasPaths.length} SourceMethodBlock caveat set(s) checked.`;
    }
  ),
  check(
    "governance limits match documentation",
    "DATA_GOVERNANCE.md records the code governance limits.",
    () => {
      const limits = parseGovernanceLimits();
      const docs = readFileSync(join(root, "docs/DATA_GOVERNANCE.md"), "utf8");
      const expectedLines = [
        `Max raw rows: ${limits.maxRawRows}`,
        `Max aggregate rows: ${limits.maxAggregateRows}`,
        `Max sample rows: ${limits.maxSampleRows}`,
        `Max dashboard blocks generated by one prompt: ${limits.maxDashboardBlocks}`
      ];
      for (const line of expectedLines) {
        if (!docs.includes(line)) {
          throw new Error(`docs/DATA_GOVERNANCE.md is missing "${line}"`);
        }
      }
      return expectedLines.join("; ");
    }
  ),
  check(
    "package versions match release metadata",
    "Workspace package versions match the active release package version.",
    () => {
      const packagePaths = [
        "package.json",
        "apps/web/package.json",
        "apps/mcp-server/package.json",
        "packages/shared/package.json"
      ];
      for (const packagePath of packagePaths) {
        const packageJson = readJson(join(root, packagePath));
        if (packageJson.version !== releaseMetadata.packageVersion) {
          throw new Error(`${packagePath} version ${packageJson.version} does not match ${releaseMetadata.packageVersion}`);
        }
      }
      return `${packagePaths.length} package.json file(s) checked.`;
    }
  ),
  check(
    "app and MCP consume shared release metadata",
    "Health and MCP status use @texas-data-canvas/shared release metadata.",
    () => {
      const files = [
        "apps/web/app/api/health/route.ts",
        "apps/mcp-server/src/tools.ts"
      ];
      for (const file of files) {
        const source = readFileSync(join(root, file), "utf8");
        if (!source.includes("releaseMetadata")) {
          throw new Error(`${file} does not consume releaseMetadata`);
        }
      }
      return files.join(", ");
    }
  ),
  check(
    "release docs reference active version",
    "README, PLAN, implementation status, release notes, and active plan reference the active release.",
    () => {
      const files = [
        "README.md",
        "PLAN.md",
        "docs/IMPLEMENTATION_STATUS.md",
        "docs/RELEASE_NOTES.md",
        "docs/V1_3_HOSTED_LAUNCH_READINESS_PLAN.md",
        "docs/release-evidence.json"
      ];
      for (const file of files) {
        const source = readFileSync(join(root, file), "utf8");
        if (!source.includes(releaseMetadata.releaseVersion)) {
          throw new Error(`${file} does not mention ${releaseMetadata.releaseVersion}`);
        }
      }
      return files.join(", ");
    }
  )
];

const failed = checks.filter((item) => !item.ok);
const output = {
  schemaVersion: "1.0",
  checkedAt: new Date().toISOString(),
  ok: failed.length === 0,
  releaseVersion: releaseMetadata.releaseVersion,
  releaseChannel: releaseMetadata.releaseChannel,
  summary: {
    total: checks.length,
    passed: checks.length - failed.length,
    failed: failed.length
  },
  checks
};

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`${output.ok ? "Governance audit OK" : "Governance audit FAILED"}: ${output.summary.passed}/${output.summary.total} checks passed for ${output.releaseVersion}.`);
  for (const item of checks) {
    console.log(`- ${item.ok ? "PASS" : "FAIL"} ${item.name}: ${item.detail}`);
  }
}

if (!output.ok) {
  process.exitCode = 1;
}
