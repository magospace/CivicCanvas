import { execFileSync } from "node:child_process";

const jsonMode = process.argv.includes("--json");
const root = process.cwd();
const ignoredDirectories = ["demo-artifacts"];
const generatedMediaExtensions = [".png", ".jpg", ".jpeg", ".gif", ".mp4", ".webm"];

function git(args) {
  try {
    return execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch {
    return null;
  }
}

function isIgnored(path) {
  return git(["check-ignore", "-q", path]) === "" || git(["check-ignore", path]) === path;
}

function stagedFiles() {
  const stdout = git(["diff", "--cached", "--name-only", "--diff-filter=ACMRT"]);
  return stdout ? stdout.split("\n").filter(Boolean) : [];
}

function hasGeneratedMediaExtension(path) {
  const lowered = path.toLowerCase();
  return generatedMediaExtensions.some((extension) => lowered.endsWith(extension));
}

const ignoredStatus = ignoredDirectories.map((directory) => ({
  directory,
  ignored: isIgnored(directory)
}));
const stagedGeneratedMedia = stagedFiles().filter((file) =>
  file.startsWith("demo-artifacts/") || hasGeneratedMediaExtension(file)
);
const checks = [
  {
    name: "demo-artifacts ignored",
    ok: ignoredStatus.every((entry) => entry.ignored),
    detail: ignoredStatus.every((entry) => entry.ignored)
      ? "demo-artifacts is ignored by git."
      : "demo-artifacts is not ignored by git."
  },
  {
    name: "no staged generated demo media",
    ok: stagedGeneratedMedia.length === 0,
    detail: stagedGeneratedMedia.length === 0
      ? "No generated demo media files are staged."
      : `Generated demo media files are staged: ${stagedGeneratedMedia.join(", ")}`
  }
];
const ok = checks.every((check) => check.ok);
const output = {
  schemaVersion: "1.0",
  checkedAt: new Date().toISOString(),
  ok,
  network: "not_used",
  mutatesFiles: false,
  ignoredDirectories,
  generatedMediaExtensions,
  stagedGeneratedMedia,
  checks,
  note: "Generated screenshots, videos, GIFs, and demo-artifacts outputs should remain local/ignored unless a separate task explicitly approves committing them."
};

if (jsonMode) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(`Demo artifact git hygiene: ${ok ? "OK" : "FAILED"}.`);
  for (const check of checks) {
    console.log(`- ${check.ok ? "PASS" : "FAIL"} ${check.name}: ${check.detail}`);
  }
}

if (!ok) {
  process.exitCode = 1;
}
