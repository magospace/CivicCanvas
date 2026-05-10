#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const jsonMode = process.argv.includes("--json");
const root = process.cwd();
const generatedPathPatterns = [
  /^test-results\//,
  /^playwright-report\//,
  /^demo-artifacts\//,
  /^provider-artifacts\//,
  /^\.vercel\/output\//,
  /^apps\/web\/\.next\//,
  /^apps\/mcp-server\/dist\//,
  /^packages\/shared\/dist\//,
  /\.(png|jpe?g|gif|webp|mp4|mov|webm|m4v|mp3|wav)$/i
];
const envPathPatterns = [
  /(^|\/)\.env($|\.)/,
  /(^|\/)\.env\.[^.]*\.local$/,
  /(^|\/)\.env\.local$/
];
const allowedExternalRecommendationFiles = new Set([
  "REVIEW_RECOMMENDATIONS.md",
  "clauderecommends.md"
]);

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`git ${args.join(" ")} failed: ${message}`);
  }
}

function lines(value) {
  return value ? value.split("\n").filter(Boolean) : [];
}

function stagedFiles() {
  return lines(git(["diff", "--cached", "--name-only", "--diff-filter=ACMRT"]));
}

function untrackedFiles() {
  return lines(git(["ls-files", "--others", "--exclude-standard"]));
}

function classifyPath(path) {
  if (allowedExternalRecommendationFiles.has(path)) {
    return "external recommendation / intentionally untracked";
  }
  if (path === ".env.example") {
    return "documented public env example / acceptable";
  }
  if (envPathPatterns.some((pattern) => pattern.test(path))) {
    return "env/secret-like path";
  }
  if (generatedPathPatterns.some((pattern) => pattern.test(path))) {
    return "generated artifact path";
  }
  return "ordinary source/doc path";
}

const staged = stagedFiles();
const untracked = untrackedFiles();
const stagedProblems = staged
  .map((path) => ({ path, classification: classifyPath(path) }))
  .filter((entry) => !["ordinary source/doc path", "external recommendation / intentionally untracked", "documented public env example / acceptable"].includes(entry.classification));
const untrackedGeneratedArtifacts = untracked
  .map((path) => ({ path, classification: classifyPath(path) }))
  .filter((entry) => entry.classification === "generated artifact path" || entry.classification === "env/secret-like path");
const untrackedExternalRecommendations = untracked
  .map((path) => ({ path, classification: classifyPath(path) }))
  .filter((entry) => entry.classification === "external recommendation / intentionally untracked");

const issues = [
  ...stagedProblems.map((entry) => ({ ...entry, reason: "staged forbidden artifact/secret-like path" })),
  ...untrackedGeneratedArtifacts.map((entry) => ({ ...entry, reason: "untracked generated artifact/secret-like path should stay ignored or be removed before handoff" }))
];
const result = {
  ok: issues.length === 0,
  stagedCount: staged.length,
  untrackedExternalRecommendations,
  issueCount: issues.length,
  issues,
  note: "Screenshots, videos, provider artifacts, generated reports/build outputs, and .env files must not be committed. REVIEW_RECOMMENDATIONS.md and clauderecommends.md are classified as external recommendation inputs and left untracked."
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log(`Generated artifact hygiene: ${result.ok ? "OK" : "FAILED"}`);
  console.log(`Staged files checked: ${staged.length}`);
  console.log("Untracked external recommendation files:");
  if (untrackedExternalRecommendations.length === 0) {
    console.log("- none");
  } else {
    for (const entry of untrackedExternalRecommendations) {
      console.log(`- ${entry.path}: ${entry.classification}`);
    }
  }
  if (issues.length === 0) {
    console.log("Issues: 0");
  } else {
    console.log("Issues:");
    for (const issue of issues) {
      console.log(`- ${issue.path}: ${issue.reason} (${issue.classification})`);
    }
  }
}

if (issues.length > 0) {
  process.exit(1);
}
