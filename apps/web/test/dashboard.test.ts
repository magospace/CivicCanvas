import { execFileSync } from "node:child_process";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { GET as catalogHealthGET } from "../app/api/catalog/health/route";
import { POST as canvasGeneratePOST } from "../app/api/canvas/generate/route";
import { POST as miroExportPOST } from "../app/api/export/miro-spec/route";
import { GET as healthGET } from "../app/api/health/route";
import { POST as queryPOST } from "../app/api/query/route";
import { middleware } from "../middleware";
import { apiError, parseJsonRequest } from "../lib/api";
import { boundedQuerySpecJson, canvasDocumentJson, tableCsv } from "../lib/dashboard-exports";
import { generateCanvasForPrompt } from "../lib/dashboard";
import { getCuratedGalleryCanvases } from "../lib/data";
import { generateMiroExportSpec } from "../lib/miro";

describe("dashboard generation", () => {
  it("generates the Dallas demo dashboard", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");

    expect(generation.canvas.title).toContain("Dallas 311");
    expect(generation.canvas.id).toMatch(/^canvas_dallas_311_requests_/);
    expect(generation.canvas.createdAt).not.toBe("2026-05-09T00:00:00.000Z");
    expect(generation.canvas.sources[0].accessedAt).toBe(generation.canvas.createdAt);
    expect(generation.dataMode).toBe("fallback");
    expect(generation.audits.length).toBeGreaterThan(0);
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("ChartBlock");
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("TableBlock");
  });

  it("generates distinct canvas IDs for repeated saves", async () => {
    const first = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    const second = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");

    expect(first.canvas.id).not.toBe(second.canvas.id);
  });

  it("generates the Austin demo dashboard", async () => {
    const generation = await generateCanvasForPrompt("Show Austin building permits by month and ZIP code.");

    expect(generation.canvas.title).toContain("Austin Building Permits");
    expect(generation.audits.length).toBeGreaterThan(0);
    expect(generation.canvas.sources[0].datasetId).toBe("austin_building_permits");
  });

  it("generates the governed Houston transportation dashboard", async () => {
    const generation = await generateCanvasForPrompt("Show Houston transportation incidents by ZIP and incident type for 2024.");

    expect(generation.canvas.title).toContain("Houston Transportation");
    expect(generation.canvas.sources[0].datasetId).toBe("houston_transportation_incidents");
    expect(generation.dataMode).toBe("sample");
    expect(generation.audits.length).toBeGreaterThan(0);
    expect(generation.intent?.matchedTerms).toEqual(expect.arrayContaining(["transportation", "incident"]));
    expect(generation.canvas.blocks.map((block) => block.type)).toContain("SourceMethodBlock");
    expect(generation.canvas.blocks.find((block) => block.id === "status-chart")?.type).toBe("ChartBlock");
    expect(generation.canvas.blocks.some((block) => block.type === "DatasetCardBlock")).toBe(false);
    expect(JSON.stringify(generation.canvas)).not.toContain("precise_address");
  });

  it("returns dataset suggestions for unsupported prompts", async () => {
    const generation = await generateCanvasForPrompt("Compare tax abatements across El Paso.");

    expect(generation.suggestedDatasets?.length).toBeGreaterThan(0);
    expect(generation.audits).toEqual([]);
    expect(generation.canvas.title).toContain("Choose");
  });

  it("refuses Houston exact-location prompts before dashboard generation", async () => {
    const generation = await generateCanvasForPrompt("Show Houston exact addresses and raw incident locations by ZIP for 2024.");

    expect(generation.canvas.title).toContain("Choose");
    expect(generation.audits).toEqual([]);
    expect(generation.intent?.rejectedFields).toEqual(expect.arrayContaining(["exact address", "raw incident"]));
    expect(generation.intent?.safetyWarnings.join(" ")).toContain("governed dashboards");
  });

  it("routes supported synonym prompts through governed deterministic dashboards", async () => {
    const dallas = await generateCanvasForPrompt("Show Dallas trash complaints by ZIP and top categories for 2024.");
    expect(dallas.canvas.sources[0].datasetId).toBe("dallas_311_requests");
    expect(dallas.intent?.matchedTerms).toEqual(expect.arrayContaining(["complaints", "categories"]));

    const austin = await generateCanvasForPrompt("Show Austin building activity trend for issued permits.");
    expect(austin.canvas.sources[0].datasetId).toBe("austin_building_permits");
    expect(austin.intent?.matchedTerms).toEqual(expect.arrayContaining(["building activity", "issued permits", "trend"]));

    const houston = await generateCanvasForPrompt("Show Houston traffic incidents by ZIP and top incident types for 2024.");
    expect(houston.canvas.sources[0].datasetId).toBe("houston_transportation_incidents");
    expect(houston.intent?.matchedTerms).toEqual(expect.arrayContaining(["traffic incidents", "zip", "top"]));
  });

  it("respects explicit dashboard data-mode preferences", async () => {
    const dallasSample = await generateCanvasForPrompt(
      "Show Dallas 311 service requests by category for 2024.",
      {},
      "sample"
    );
    expect(dallasSample.requestedDataMode).toBe("sample");
    expect(dallasSample.dataMode).toBe("sample");
    expect(dallasSample.fallbackReason).toContain("sample fallback");

    const austinLive = await generateCanvasForPrompt(
      "Show Austin building permits by month and ZIP code.",
      {},
      "live"
    );
    expect(austinLive.requestedDataMode).toBe("live");
    expect(austinLive.dataMode).toBe("fallback");
    expect(austinLive.fallbackReason).toContain("not live-enabled");
    expect(austinLive.canvas.sources[0].caveats.join(" ")).toContain("Approved sample fallback");

    const houstonLive = await generateCanvasForPrompt(
      "Show Houston transportation incidents by ZIP and incident type for 2024.",
      {},
      "live"
    );
    expect(houstonLive.requestedDataMode).toBe("live");
    expect(houstonLive.dataMode).toBe("fallback");
    expect(houstonLive.fallbackReason).toContain("not live-enabled");
  });

  it("exports a preview-only Miro spec with source method frame", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    const spec = generateMiroExportSpec({ canvas: generation.canvas, template: "community_workshop" });

    expect(spec.sourceMethodFrameRequired).toBe(true);
    expect(spec.frames.map((frame) => frame.title)).toContain("Source & Method");
    expect(spec.frames.map((frame) => frame.title)).toContain("Workshop Prompts");
  });

  it("applies category filters to Dallas dashboard generation", async () => {
    const generation = await generateCanvasForPrompt(
      "Show Dallas 311 service requests by category and ZIP code for 2024.",
      { category: "Sanitation" }
    );
    const table = generation.canvas.blocks.find((block) => block.type === "TableBlock");

    expect(table?.type).toBe("TableBlock");
    if (table?.type === "TableBlock") {
      expect(table.props.rows.every((row) => row.category === "Sanitation")).toBe(true);
    }
  });

  it("applies group-by filter state to the detail table", async () => {
    const generation = await generateCanvasForPrompt(
      "Show Austin building permits by month and ZIP code for 2024.",
      { __groupBy: "status" }
    );
    const table = generation.canvas.blocks.find((block) => block.type === "TableBlock");

    expect(table?.type).toBe("TableBlock");
    if (table?.type === "TableBlock") {
      expect(table.props.columns.map((column) => column.field)).toEqual(["status", "permit_count"]);
    }
  });

  it("exports governed dashboard artifacts from validated JSON", async () => {
    const generation = await generateCanvasForPrompt("Show Dallas 311 service requests by category and ZIP code for 2024.");
    const canvasJson = canvasDocumentJson(generation.canvas);
    const specJson = boundedQuerySpecJson(generation.querySpec);
    const csv = tableCsv(generation.canvas);

    expect(JSON.parse(canvasJson).blocks.map((block: { type: string }) => block.type)).toContain("SourceMethodBlock");
    expect(JSON.parse(specJson ?? "{}").datasetId).toBe("dallas_311_requests");
    expect(csv).toContain("request count");
    expect(csv).toContain("Sanitation");
  });

  it("keeps hidden Houston fields out of client exports", async () => {
    const generation = await generateCanvasForPrompt("Show Houston transportation incidents by ZIP and incident type for 2024.");
    const canvasJson = canvasDocumentJson(generation.canvas);
    const specJson = boundedQuerySpecJson(generation.querySpec);
    const csv = tableCsv(generation.canvas);

    expect(canvasJson).not.toContain("precise_address");
    expect(specJson).not.toContain("precise_address");
    expect(csv).not.toContain("precise_address");
    expect(csv).toContain("incident count");
  });

  it("loads curated gallery canvases from checked-in validated JSON", () => {
    const canvases = getCuratedGalleryCanvases();

    expect(canvases.map((canvas) => canvas.id)).toEqual([
      "gallery_dallas_311_sample",
      "gallery_austin_permits_sample",
      "gallery_houston_transportation_sample",
      "gallery_unsupported_sensitive_prompt"
    ]);
    expect(canvases.every((canvas) => canvas.blocks.some((block) => block.type === "SourceMethodBlock"))).toBe(true);
    expect(canvases.map((canvas) => canvas.prompt).join(" ")).toContain("personal contact details");
  });
});

