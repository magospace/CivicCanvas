#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const jsonMode = process.argv.includes("--json");
const root = process.cwd();

const guards = [
  {
    name: "submission TODO scan",
    command: "pnpm",
    args: ["submission:todo-scan:json"],
    network: "none"
  },
  {
    name: "submission docs link check",
    command: "pnpm",
    args: ["docs:links:json"],
    network: "none"
  },
  {
    name: "generated artifact hygiene",
    command: "pnpm",
    args: ["hygiene:artifacts:json"],
    network: "none"
  },
  {
    name: "source provenance summary",
    command: "pnpm",
    args: ["provenance:summary:json"],
    network: "none"
  },
  {
    name: "local push-readiness summary",
    command: "pnpm",
    args: ["local:push-readiness:json"],
    network: "none"
  }
];

function parseJsonOutput(stdout) {
  try {
    return JSON.parse(stdout);
  } catch {
    return null;
  }
}

const results = guards.map((guard) => {
  const startedAt = Date.now();
  const child = spawnSync(guard.command, guard.args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    env: {
      ...process.env,
      RUN_LIVE_OPENAI_SMOKE: "0",
      RUN_LIVE_FAL_SMOKE: "0"
    }
  });
  const durationMs = Date.now() - startedAt;
  const stdout = child.stdout ?? "";
  const stderr = child.stderr ?? "";

  return {
    name: guard.name,
    command: `${guard.command} ${guard.args.join(" ")}`,
    network: guard.network,
    ok: child.status === 0,
    exitCode: child.status,
    durationMs,
    parsed: parseJsonOutput(stdout),
    stdoutPreview: stdout.trim().slice(0, 1200),
    stderrPreview: stderr.trim().slice(0, 1200)
  };
});

const result = {
  ok: results.every((guard) => guard.ok),
  networkCallsMade: 0,
  liveProviderCallsMade: 0,
  releaseEvidenceRefreshed: false,
  deploymentTouched: false,
  pushAttempted: false,
  guards: results,
  reminder: "Final local guard only: no deploy, no provider spend, no release-evidence refresh, and no git push."
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("CivicCanvas final local submission guard");
  console.log("Network/live provider calls made: 0");
  console.log("Deploy/push/release-evidence refresh: not attempted");
  console.log("");
  for (const guard of results) {
    console.log(`${guard.ok ? "PASS" : "FAIL"} ${guard.name} (${guard.command})`);
    if (!guard.ok) {
      if (guard.stdoutPreview) {
        console.log("stdout:");
        console.log(guard.stdoutPreview);
      }
      if (guard.stderrPreview) {
        console.log("stderr:");
        console.log(guard.stderrPreview);
      }
    }
  }
  console.log("");
  console.log(`Overall: ${result.ok ? "PASS" : "FAIL"}`);
  console.log(result.reminder);
}

if (!result.ok) {
  process.exit(1);
}
