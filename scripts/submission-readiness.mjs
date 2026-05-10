import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const jsonMode = process.argv.includes("--json");
const root = process.cwd();

const requiredDocPaths = [
  "README.md",
  "docs/HACKATHON_SUBMISSION_GUIDE.md",
  "docs/HACKATHON_SUBMISSION_CHECKLIST.md",
  "docs/MCP_DEMO_PROOF.md",
  "docs/DEMO_VIDEO_CHECKLIST.md",
  "docs/SAMPLE_AND_PERSISTENCE_REALNESS.md",
  "docs/LIVE_FALLBACK_PROOF.md"
];
const requiredPackageScripts = [
  "demo:readiness:snapshot:json",
  "demo:artifact-hygiene:json",
  "media:fal:smoke:json",
  "release:evidence:precheck:json"
];
const localValidationCommands = [
  "pnpm lint",
  "pnpm typecheck",
  "pnpm test",
  "pnpm governance:audit",
  "pnpm data:quality",
  "pnpm media:fal:smoke:json",
  "pnpm release:evidence:precheck:json",
  "pnpm demo:artifact-hygiene:json"
];
const gatedChecks = [
  {
    gate: "Task 35",
    status: "not_run_by_this_script",
    reason: "Release evidence refresh must intentionally rerun the full release gate for the target commit."
  },
  {
    gate: "hosted deployment proof",
    status: "not_run_by_this_script",
    reason: "Hosted/public URL mutation and smoke evidence require explicit deployment scope."
  },
  {
    gate: "live provider spend",
    status: "not_run_by_this_script",
    reason: "Fal/provider calls must remain RUN_LIVE_FAL_SMOKE=1 gated and explicitly approved."
  },
  {
    gate: "backend persistence",
    status: "not_run_by_this_script",
    reason: "Saved-canvas backend persistence remains future/local-dev scoped unless explicitly approved."
  }
];


function runGit(args) {
  try {
    return execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return "";
  }
}

function redactRemoteUrl(remoteUrl) {
  if (!remoteUrl) {
    return { configured: false, host: "", path: "", redactedUrl: "", publicRepoReady: false };
  }

  const sanitized = remoteUrl.replace(/:\/\/[^/@]+@/, "://[REDACTED]@");
  const httpsMatch = sanitized.match(/^https?:\/\/(?:\[REDACTED\]@)?([^/]+)\/(.+?)(?:\.git)?$/);
  const sshMatch = sanitized.match(/^(?:git@)?([^:]+):(.+?)(?:\.git)?$/);
  const match = httpsMatch ?? sshMatch;
  const host = match?.[1] ?? "unknown";
  const path = match?.[2] ?? "unknown";
  const looksPrivateOrLocal = /localhost|127\.0\.0\.1|private|internal/i.test(host) || remoteUrl.includes("[REDACTED]");

  return {
    configured: true,
    host,
    path,
    redactedUrl: host === "unknown" ? "configured_unparsed" : `${host}/${path.replace(/\.git$/, "")}`,
    publicRepoReady: !looksPrivateOrLocal && host !== "unknown"
  };
}

function readJson(pathFromRoot) {
  return JSON.parse(readFileSync(join(root, pathFromRoot), "utf8"));
}

const packageJson = readJson("package.json");
const gitBranch = runGit(["branch", "--show-current"]) || "unknown";
const remoteUrl = runGit(["config", "--get", "remote.origin.url"]);
const repoRemote = {
  branch: gitBranch,
  remoteName: "origin",
  ...redactRemoteUrl(remoteUrl),
  valuesEchoed: false
};
const requiredDocs = requiredDocPaths.map((path) => ({
  path,
  present: existsSync(join(root, path))
}));
const packageScripts = requiredPackageScripts.map((name) => ({
  name,
  present: Boolean(packageJson.scripts?.[name])
}));
const checks = [
  {
    name: "required submission docs are present",
    ok: requiredDocs.every((doc) => doc.present)
  },
  {
    name: "required no-spend/readiness scripts are present",
    ok: packageScripts.every((script) => script.present)
  },
  {
    name: "gated risky checks are listed but not run",
    ok: gatedChecks.every((check) => check.status === "not_run_by_this_script")
  },
  {
    name: "git remote submission target is inspectable without network",
    ok: repoRemote.configured
  }
];
const ok = checks.every((check) => check.ok);
const output = {
  schemaVersion: "1.0",
  checkedAt: new Date().toISOString(),
  ok,
  network: "not_used",
  mutatesFiles: false,
  requiredDocs,
  packageScripts,
  repoRemote,
  localValidationCommands,
  gatedChecks,
  knownSubmissionTodos: [
    repoRemote.publicRepoReady ? "Confirm the final public repo URL matches the submission form." : "Add the final public repo URL in the submission form.",
    "Add the final Loom URL after recording.",
    "Add team roster/contact fields outside committed secrets.",
    "Only add hosted URL proof if an explicit deployment task is approved and validated."
  ],
  checks
};

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Submission readiness: ${ok ? "OK" : "FAILED"}.`);
  for (const check of checks) {
    console.log(`- ${check.ok ? "PASS" : "FAIL"} ${check.name}`);
  }
  console.log("No network used and no files mutated.");
}

if (!ok) {
  process.exitCode = 1;
}
