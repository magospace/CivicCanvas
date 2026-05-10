import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const jsonMode = process.argv.includes("--json");

const currentDocs = [
  "README.md",
  "CODEBASE_OVERVIEW.md",
  "ARCHITECTURE_MAP.md",
  "DEVELOPMENT_GUIDE.md",
  "docs/README.md"
];

const expectedCurrentLinks = [
  "../README.md",
  "../CODEBASE_OVERVIEW.md",
  "../ARCHITECTURE_MAP.md",
  "../DEVELOPMENT_GUIDE.md",
  "../AGENTS.md",
  "../GOVERNANCE_NOTE.md",
  "../SECURITY.md"
];

const historicalDocs = [
  "docs/PRD.md",
  "docs/MVP_BUILD_BRIEF.md",
  "docs/AGENT_DEVELOPMENT_PLAN.md",
  "docs/REPO_STRUCTURE.md",
  "docs/SECURITY_GOVERNANCE_REVIEW.md",
  "docs/CODEX_PROMPTS.md",
  "docs/REFERENCES.md",
  "docs/HOUSTON_TRANSTAR_ACCESS_PACKET.md",
  "docs/V0_4_PRODUCTION_PILOT_PLAN.md",
  "docs/V0_5_PUBLIC_BETA_PLAN.md",
  "docs/V0_6_HOSTED_BETA_PLAN.md",
  "docs/V0_8_PRODUCT_READINESS_PLAN.md",
  "docs/V0_9_PUBLIC_RELIABILITY_PLAN.md",
  "docs/V1_PUBLIC_PILOT_PLAN.md",
  "docs/V1_1_PRODUCT_DEPTH_PLAN.md",
  "docs/V1_2_HOSTED_TRUST_PLAN.md"
];

function fileExists(path) {
  return existsSync(join(root, path));
}

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function check(name, ok, detail) {
  return { name, status: ok ? "passed" : "failed", detail };
}

const docsIndex = read("docs/README.md");
const readme = read("README.md");
const developmentGuide = read("DEVELOPMENT_GUIDE.md");
const codebaseOverview = read("CODEBASE_OVERVIEW.md");
const hostedSmokeTemplate = read("docs/HOSTED_SMOKE_TEMPLATE.md");

const missingCurrentDocs = currentDocs.filter((path) => !fileExists(path));
const missingHistoricalDocs = historicalDocs.filter((path) => !fileExists(path));
const missingCurrentLinks = expectedCurrentLinks.filter((link) => !docsIndex.includes(link));
const historicalSectionPresent = docsIndex.includes("## Historical And Reference Docs") &&
  docsIndex.includes("milestone snapshots rather than the primary current-state docs");
const historicalDocsInStartingPoints = historicalDocs.filter((path) => {
  const basename = path.replace("docs/", "");
  const currentStartingPoints = docsIndex.slice(
    docsIndex.indexOf("## Current Starting Points"),
    docsIndex.indexOf("## Current Domain Docs")
  );
  return currentStartingPoints.includes(basename);
});
const rootCurrentDocLinksPresent = [
  "CODEBASE_OVERVIEW.md",
  "ARCHITECTURE_MAP.md",
  "DEVELOPMENT_GUIDE.md",
  "docs/LIVE_FALLBACK_PROOF.md",
  "docs/SAMPLE_AND_PERSISTENCE_REALNESS.md"
].every((link) => readme.includes(link));
const guideAndOverviewWarnHistorical = developmentGuide.includes("Historical milestone docs") &&
  codebaseOverview.includes("Historical docs");
const hostedSmokeTemplateRequiredPhrases = [
  "pnpm smoke:deploy",
  "PLAYWRIGHT_BASE_URL",
  "platform-level firewall/rate limiting",
  "not release evidence",
  "Do not paste secrets"
];
const missingHostedSmokeTemplatePhrases = hostedSmokeTemplateRequiredPhrases.filter((phrase) =>
  !hostedSmokeTemplate.includes(phrase)
);

const checks = [
  check(
    "current docs exist",
    missingCurrentDocs.length === 0,
    missingCurrentDocs.length === 0 ? "All current docs exist." : `Missing current docs: ${missingCurrentDocs.join(", ")}`
  ),
  check(
    "docs index links current starting points",
    missingCurrentLinks.length === 0,
    missingCurrentLinks.length === 0 ? "All expected current starting-point links are present." : `Missing links: ${missingCurrentLinks.join(", ")}`
  ),
  check(
    "historical docs are labeled away from current starting points",
    missingHistoricalDocs.length === 0 && historicalSectionPresent && historicalDocsInStartingPoints.length === 0,
    historicalDocsInStartingPoints.length === 0
      ? "Historical docs are in the historical/reference section and not current starting points."
      : `Historical docs listed as current starting points: ${historicalDocsInStartingPoints.join(", ")}`
  ),
  check(
    "root README points to current developer docs",
    rootCurrentDocLinksPresent,
    rootCurrentDocLinksPresent ? "Root README links current developer docs." : "Root README is missing one or more current developer doc links."
  ),
  check(
    "development guide and codebase overview warn about historical docs",
    guideAndOverviewWarnHistorical,
    guideAndOverviewWarnHistorical ? "Guide and overview warn that milestone docs can be historical." : "Missing historical-doc warning in guide or overview."
  ),
  check(
    "hosted smoke template preserves release and secret caveats",
    missingHostedSmokeTemplatePhrases.length === 0,
    missingHostedSmokeTemplatePhrases.length === 0
      ? "Hosted smoke template includes required smoke commands, platform caveat, no-release-evidence boundary, and secret warning."
      : `Hosted smoke template missing required phrase(s): ${missingHostedSmokeTemplatePhrases.join(", ")}`
  )
];

const output = {
  schemaVersion: "1.0",
  ok: checks.every((item) => item.status === "passed"),
  currentDocs,
  historicalDocs,
  hostedSmokeTemplateRequiredPhrases,
  checks
};

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Docs consistency ${output.ok ? "OK" : "FAILED"}: ${checks.filter((item) => item.status === "passed").length}/${checks.length} checks passed.`);
  for (const item of checks) {
    console.log(`- ${item.status.toUpperCase()} ${item.name}: ${item.detail}`);
  }
}

if (!output.ok) {
  process.exitCode = 1;
}
