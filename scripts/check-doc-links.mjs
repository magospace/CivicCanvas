#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

const root = process.cwd();
const jsonMode = process.argv.includes("--json");
const docs = ["README.md", "HACKATHON_SUBMISSION_GUIDE.md"];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function isExternal(href) {
  return /^(https?:|mailto:|tel:|#)/i.test(href);
}

function stripFragment(href) {
  return href.split("#")[0];
}

function resolveLocalLink(sourceFile, href) {
  const clean = decodeURIComponent(stripFragment(href)).trim();
  if (!clean) {
    return null;
  }
  return normalize(join(root, dirname(sourceFile), clean));
}

const checkedLinks = [];
const issues = [];

for (const file of docs) {
  const text = read(file);
  const lines = text.split(/\r?\n/);
  for (const [lineIndex, line] of lines.entries()) {
    const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
    for (const match of line.matchAll(markdownLinkPattern)) {
      const href = match[1].trim();
      if (isExternal(href)) {
        continue;
      }
      const resolved = resolveLocalLink(file, href);
      if (!resolved) {
        continue;
      }
      const relative = resolved.startsWith(root) ? resolved.slice(root.length + 1) : resolved;
      const exists = existsSync(resolved);
      checkedLinks.push({ file, line: lineIndex + 1, href, target: relative, exists });
      if (!exists) {
        issues.push({ file, line: lineIndex + 1, href, target: relative, reason: "target does not exist" });
        continue;
      }
      if (statSync(resolved).isDirectory()) {
        issues.push({ file, line: lineIndex + 1, href, target: relative, reason: "target is a directory" });
      }
    }
  }
}

const result = {
  checkedDocs: docs,
  checkedLinkCount: checkedLinks.length,
  checkedLinks,
  issues
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("Submission doc link check");
  console.log(`Checked docs: ${docs.join(", ")}`);
  console.log(`Local markdown links checked: ${checkedLinks.length}`);
  if (issues.length === 0) {
    console.log("Issues: 0");
  } else {
    console.log("Issues:");
    for (const issue of issues) {
      console.log(`- ${issue.file}:${issue.line} ${issue.href} -> ${issue.target}: ${issue.reason}`);
    }
  }
}

if (issues.length > 0) {
  process.exit(1);
}
