import { readFileSync } from "node:fs";
import { join } from "node:path";

const jsonMode = process.argv.includes("--json");
const root = process.cwd();

function readJson(path) {
  return JSON.parse(readFileSync(join(root, path), "utf8"));
}

function fileExists(path) {
  try {
    readFileSync(join(root, path), "utf8");
    return true;
  } catch {
    return false;
  }
}

function readText(path) {
  return readFileSync(join(root, path), "utf8");
}

const componentScanTargets = [
  "apps/web/components/app-shell.tsx",
  "apps/web/components/gallery-canvas-list.tsx",
  "apps/web/components/saved-canvases.tsx",
  "apps/web/components/sources-catalog.tsx",
  "apps/web/components/header.tsx"
];

const demoArrayPatterns = [
  { surface: "promptExamples", pattern: /const\s+promptExamples\s*=\s*\[/ },
  { surface: "sampleCanvases", pattern: /const\s+\w*(?:Sample|Demo|Gallery|Canvas)\w*\s*=\s*\[/ },
  { surface: "seedRecords", pattern: /const\s+\w*(?:Seed|Fixture)\w*\s*=\s*\[/ }
];

function scanComponentDemoArrays() {
  const scans = componentScanTargets.map((path) => {
    const text = readText(path);
    const findings = demoArrayPatterns
      .filter((item) => item.pattern.test(text))
      .map((item) => item.surface);
    const staticNavigationConfig = path.endsWith("header.tsx") && /const\s+navItems\s*=\s*\[/.test(text);

    return {
      path,
      scanned: true,
      findings,
      staticNavigationConfig,
      acceptable: findings.length === 0 && (path.endsWith("header.tsx") ? staticNavigationConfig : true)
    };
  });

  return {
    scannedPaths: scans.map((scan) => scan.path),
    scans,
    hardcodedUiDemoArrays: scans.flatMap((scan) =>
      scan.findings.map((surface) => ({ surface, path: scan.path }))
    ),
    staticConfigAllowlist: scans
      .filter((scan) => scan.staticNavigationConfig)
      .map((scan) => ({ surface: "headerNavItems", path: scan.path, classification: "static_ui_navigation_config" }))
  };
}

const catalog = readJson("data/catalog/approved-datasets.json");
const seedCanvases = readJson("data/seed-canvases.json");
const galleryFiles = [
  "dallas-311-sample.canvas.json",
  "austin-permits-sample.canvas.json",
  "houston-transportation-sample.canvas.json",
  "unsupported-sensitive-prompt.canvas.json"
];
const sampleDatasets = catalog.filter((dataset) => dataset.fallbackSampleFile);
const promptExamples = readJson("data/prompt-examples.json");
const samples = sampleDatasets.map((dataset) => {
  const sample = readJson(`data/samples/${dataset.fallbackSampleFile}`);
  return {
    datasetId: dataset.id,
    file: `data/samples/${dataset.fallbackSampleFile}`,
    rowCount: Array.isArray(sample.rows) ? sample.rows.length : 0,
    classification: "fixture_file_through_data_loader",
    acceptable: sample.datasetId === dataset.id && Array.isArray(sample.rows)
  };
});
const gallery = galleryFiles.map((file) => ({
  file: `data/gallery/${file}`,
  present: fileExists(`data/gallery/${file}`),
  classification: "fixture_file_through_data_loader"
}));

const classifications = [
  {
    surface: "catalog",
    classification: "fixture_file_through_data_loader",
    acceptable: Array.isArray(catalog) && catalog.length > 0,
    path: "data/catalog/approved-datasets.json",
    note: "Approved static governance metadata loaded by apps/web/lib/data.ts."
  },
  {
    surface: "sampleRows",
    classification: "fixture_file_through_data_loader",
    acceptable: samples.every((sample) => sample.acceptable),
    path: "data/samples/*.sample.json",
    note: "Synthetic/schema-aligned fallback rows loaded through catalog/data-loader paths, not imported by UI components.",
    rows: samples
  },
  {
    surface: "galleryCanvases",
    classification: "fixture_file_through_data_loader",
    acceptable: gallery.every((item) => item.present),
    path: "data/gallery/*.canvas.json",
    note: "Curated CanvasDocument fixtures read through getCuratedGalleryCanvases and rendered by trusted canvas blocks.",
    fixtures: gallery
  },
  {
    surface: "seedCanvasFixtures",
    classification: "fixture_file_through_data_loader",
    acceptable: Array.isArray(seedCanvases) && seedCanvases.length > 0 && seedCanvases.every((seed) => seed.id && seed.prompt),
    path: "data/seed-canvases.json",
    note: "Known seed canvas IDs/prompts are fixture-backed and loaded by getSeedCanvasPrompt; route is still not database persistence."
  },
  {
    surface: "promptExamples",
    classification: "fixture_file_through_data_loader",
    acceptable: Array.isArray(promptExamples) && promptExamples.length > 0 && promptExamples.every((example) => example.label && example.prompt && example.datasetId),
    path: "data/prompt-examples.json",
    note: "Explore prompt chips and deterministic/OpenAI fallback suggestions share validated fixture-backed examples loaded through the app data layer."
  },
  {
    surface: "savedCanvases",
    classification: "browser_local_persistence",
    acceptable: true,
    path: "apps/web/lib/saved-canvases.ts",
    note: "Saved canvases are editable browser-local records through normal localStorage flows; no backend persistence is claimed."
  },
  {
    surface: "openAIProvider",
    classification: "deterministic_fallback_provider_gated",
    acceptable: true,
    path: "apps/web/lib/openai-provider.ts",
    note: "Optional server-side OpenAI assist is disabled without a key, schema-validated, and never a dashboard/code/SQL authority. Env values are not inspected or printed."
  },
  {
    surface: "falMediaProof",
    classification: "provider_gated_script_only",
    acceptable: true,
    path: "scripts/fal-media-smoke.mjs",
    note: "Fal media proof is optional script-level proof only; normal dashboard generation does not produce image/video media artifacts. Env values are not inspected or printed."
  }
];

const componentDemoArrayScan = scanComponentDemoArrays();

const remainingHardcodedReview = [
  ...componentDemoArrayScan.staticConfigAllowlist.map((item) => ({
    surface: item.surface,
    classification: item.classification,
    acceptableForNow: true,
    path: item.path,
    note: "Route navigation config is intentionally static UI configuration, not demo data."
  })),
  ...componentDemoArrayScan.hardcodedUiDemoArrays.map((item) => ({
    surface: item.surface,
    classification: "hardcoded_ui_mock_should_replace",
    acceptableForNow: false,
    path: item.path,
    note: "Potential component-local demo records should move to fixture/data-loader/API/read-model paths before being treated as real demo data."
  }))
];

const output = {
  schemaVersion: "1.0",
  ok: classifications.every((item) => item.acceptable) && componentDemoArrayScan.hardcodedUiDemoArrays.length === 0,
  checkedAt: new Date().toISOString(),
  network: "not_used",
  mutatesFiles: false,
  secretsInspected: false,
  summary: {
    catalogDatasets: catalog.length,
    sampleDatasets: samples.length,
    totalSampleRows: samples.reduce((sum, sample) => sum + sample.rowCount, 0),
    galleryFixtures: gallery.length,
    seedCanvasRecords: Array.isArray(seedCanvases) ? seedCanvases.length : 0,
    promptExampleRecords: Array.isArray(promptExamples) ? promptExamples.length : 0,
    componentPathsScanned: componentDemoArrayScan.scannedPaths.length,
    hardcodedUiDemoArrayFindings: componentDemoArrayScan.hardcodedUiDemoArrays.length,
    remainingHardcodedReviewCount: remainingHardcodedReview.length
  },
  classifications,
  componentDemoArrayScan,
  remainingHardcodedReview,
  validation: {
    noNetwork: true,
    noMutation: true,
    noEnvValuesReadOrPrinted: true,
    command: "pnpm data:realism:json"
  }
};

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Data realism audit ${output.ok ? "OK" : "FAILED"}: ${output.summary.catalogDatasets} catalog datasets, ${output.summary.totalSampleRows} sample rows, ${output.summary.seedCanvasRecords} seed fixtures.`);
  console.log("No network used; no files mutated; env values were not inspected or printed.");
  for (const item of classifications) {
    console.log(`- ${item.surface}: ${item.classification} (${item.acceptable ? "acceptable" : "needs attention"})`);
  }
  if (remainingHardcodedReview.length > 0) {
    console.log("Remaining hardcoded review items:");
    for (const item of remainingHardcodedReview) {
      console.log(`- ${item.surface}: ${item.classification} at ${item.path}`);
    }
  }
}

if (!output.ok) {
  process.exitCode = 1;
}
