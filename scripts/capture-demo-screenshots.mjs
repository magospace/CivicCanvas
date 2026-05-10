import { mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = new Set(process.argv.slice(2));
const runCapture = args.has("--run");
const jsonMode = args.has("--json");
const helpMode = args.has("--help") || args.has("-h");

function argValue(name, fallback) {
  const prefix = `${name}=`;
  const found = process.argv.slice(2).find((arg) => arg.startsWith(prefix));
  return found ? found.slice(prefix.length) : fallback;
}

const baseUrl = argValue("--base-url", process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3002").replace(/\/$/, "");
const outputDir = resolve(argValue("--output", "demo-artifacts/screenshots"));
const viewport = { width: 1440, height: 1000 };
const primaryPrompt = "Show Dallas 311 service requests by category and ZIP code for 2024.";
const screenshotPlan = [
  {
    name: "sources-catalog",
    route: "/sources",
    description: "Approved sources, live/sample confidence notes, and hidden-field warnings."
  },
  {
    name: "explore-dallas-dashboard",
    route: "/explore",
    description: "Primary Dallas dashboard generated from the deterministic demo prompt.",
    prompt: primaryPrompt
  },
  {
    name: "saved-local-boundary",
    route: "/saved",
    description: "Browser-local saved-canvas page and import/share boundary."
  },
  {
    name: "demo-readiness",
    route: "/demo-readiness",
    description: "Demo readiness utility with historical release-evidence warning and known blockers."
  }
];

function helpText() {
  return `Usage: node scripts/capture-demo-screenshots.mjs [--json] [--run] [--base-url=http://localhost:3002] [--output=demo-artifacts/screenshots]\n\nDefault mode is a no-browser dry run that prints the deterministic screenshot plan and creates no files.\nUse --run only when a local or hosted app is already running and you intentionally want local generated screenshots.\nGenerated files belong under an ignored artifact directory and must not be committed unless explicitly approved.\n`;
}

async function capture() {
  const { chromium } = await import("@playwright/test");
  mkdirSync(outputDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport });
  const captured = [];

  try {
    for (const item of screenshotPlan) {
      await page.goto(`${baseUrl}${item.route}`, { waitUntil: "networkidle" });
      if (item.prompt) {
        await page.getByLabel(/Describe the dashboard/i).fill(item.prompt);
        await page.getByRole("button", { name: /Generate View/i }).click();
        await page.getByText(/Dallas 311 Service Requests Explorer/i).waitFor({ timeout: 15_000 });
      }
      const path = join(outputDir, `${item.name}.png`);
      await page.screenshot({ path, fullPage: true });
      captured.push({ ...item, path });
    }

    const manifest = {
      schemaVersion: "1.0",
      generatedAt: new Date().toISOString(),
      baseUrl,
      outputDir,
      generatedMediaArtifact: true,
      commitApproved: false,
      note: "Local screenshot artifacts for submission preparation. Do not commit unless a separate task explicitly approves generated media assets.",
      screenshots: captured
    };
    const manifestPath = join(outputDir, "manifest.json");
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    return { ok: true, mode: "captured", manifestPath, ...manifest };
  } finally {
    await browser.close();
  }
}

if (helpMode) {
  console.log(helpText());
  process.exit(0);
}

const dryRunOutput = {
  schemaVersion: "1.0",
  ok: true,
  mode: "dry_run",
  network: "not_used_by_script_default",
  mutatesFiles: false,
  baseUrl,
  outputDir,
  generatedMediaArtifact: false,
  requiresRunningAppForCapture: true,
  captureCommand: "node scripts/capture-demo-screenshots.mjs --run",
  note: "Default mode creates no screenshots. Use --run only for intentional local generated artifacts; keep outputs out of git unless explicitly approved.",
  screenshots: screenshotPlan
};

if (!runCapture) {
  if (jsonMode) {
    console.log(JSON.stringify(dryRunOutput, null, 2));
  } else {
    console.log(`Demo screenshot capture dry run: ${screenshotPlan.length} planned screenshots. No files created.`);
    console.log(`Output directory when --run is used: ${outputDir}`);
  }
} else {
  capture()
    .then((result) => {
      if (jsonMode) {
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(`Captured ${result.screenshots.length} screenshots under ${outputDir}`);
        console.log(`Manifest: ${result.manifestPath}`);
      }
    })
    .catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      const body = {
        ok: false,
        mode: "capture_failed",
        baseUrl,
        outputDir,
        error: message,
        note: "Start the app first or pass --base-url to an already running deployment. Do not retry against production unless hosted smoke scope is approved."
      };
      if (jsonMode) {
        console.log(JSON.stringify(body, null, 2));
      } else {
        console.error(`Screenshot capture failed: ${message}`);
      }
      process.exitCode = 1;
    });
}
