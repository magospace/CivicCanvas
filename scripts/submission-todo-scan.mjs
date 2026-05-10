#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const jsonMode = process.argv.includes("--json");
const files = [
  "HACKATHON_SUBMISSION_GUIDE.md",
  "README.md",
  "docs/HOSTED_BETA_DEPLOYMENT.md"
];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

const allowedTodos = [
  {
    file: "HACKATHON_SUBMISSION_GUIDE.md",
    label: "Deployed URL remains TODO until exact public URL passes smoke check",
    pattern: /Deployed URL: TODO unless an actual public URL has passed `pnpm smoke:deploy -- --url <public-url> --expect-version v1\.3\.0-hosted-launch-readiness`/
  },
  {
    file: "HACKATHON_SUBMISSION_GUIDE.md",
    label: "Loom video remains TODO until recorded by human",
    pattern: /Loom video: TODO\. Must be recorded with Loom and kept between 2 and 5 minutes\./
  },
  {
    file: "HACKATHON_SUBMISSION_GUIDE.md",
    label: "Team roster remains TODO until human fills names and contacts",
    pattern: /Team roster: TODO\. Add names, roles, and contact emails\/handles\./
  },
  {
    file: "README.md",
    label: "README tells humans to leave deployed URL as TODO until smoke passes",
    pattern: /Until that command passes against the actual public URL, list the deployed URL as `TODO` and cite only the local demo\/Loom path\./
  }
];

const forbiddenClaims = [
  {
    label: "hosted readiness claim without smoke proof",
    pattern: /\b(hosted|deployed|public URL)\b[^\n.]{0,120}\b(ready|validated|passed|complete)\b/i,
    allowedWhen: /smoke|TODO|unless|after|before|not proof|no public URL|local-first/i
  },
  {
    label: "production persistence claim",
    pattern: /\b(database-backed|backend persistence|account sync|public share service|production storage)\b/i,
    allowedWhen: /no |not |without|do not claim|not claimed|not claimed \||no-backend|not public|What is not claimed|hosted public share objects/i
  },
  {
    label: "live Miro write claim",
    pattern: /\b(Miro)\b[^\n.]{0,100}\b(create|update|write|OAuth|board ID)\b/i,
    allowedWhen: /no |not |preview|without|not claimed|do not claim/i
  },
  {
    label: "secret-like assignment in submission docs",
    pattern: /(?:OPENAI_API_KEY|FAL_KEY|VERCEL_TOKEN|DATABASE_URL)\s*=\s*(?!<redacted>|<[^>]+>)[^\s`]+/i,
    allowedWhen: /$a/
  }
];

const todoMatches = [];
const unexpectedTodos = [];
const forbiddenMatches = [];

for (const file of files) {
  const text = read(file);
  const lines = text.split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (/TODO/i.test(line)) {
      const allowed = allowedTodos.find((todo) => todo.file === file && todo.pattern.test(text));
      if (allowed && allowed.pattern.test(line)) {
        todoMatches.push({ file, line: index + 1, label: allowed.label, text: line.trim() });
      } else if (file === "HACKATHON_SUBMISSION_GUIDE.md" && /Loom video: TODO|Team roster: TODO/.test(line)) {
        const specific = allowedTodos.find((todo) => todo.file === file && todo.pattern.test(line));
        if (specific) {
          todoMatches.push({ file, line: index + 1, label: specific.label, text: line.trim() });
        } else {
          unexpectedTodos.push({ file, line: index + 1, text: line.trim() });
        }
      } else {
        unexpectedTodos.push({ file, line: index + 1, text: line.trim() });
      }
    }

    for (const claim of forbiddenClaims) {
      if (claim.pattern.test(line) && !claim.allowedWhen.test(line)) {
        forbiddenMatches.push({ file, line: index + 1, label: claim.label, text: line.trim() });
      }
    }
  }
}

const requiredLabels = new Set(allowedTodos.map((todo) => todo.label));
const seenLabels = new Set(todoMatches.map((match) => match.label));
const missingAllowedTodos = [...requiredLabels]
  .filter((label) => !seenLabels.has(label))
  .map((label) => ({ label }));

const issues = [...unexpectedTodos, ...forbiddenMatches, ...missingAllowedTodos];
const result = {
  checkedFiles: files,
  allowedTodos: todoMatches,
  unexpectedTodos,
  forbiddenMatches,
  missingAllowedTodos,
  issueCount: issues.length
};

if (jsonMode) {
  console.log(JSON.stringify(result, null, 2));
} else {
  console.log("Submission TODO scan");
  console.log(`Checked files: ${files.join(", ")}`);
  console.log("");
  console.log("Allowed submission TODOs:");
  for (const todo of todoMatches) {
    console.log(`- ${todo.file}:${todo.line} ${todo.label}`);
  }
  if (todoMatches.length === 0) {
    console.log("- none");
  }
  console.log("");
  if (issues.length === 0) {
    console.log("Issues: 0");
  } else {
    console.log("Issues:");
    for (const issue of issues) {
      const location = issue.file ? `${issue.file}:${issue.line}` : "required TODO";
      console.log(`- ${location} ${issue.label ?? "unexpected TODO"}: ${issue.text ?? "missing"}`);
    }
  }
}

if (issues.length > 0) {
  process.exit(1);
}
