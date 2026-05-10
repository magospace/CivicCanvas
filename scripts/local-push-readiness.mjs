#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const jsonMode = process.argv.includes("--json");
const root = process.cwd();

function git(args, { allowFailure = false } = {}) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch (error) {
    if (allowFailure) {
      return null;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`git ${args.join(" ")} failed: ${message}`);
  }
}

function lines(value) {
  return value ? value.split("\n").filter(Boolean) : [];
}

const branch = git(["branch", "--show-current"], { allowFailure: true }) ?? "unavailable";
const upstream = git(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"], { allowFailure: true });
const head = git(["rev-parse", "--short=12", "HEAD"], { allowFailure: true }) ?? "unavailable";
const statusShortBranch = git(["status", "--short", "--branch"], { allowFailure: true }) ?? "unavailable";
const untracked = lines(git(["ls-files", "--others", "--exclude-standard"], { allowFailure: true }) ?? "");
const dirtyTracked = lines(git(["status", "--short", "--untracked-files=no"], { allowFailure: true }) ?? "");
const lastCommits = lines(git(["log", "--oneline", "--max-count=5"], { allowFailure: true }) ?? "");
let ahead = null;
let behind = null;
if (upstream) {
  const counts = git(["rev-list", "--left-right", "--count", `${upstream}...HEAD`], { allowFailure: true });
  if (counts) {
    const [behindRaw, aheadRaw] = counts.split(/\s+/).map((value) => Number.parseInt(value, 10));
    behind = Number.isFinite(behindRaw) ? behindRaw : null;
    ahead = Number.isFinite(aheadRaw) ? aheadRaw : null;
  }
}

const result = {
  branch,
  upstream,
  head,
  ahead,
  behind,
  dirtyTracked,
  untracked,
  lastCommits,
  pushAllowed: false,
  reminder: "Local-only guard: do not push unless the user explicitly instructs a push. If git push is blocked, do not bypass it.",
  recommendedBeforePush: [
    "Review untracked external recommendation files before deciding whether to adopt or ignore them.",
    "Run final no-spend validation or confirm the latest recorded validation in HERMES_PROGRESS.md.",
    "Keep deployed URL TODO until the exact public URL passes hosted smoke."
  ]
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("Local push-readiness summary");
  console.log(`Branch: ${branch}`);
  console.log(`HEAD: ${head}`);
  console.log(`Upstream: ${upstream ?? "none"}`);
  if (ahead !== null || behind !== null) {
    console.log(`Ahead/behind: ahead ${ahead ?? "unknown"}, behind ${behind ?? "unknown"}`);
  } else {
    console.log("Ahead/behind: unavailable");
  }
  console.log("Tracked dirty files:");
  if (dirtyTracked.length === 0) {
    console.log("- none");
  } else {
    for (const entry of dirtyTracked) {
      console.log(`- ${entry}`);
    }
  }
  console.log("Untracked files:");
  if (untracked.length === 0) {
    console.log("- none");
  } else {
    for (const entry of untracked) {
      console.log(`- ${entry}`);
    }
  }
  console.log("Recent commits:");
  for (const commit of lastCommits) {
    console.log(`- ${commit}`);
  }
  console.log(`Push allowed by this command: ${result.pushAllowed ? "yes" : "no"}`);
  console.log(result.reminder);
}
