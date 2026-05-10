import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { releaseMetadata } from "@texas-data-canvas/shared";
import { GET as catalogHealthGET } from "../app/api/catalog/health/route";
import { POST as canvasGeneratePOST } from "../app/api/canvas/generate/route";
import { POST as miroExportPOST } from "../app/api/export/miro-spec/route";
import { GET as healthGET } from "../app/api/health/route";
import { POST as queryPOST } from "../app/api/query/route";
import { middleware } from "../middleware";
import { apiError, parseJsonRequest } from "../lib/api";

describe("production API contracts", () => {
  it("returns health and catalog health reports", async () => {
    const health = await healthGET();
    const healthBody = await health.json();
    expect(healthBody.ok).toBe(true);
    expect(healthBody.appVersion).toBe(releaseMetadata.devFallbackVersion);
    expect(healthBody.releaseVersion).toBe(releaseMetadata.releaseVersion);
    expect(healthBody.releaseChannel).toBe(releaseMetadata.releaseChannel);
    expect(healthBody.packageVersion).toBe(releaseMetadata.packageVersion);
    expect(healthBody.promptProcessing).toEqual({
      mode: "deterministic_rule_based",
      requiresProviderSecret: false,
      provider: null
    });
    expect(JSON.stringify(healthBody).toLowerCase()).not.toContain("openai");
    expect(JSON.stringify(healthBody).toLowerCase()).not.toContain("anthropic");
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
    process.env.NEXT_PUBLIC_APP_VERSION = releaseMetadata.releaseVersion;
    process.env.NEXT_PUBLIC_SITE_URL = "https://texas-data-canvas.example";
    process.env.VERCEL = "1";
    process.env.VERCEL_GIT_COMMIT_SHA = "abc123";
    process.env.VERCEL_GIT_COMMIT_REF = "feat/v1.3-hosted-launch-readiness";

    try {
      const health = await healthGET();
      const body = await health.json();
      expect(body.appEnvironment).toBe("hosted-beta");
      expect(body.appVersion).toBe(releaseMetadata.releaseVersion);
      expect(body.deploymentProvider).toBe("vercel");
      expect(body.deploymentUrl).toBe("https://texas-data-canvas.example");
      expect(body.gitCommitSha).toBe("abc123");
      expect(body.gitBranch).toBe("feat/v1.3-hosted-launch-readiness");
      expect(body.releaseEvidence.hostedStatus).toBe("blocked");
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

describe("middleware contracts", () => {
  it("passes public GET navigation through without rate-limit headers", () => {
    const response = middleware(new NextRequest("http://localhost/explore", {
      method: "GET",
      headers: { "x-forwarded-for": "203.0.113.201" }
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-RateLimit-Limit")).toBeNull();
    expect(response.headers.get("X-RateLimit-Remaining")).toBeNull();
  });

  it("adds rate-limit headers to configured write-like POST routes", () => {
    const response = middleware(new NextRequest("http://localhost/api/query", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.202" }
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-RateLimit-Limit")).toBe("60");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("59");
    expect(response.headers.get("X-RateLimit-Reset")).toMatch(/^\d+$/);
  });

  it("passes unrelated POST paths through without rate-limit headers", () => {
    const response = middleware(new NextRequest("http://localhost/api/health", {
      method: "POST",
      headers: { "x-forwarded-for": "203.0.113.203" }
    }));

    expect(response.status).toBe(200);
    expect(response.headers.get("X-RateLimit-Limit")).toBeNull();
    expect(response.headers.get("X-RateLimit-Remaining")).toBeNull();
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
});
