import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const outputRoot = join(root, ".vercel/output");
const jsonMode = process.argv.includes("--json");

function walk(dir, files = []) {
  if (!existsSync(dir)) {
    return files;
  }
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(path, files);
    } else {
      files.push(path);
    }
  }
  return files;
}

function trackedFiles() {
  try {
    return execFileSync("git", ["ls-files"], { cwd: root, encoding: "utf8" })
      .split("\n")
      .filter(Boolean);
  } catch {
    return [];
  }
}

function check(name, fn) {
  try {
    return { name, ok: true, detail: fn() };
  } catch (error) {
    return { name, ok: false, detail: error instanceof Error ? error.message : String(error) };
  }
}

const files = walk(outputRoot).map((file) => relative(root, file));
const fileHaystack = files.join("\n");
const checks = existsSync(outputRoot)
  ? [
      check("catalog and sample files are traced", () => {
        const required = [
          "approved-datasets.json",
          "dallas-311.sample.json",
          "austin-building-permits.sample.json",
          "houston-transportation-incidents.sample.json"
        ];
        const missing = required.filter((file) => !fileHaystack.includes(file));
        if (missing.length > 0) {
          throw new Error(`Missing traced data files: ${missing.join(", ")}`);
        }
        return `${required.length} data file(s) found in .vercel/output.`;
      }),
      check("health function exists", () => {
        if (!fileHaystack.includes("api/health")) {
          throw new Error("Could not find /api/health output.");
        }
        return "Found /api/health output.";
      }),
      check("public static routes exist", () => {
        const required = ["explore", "sources", "saved", "gallery", "demo-readiness"];
        const missing = required.filter((route) => !fileHaystack.includes(route));
        if (missing.length > 0) {
          throw new Error(`Missing route output: ${missing.join(", ")}`);
        }
        return `${required.length} route output(s) found.`;
      })
    ]
  : [
      {
        name: "vercel output present",
        ok: true,
        detail: ".vercel/output is not present; skipping output inspection. Run vercel build first for this check."
      }
    ];

checks.push(check("no tracked Vercel secrets or project metadata", () => {
  const tracked = trackedFiles();
  if (tracked.includes(".vercel/project.json")) {
    throw new Error(".vercel/project.json is tracked.");
  }
  const sensitivePatterns = [
    /VERCEL_TOKEN\s*=/,
    /org_[A-Za-z0-9]+/,
    /prj_[A-Za-z0-9]+/
  ];
  for (const file of tracked) {
    if (file.startsWith(".vercel/") || file.includes("node_modules") || file.includes(".next/") || file.includes("dist/")) {
      continue;
    }
    const absolute = join(root, file);
    if (!existsSync(absolute)) {
      continue;
    }
    const source = readFileSync(absolute, "utf8");
    const matched = sensitivePatterns.find((pattern) => pattern.test(source));
    if (matched) {
      throw new Error(`${file} appears to contain Vercel secret/project metadata.`);
    }
  }
  return `${tracked.length} tracked file(s) scanned.`;
}));

const failed = checks.filter((item) => !item.ok);
const output = {
  schemaVersion: "1.0",
  checkedAt: new Date().toISOString(),
  ok: failed.length === 0,
  outputPresent: existsSync(outputRoot),
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
  console.log(`Vercel output verification ${output.ok ? "OK" : "FAILED"}: ${output.summary.passed}/${output.summary.total} checks passed.`);
  for (const item of checks) {
    console.log(`- ${item.ok ? "PASS" : "FAIL"} ${item.name}: ${item.detail}`);
  }
}

if (!output.ok) {
  process.exitCode = 1;
}