describe("production API contracts", () => {
  it("returns health and catalog health reports", async () => {
    const health = await healthGET();
    const healthBody = await health.json();
    expect(healthBody.ok).toBe(true);
    expect(healthBody.appVersion).toBe("v1.1.0-product-depth-dev");
    expect(healthBody.catalogCount).toBeGreaterThan(0);

    const catalogHealth = await catalogHealthGET();
    const catalogBody = await catalogHealth.json();
    expect(catalogBody.health.status).toBe("ok");
    expect(catalogBody.health.sampleFallbacks.length).toBeGreaterThan(0);
  });

  it("adds hosted deployment metadata to health when env vars are present", async () => {
    const previous = {
      NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
      VERCEL: process.env.VERCEL,
      VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
      VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF
    };

    process.env.NEXT_PUBLIC_APP_ENV = "hosted-beta";
    process.env.NEXT_PUBLIC_APP_VERSION = "v1.1.0-product-depth";
    process.env.NEXT_PUBLIC_SITE_URL = "https://texas-data-canvas.example";
    process.env.VERCEL = "1";
    process.env.VERCEL_GIT_COMMIT_SHA = "abc123";
    process.env.VERCEL_GIT_COMMIT_REF = "feat/v1.1-product-depth";

    try {
      const health = await healthGET();
      const body = await health.json();
      expect(body.appEnvironment).toBe("hosted-beta");
      expect(body.appVersion).toBe("v1.1.0-product-depth");
      expect(body.deploymentProvider).toBe("vercel");
      expect(body.deploymentUrl).toBe("https://texas-data-canvas.example");
      expect(body.gitCommitSha).toBe("abc123");
      expect(body.gitBranch).toBe("feat/v1.1-product-depth");
    } finally {
      for (const [key, value] of Object.entries(previous)) {
        if (value === undefined) {
          delete process.env[key];
        } else {
          process.env[key] = value;
        }
      }
    }
  });

  it("rejects deployment smoke runs without a base URL", () => {
    try {
      execFileSync("node", ["scripts/smoke-deploy.mjs"], {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: "pipe"
      });
      throw new Error("Expected smoke-deploy to fail without --url.");
    } catch (error) {
      const stderr = String((error as { stderr?: string }).stderr ?? "");
      expect(stderr).toContain("Usage: pnpm smoke:deploy");
    }
  });

  it("returns structured API errors for invalid query fields", async () => {
    const response = await queryPOST(new Request("http://localhost/api/query", {
      method: "POST",
      body: JSON.stringify({
        datasetId: "dallas_311_requests",
        groupBy: ["private_field"],
        metrics: [{ type: "count", alias: "request_count" }],
        limit: 10
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.ok).toBe(false);
    expect(body.error.code).toBe("query_failed");
    expect(JSON.stringify(body)).not.toContain("at ");
  });

  it("hides internal details from unexpected API errors", async () => {
    const response = apiError(new Error("Failed to read /Users/example/private/data.json"), {
      code: "internal_failure",
      requestId: "req_test"
    });
    const body = await response.json();

    expect(body.error.message).toBe("Request failed.");
    expect(JSON.stringify(body)).not.toContain("/Users/example");
  });

  it("rate-limits repeated public POST requests in middleware", () => {
    const ip = `203.0.113.${Math.floor(Math.random() * 200)}`;
    let response: Response | undefined;

    for (let index = 0; index < 21; index += 1) {
      response = middleware(new NextRequest("http://localhost/api/canvas/generate", {
        method: "POST",
        headers: { "x-forwarded-for": ip }
      }));
    }

    expect(response?.status).toBe(429);
    expect(response?.headers.get("X-RateLimit-Limit")).toBe("20");
  });

  it("returns fallback mode when live query is requested for a sample-first dataset", async () => {
    const response = await queryPOST(new Request("http://localhost/api/query", {
      method: "POST",
      body: JSON.stringify({
        datasetId: "austin_building_permits",
        mode: "live_if_available",
        groupBy: ["permit_type"],
        metrics: [{ type: "count", alias: "permit_count" }],
        limit: 10
      })
    }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.result.dataMode).toBe("fallback");
    expect(body.result.caveats.join(" ")).toContain("not live-enabled");
  });

  it("rejects oversized JSON bodies before route parsing", async () => {
    await expect(parseJsonRequest(new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ value: "x".repeat(100) })
    }), z.object({ value: z.string() }), 16)).rejects.toThrow(/exceeds/);
  });

  it("keeps canvas generation and Miro export routes governed", async () => {
    const response = await canvasGeneratePOST(new Request("http://localhost/api/canvas/generate", {
      method: "POST",
      body: JSON.stringify({ prompt: "Show Dallas 311 service requests by category and ZIP code for 2024." })
    }));
    const body = await response.json();
    expect(body.canvas.blocks.map((block: { type: string }) => block.type)).toContain("SourceMethodBlock");

    const invalidMiro = await miroExportPOST(new Request("http://localhost/api/export/miro-spec", {
      method: "POST",
      body: JSON.stringify({ canvas: { blocks: [{ type: "UnknownBlock" }] } })
    }));
    const invalidBody = await invalidMiro.json();
    expect(invalidMiro.status).toBe(400);
    expect(invalidBody.ok).toBe(false);
  });
});
