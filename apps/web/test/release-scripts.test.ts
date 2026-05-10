import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { releaseMetadata } from "@texas-data-canvas/shared";

describe("release and governance scripts", () => {
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

  it("passes the governance audit for current fixtures and metadata", () => {
    const stdout = execFileSync("node", ["scripts/governance-audit.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.releaseVersion).toBe(releaseMetadata.releaseVersion);
    expect(body.checks.map((check: { name: string }) => check.name)).toEqual(expect.arrayContaining([
      "hidden fields stay out of canvas/export fixtures",
      "catalog datasets include source caveats",
      "sample files match catalog dataset IDs",
      "live mappings exclude hidden fields",
      "live verification timestamps are fresh",
      "blocked live checks are documented",
      "gallery canvas sources reference approved catalog datasets",
      "source method blocks include caveats",
      "README known boundaries match catalog"
    ]));
  });

  it("reports sample data quality for release handoff", () => {
    const stdout = execFileSync("node", ["scripts/data-quality.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.summary.datasetCount).toBe(3);
    expect(body.datasets.map((dataset: { datasetId: string }) => dataset.datasetId)).toEqual(expect.arrayContaining([
      "dallas_311_requests",
      "austin_building_permits",
      "houston_transportation_incidents"
    ]));
    expect(body.summary.totalSampleRows).toBeGreaterThan(0);
    expect(body.datasets.every((dataset: { ok: boolean }) => dataset.ok)).toBe(true);
    const houston = body.datasets.find((dataset: { datasetId: string }) =>
      dataset.datasetId === "houston_transportation_incidents"
    );
    expect(houston?.hiddenFieldsAbsent).toBe(true);
    expect(houston?.hiddenFieldsChecked).toContain("precise_address");
    expect(body.datasets.find((dataset: { datasetId: string }) =>
      dataset.datasetId === "austin_building_permits"
    )?.distinctMonths).toBe(12);
  });

  it("verifies Vercel output safely when no local output exists", () => {
    const stdout = execFileSync("node", ["scripts/verify-vercel-build-output.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.checks.map((check: { name: string }) => check.name)).toContain("no tracked Vercel secrets or project metadata");
  });

  it("governance audit rejects controlled hidden-field leakage", () => {
    const dir = mkdtempSync(join(tmpdir(), "tdc-governance-"));
    const fixturePath = join(dir, "leaky.canvas.json");

    writeFileSync(fixturePath, JSON.stringify({
      id: "leaky",
      title: "Leaky fixture",
      schemaVersion: "1.0",
      createdAt: "2026-05-09T00:00:00.000Z",
      updatedAt: "2026-05-09T00:00:00.000Z",
      prompt: "leak check",
      sources: [],
      blocks: [
        {
          id: "table",
          type: "TableBlock",
          props: {
            title: "Unsafe table",
            columns: [{ field: "precise_address", label: "Precise address" }],
            rows: [{ precise_address: "123 Main St" }]
          }
        },
        {
          id: "source",
          type: "SourceMethodBlock",
          props: {
            title: "Source",
            source: "fixture",
            method: "fixture",
            caveats: []
          }
        }
      ]
    }));

    try {
      expect(() =>
        execFileSync("node", ["scripts/governance-audit.mjs", "--json", "--extra-canvas", fixturePath], {
          cwd: process.cwd(),
          encoding: "utf8",
          stdio: "pipe"
        })
      ).toThrow();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
