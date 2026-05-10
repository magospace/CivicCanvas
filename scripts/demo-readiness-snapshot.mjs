import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const jsonMode = process.argv.includes("--json");
const root = process.cwd();

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function git(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

function safeCountSampleRows(dataset) {
  if (!dataset.fallbackSampleFile) {
    return null;
  }
  const samplePath = join(root, "data/samples", dataset.fallbackSampleFile);
  if (!existsSync(samplePath)) {
    return null;
  }
  const sample = readJson(samplePath);
  return Array.isArray(sample.rows) ? sample.rows.length : 0;
}

const packageJson = readJson(join(root, "package.json"));
const catalog = readJson(join(root, "data/catalog/approved-datasets.json"));
const releaseEvidencePath = join(root, "docs/release-evidence.json");
const releaseEvidence = existsSync(releaseEvidencePath) ? readJson(releaseEvidencePath) : null;
const headCommit = git(["rev-parse", "HEAD"]);
const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
const statusShort = git(["status", "--short", "--branch"]);

const samples = catalog
  .filter((dataset) => dataset.fallbackSampleFile)
  .map((dataset) => ({
    datasetId: dataset.id,
    title: dataset.title,
    sampleFile: dataset.fallbackSampleFile,
    rowCount: safeCountSampleRows(dataset),
    liveAvailable: dataset.liveAvailable,
    promotionStatus: dataset.liveVerification?.promotionStatus ?? null,
    hiddenFields: dataset.fields
      .filter((field) => field.classification === "sensitive_hide")
      .map((field) => field.name)
  }));

const galleryCanvasCount = readdirSync(join(root, "data/gallery")).filter((file) => file.endsWith(".canvas.json")).length;
const releaseEvidenceCommit = releaseEvidence?.commit ?? releaseEvidence?.git?.commit ?? null;
const releaseEvidenceMatchesHead = Boolean(headCommit && releaseEvidenceCommit && headCommit.startsWith(releaseEvidenceCommit));

const output = {
  schemaVersion: "1.0",
  generatedAt: new Date().toISOString(),
  ok: true,
  network: "not_used",
  mutatesFiles: false,
  repo: {
    branch,
    headCommit,
    statusShort
  },
  package: {
    name: packageJson.name,
    version: packageJson.version,
    packageManager: packageJson.packageManager
  },
  validationBaseline: {
    dailyLocal: ["pnpm lint", "pnpm typecheck", "pnpm test"],
    optionalBrowser: ["pnpm test:e2e"],
    optionalGovernance: ["pnpm governance:audit", "pnpm data:quality"],
    noNetworkProofs: ["pnpm live:fallback-proof:json", "pnpm media:fal:smoke:json"],
    releaseGate: ["pnpm build", "pnpm preflight", "pnpm verify:prod-local", "pnpm release:check"]
  },
  sampleData: {
    datasetCount: samples.length,
    totalSampleRows: samples.reduce((sum, sample) => sum + (sample.rowCount ?? 0), 0),
    galleryCanvasCount,
    samples
  },
  liveFallbackProof: {
    command: "pnpm live:fallback-proof:json",
    network: "not_used",
    doc: "docs/LIVE_FALLBACK_PROOF.md",
    summary: "Dallas has narrow non-ZIP live mappings; Dallas ZIP, Austin monthly, and Houston transportation demo paths remain sample/fallback bounded."
  },
  mediaProof: {
    noSpendCommand: "pnpm media:fal:smoke:json",
    liveGateCommand: "RUN_LIVE_FAL_SMOKE=1 FAL_KEY=<redacted> pnpm media:fal:smoke:json",
    appGeneratesMediaByDefault: false,
    doc: "README.md"
  },
  releaseEvidence: {
    path: "docs/release-evidence.json",
    present: Boolean(releaseEvidence),
    evidenceCommit: releaseEvidenceCommit,
    headCommit,
    matchesHead: releaseEvidenceMatchesHead,
    status: releaseEvidenceMatchesHead ? "current_for_head" : "historical_not_current_head",
    refreshTask: "TASKS.md item 35"
  },
  knownBlockers: [
    "Release evidence remains historical until Task 35 reruns the full release gate for the intended commit.",
    "Public hosted sharing still requires platform-level firewall/rate limiting proof outside this repo.",
    "Normal app dashboard generation does not produce image/video/media artifacts; Fal proof is script-only and env-gated.",
    "Server-side saved-canvas persistence is not implemented by default; browser-local storage and URL-hash share links remain the reliable demo path."
  ]
};

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Demo readiness snapshot OK: ${samples.length} samples, ${output.sampleData.totalSampleRows} rows, ${galleryCanvasCount} gallery canvases.`);
  console.log(`Release evidence: ${output.releaseEvidence.status}.`);
  console.log("No network used and no files mutated.");
}
