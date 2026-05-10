import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const jsonMode = process.argv.includes("--json");
const root = process.cwd();
const evidencePath = "docs/release-evidence.json";
const requiredCommands = [
  "pnpm lint",
  "pnpm typecheck",
  "pnpm test",
  "pnpm build",
  "pnpm governance:audit",
  "pnpm data:quality",
  "pnpm verify:prod-local",
  "pnpm release:check"
];

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return null;
  }
}

function readJson(pathFromRoot) {
  return JSON.parse(readFileSync(join(root, pathFromRoot), "utf8"));
}

const evidencePresent = existsSync(join(root, evidencePath));
const evidence = evidencePresent ? readJson(evidencePath) : null;
const headCommit = git(["rev-parse", "HEAD"]);
const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]);
const statusShort = git(["status", "--short", "--branch"]);
const recordedCommit = evidence?.commit ?? evidence?.git?.commit ?? null;
const recordedCommitExists = recordedCommit ? Boolean(git(["cat-file", "-e", `${recordedCommit}^{commit}`])) : false;
const matchesHead = Boolean(headCommit && recordedCommit && headCommit.startsWith(recordedCommit));
const status = matchesHead ? "current_for_head" : "historical_not_current_head";

const output = {
  schemaVersion: "1.0",
  checkedAt: new Date().toISOString(),
  ok: true,
  network: "not_used",
  mutatesFiles: false,
  status,
  repo: {
    branch,
    headCommit,
    statusShort
  },
  releaseEvidence: {
    path: evidencePath,
    present: evidencePresent,
    releaseVersion: evidence?.releaseVersion ?? null,
    recordedCommit,
    recordedCommitExists,
    updatedAt: evidence?.updatedAt ?? null,
    localVerifiedAt: evidence?.localVerifiedAt ?? null,
    matchesHead
  },
  requiredBeforeTask35: {
    task: "TASKS.md item 35",
    purpose: "Refresh release evidence only after intentionally rerunning the full local release gate for the target commit.",
    commands: requiredCommands,
    notes: [
      "This precheck is read-only and does not edit docs/release-evidence.json.",
      "If status is historical_not_current_head, release evidence should not be presented as proof for the current commit.",
      "Hosted or production proof still requires explicit approval and a safe public URL scope."
    ]
  }
};

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Release evidence precheck: ${status}.`);
  console.log(`Recorded evidence commit: ${recordedCommit ?? "missing"}.`);
  console.log(`Current HEAD: ${headCommit ?? "unknown"}.`);
  console.log("No network used and no files mutated.");
  console.log("Before Task 35, run:");
  for (const command of requiredCommands) {
    console.log(`- ${command}`);
  }
}
