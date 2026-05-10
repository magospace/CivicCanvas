#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const scanRoots = ["apps/web/app", "apps/web/components"];
const suspiciousTerms = /\b(mock|demoData|demoRows|sampleRows|sampleData|fake|fixtureRows|hardcoded)\b/i;
const inlineArrayPattern = /(?:const|let|var)\s+([A-Za-z0-9_]*(?:mock|demo|sample|fake|fixture)[A-Za-z0-9_]*)\s*=\s*\[/gi;
const objectArrayPattern = /(?:const|let|var)\s+([A-Za-z0-9_]+)\s*=\s*\[\s*\{/gi;

const allowedStaticUi = [
  {
    file: "apps/web/components/header.tsx",
    names: ["navItems"],
    reason: "Static route navigation, not demo records."
  },
  {
    file: "apps/web/app/demo-readiness/page.tsx",
    names: ["readinessChecks", "boundaries", "providerProofSteps", "liveProofChecks", "submissionChecks"],
    reason: "Static checklist/copy arrays for the readiness page, not app data records."
  },
  {
    file: "apps/web/components/demo-checklist-actions.tsx",
    names: ["actions"],
    reason: "Static checklist action buttons, not dataset/demo records."
  }
];

function walk(dir) {
  const entries = [];
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if ([".next", "node_modules", "dist"].includes(name)) continue;
      entries.push(...walk(full));
    } else if (/\.(tsx|ts)$/.test(name)) {
      entries.push(full);
    }
  }
  return entries;
}

function lineFor(source, index) {
  return source.slice(0, index).split("\n").length;
}

function isAllowed(relative, name) {
  return allowedStaticUi.find((entry) => entry.file === relative && entry.names.includes(name));
}

const actionable = [];
const classified = [];

for (const scanRoot of scanRoots) {
  const absRoot = path.join(root, scanRoot);
  for (const file of walk(absRoot)) {
    const relative = path.relative(root, file);
    const source = readFileSync(file, "utf8");

    for (const pattern of [inlineArrayPattern, objectArrayPattern]) {
      pattern.lastIndex = 0;
      let match;
      while ((match = pattern.exec(source)) !== null) {
        const name = match[1];
        const allowed = isAllowed(relative, name);
        const line = lineFor(source, match.index);
        const near = source.slice(Math.max(0, match.index - 160), Math.min(source.length, match.index + 360));
        const suspicious = suspiciousTerms.test(name) || suspiciousTerms.test(near);

        if (allowed) {
          classified.push({ relative, line, name, classification: "static UI / acceptable", reason: allowed.reason });
          continue;
        }

        if (suspicious) {
          actionable.push({ relative, line, name, classification: "possible hardcoded UI mock / review required" });
        } else if (/\[\s*\{/.test(match[0])) {
          classified.push({ relative, line, name, classification: "inline object array / reviewed non-demo naming" });
        }
      }
    }
  }
}

console.log("Hardcoded demo data audit");
console.log(`Scanned: ${scanRoots.join(", ")}`);
console.log(`Classified static/non-actionable arrays: ${classified.length}`);
for (const item of classified.slice(0, 20)) {
  console.log(`- ${item.classification}: ${item.relative}:${item.line} (${item.name})${item.reason ? ` - ${item.reason}` : ""}`);
}
if (classified.length > 20) {
  console.log(`- ... ${classified.length - 20} more classified non-actionable arrays`);
}

if (actionable.length > 0) {
  console.error("\nActionable findings:");
  for (const item of actionable) {
    console.error(`- ${item.classification}: ${item.relative}:${item.line} (${item.name})`);
  }
  console.error("\nMove demo records through catalog/sample/gallery/saved-data loaders, or add a narrow static-UI allowlist with a reason.");
  process.exit(1);
}

console.log("Actionable hardcoded demo/mock data findings: 0");
