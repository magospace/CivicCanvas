import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { releaseMetadata } from "@texas-data-canvas/shared";

describe("release and governance scripts", () => {
  it("redacts provider secrets, bearer tokens, signed URLs, and sensitive response IDs", async () => {
    const redactionModulePath = join(process.cwd(), "scripts/lib/redaction.mjs");
    const { redactProviderOutput } = await import(/* @vite-ignore */ redactionModulePath);
    const secret = "fal_secret_value_do_not_print";
    const token = "bearer_token_value_do_not_print";
    const signedUrl = "https://example.invalid/output.png?X-Amz-Signature=abc123&token=secret-token&safe=ok";

    const redacted = redactProviderOutput({
      authorization: `Bearer ${token}`,
      apiKey: secret,
      request_id: "req_123456789",
      artifact: { url: signedUrl },
      nested: { prompt: "safe prompt", providerResponse: { raw: "raw body should not print" } }
    });
    const serialized = JSON.stringify(redacted);

    expect(redacted.authorization).toBe("[REDACTED]");
    expect(redacted.apiKey).toBe("[REDACTED]");
    expect(redacted.request_id).toBe("[REDACTED]");
    expect(redacted.artifact.url).toBe("https://example.invalid/output.png?[REDACTED_QUERY]");
    expect(redacted.nested.prompt).toBe("safe prompt");
    expect(redacted.nested.providerResponse).toBe("[REDACTED]");
    expect(serialized).not.toContain(secret);
    expect(serialized).not.toContain(token);
    expect(serialized).not.toContain("abc123");
    expect(serialized).not.toContain("raw body should not print");
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

  it("reports local persistence readiness without creating a database", () => {
    const stdout = execFileSync("node", ["scripts/local-persistence-readiness.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, DATABASE_URL: "postgres://fake-secret-value", ENABLE_LOCAL_CANVAS_PERSISTENCE: "0" }
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.mutatesFiles).toBe(false);
    expect(body.network).toBe("not_used");
    expect(body.persistenceImplemented).toBe(false);
    expect(body.browserLocalDefaultPreserved).toBe(true);
    expect(body.apiSaveBehavior).toBe("validation_stub_no_server_write");
    expect(body.plan.path).toBe("docs/LOCAL_PERSISTENCE_SPIKE.md");
    expect(body.plan.present).toBe(true);
    expect(body.databaseRuntimeFiles.found).toEqual([]);
    expect(body.databaseEnv.presentNames).toContain("DATABASE_URL");
    expect(body.databaseEnv.valuesEchoed).toBe(false);
    expect(stdout).not.toContain("fake-secret-value");
  });

  it("reports sample freshness without claiming source-owned live freshness", () => {
    const stdout = execFileSync("node", ["scripts/sample-freshness-snapshot.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.network).toBe("not_used");
    expect(body.mutatesFiles).toBe(false);
    expect(body.sourceFreshnessChecklist).toBe("docs/SOURCE_FRESHNESS_CHECKLIST.md");
    expect(body.note).toContain("does not prove source-owned live freshness");
    expect(body.summary.datasetCount).toBe(3);
    expect(body.summary.totalRows).toBe(280);
    const houston = body.samples.find((sample: { datasetId: string }) => sample.datasetId === "houston_transportation_incidents");
    expect(houston.hiddenFieldsChecked).toContain("precise_address");
    expect(houston.hiddenFieldsAbsent).toBe(true);
    expect(body.samples.every((sample: { sourceFreshnessClaim: string }) =>
      sample.sourceFreshnessClaim === "synthetic_schema_aligned_sample_not_source_owned_live_freshness"
    )).toBe(true);
  });

  it("reports no-network live/fallback proof for core demo claims", () => {
    const stdout = execFileSync("node", ["scripts/live-fallback-proof.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.network).toBe("not_used");
    const dallas = body.rows.find((row: { datasetId: string }) => row.datasetId === "dallas_311_requests");
    expect(dallas.liveAvailable).toBe(true);
    expect(dallas.liveMappedFields).toContain("category");
    expect(dallas.liveMappedFields).not.toContain("zip_code");
    expect(dallas.sampleOnlyFields).toContain("zip_code");
    const houston = body.rows.find((row: { datasetId: string }) => row.datasetId === "houston_transportation_incidents");
    expect(houston.renderedMode).toBe("sample_first");
    expect(houston.hiddenFields).toContain("precise_address");
  });

  it("reports release evidence currency without mutating release evidence", () => {
    const stdout = execFileSync("node", ["scripts/release-evidence-precheck.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.network).toBe("not_used");
    expect(body.mutatesFiles).toBe(false);
    expect(body.releaseEvidence.path).toBe("docs/release-evidence.json");
    expect(body.releaseEvidence.recordedCommit).toMatch(/^[0-9a-f]{7,40}$/);
    expect(body.repo.headCommit).toMatch(/^[0-9a-f]{40}$/);
    expect(body.status).toMatch(/current_for_head|historical_not_current_head/);
    expect(body.requiredBeforeTask35.commands).toEqual(expect.arrayContaining([
      "pnpm lint",
      "pnpm typecheck",
      "pnpm test",
      "pnpm build",
      "pnpm governance:audit",
      "pnpm data:quality",
      "pnpm verify:prod-local",
      "pnpm release:check"
    ]));
    expect(stdout).not.toContain("DATABASE_URL");
  });

  it("emits a no-network demo readiness snapshot without mutating files", () => {
    const stdout = execFileSync("node", ["scripts/demo-readiness-snapshot.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.network).toBe("not_used");
    expect(body.mutatesFiles).toBe(false);
    expect(body.validationBaseline.dailyLocal).toEqual(["pnpm lint", "pnpm typecheck", "pnpm test"]);
    expect(body.sampleData.datasetCount).toBe(3);
    expect(body.sampleData.totalSampleRows).toBeGreaterThan(0);
    expect(body.liveFallbackProof.command).toBe("pnpm live:fallback-proof:json");
    expect(body.mediaProof.appGeneratesMediaByDefault).toBe(false);
    expect(body.releaseEvidence.path).toBe("docs/release-evidence.json");
    expect(body.releaseEvidence.status).toMatch(/historical_not_current_head|current_for_head/);
    expect(body.knownBlockers).toEqual(expect.arrayContaining([
      expect.stringContaining("Release evidence remains historical"),
      expect.stringContaining("platform-level firewall/rate limiting")
    ]));
  });

  it("reports a dry-run screenshot capture plan without creating generated media", () => {
    const stdout = execFileSync("node", ["scripts/capture-demo-screenshots.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.mode).toBe("dry_run");
    expect(body.mutatesFiles).toBe(false);
    expect(body.generatedMediaArtifact).toBe(false);
    expect(body.outputDir).toContain("demo-artifacts");
    expect(body.screenshots.map((shot: { name: string }) => shot.name)).toEqual([
      "sources-catalog",
      "explore-dallas-dashboard",
      "saved-local-boundary",
      "demo-readiness"
    ]);
    expect(body.screenshots.find((shot: { name: string; prompt?: string }) =>
      shot.name === "explore-dallas-dashboard"
    )?.prompt).toBe("Show Dallas 311 service requests by category and ZIP code for 2024.");
  });

  it("reports demo artifact git hygiene without generating media", () => {
    const stdout = execFileSync("node", ["scripts/demo-artifact-hygiene.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.network).toBe("not_used");
    expect(body.mutatesFiles).toBe(false);
    expect(body.ignoredDirectories).toContain("demo-artifacts");
    expect(body.generatedMediaExtensions).toEqual(expect.arrayContaining([".png", ".jpg", ".jpeg", ".gif", ".mp4", ".webm"]));
    expect(body.stagedGeneratedMedia).toEqual([]);
    expect(body.checks.map((check: { name: string }) => check.name)).toEqual(expect.arrayContaining([
      "demo-artifacts ignored",
      "no staged generated demo media"
    ]));
  });

  it("reports submission bundle readiness without network or mutation", () => {
    const stdout = execFileSync("node", ["scripts/submission-readiness.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.network).toBe("not_used");
    expect(body.mutatesFiles).toBe(false);
    expect(body.requiredDocs.map((doc: { path: string }) => doc.path)).toEqual(expect.arrayContaining([
      "README.md",
      "docs/HACKATHON_SUBMISSION_GUIDE.md",
      "docs/HACKATHON_SUBMISSION_CHECKLIST.md",
      "docs/MCP_DEMO_PROOF.md"
    ]));
    expect(body.localValidationCommands).toEqual(expect.arrayContaining(["pnpm lint", "pnpm typecheck", "pnpm test"]));
    expect(body.repoRemote).toEqual(expect.objectContaining({
      branch: expect.any(String),
      remoteName: "origin",
      configured: expect.any(Boolean),
      valuesEchoed: false
    }));
    if (body.repoRemote.configured) {
      expect(body.repoRemote.redactedUrl).not.toContain("@");
      expect(body.repoRemote.host).not.toContain("@");
      expect(body.repoRemote.path).not.toContain("@");
    }
    expect(body.gatedChecks).toEqual(expect.arrayContaining([
      expect.objectContaining({ gate: "Task 35", status: "not_run_by_this_script" }),
      expect.objectContaining({ gate: "live provider spend", status: "not_run_by_this_script" })
    ]));
    expect(stdout).not.toContain("DATABASE_URL");
  });

  it("verifies current-doc links and historical-doc labeling", () => {
    const stdout = execFileSync("node", ["scripts/docs-consistency.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8"
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.currentDocs).toEqual(expect.arrayContaining([
      "README.md",
      "CODEBASE_OVERVIEW.md",
      "ARCHITECTURE_MAP.md",
      "DEVELOPMENT_GUIDE.md",
      "docs/README.md"
    ]));
    expect(body.historicalDocs).toEqual(expect.arrayContaining([
      "docs/PRD.md",
      "docs/MVP_BUILD_BRIEF.md",
      "docs/AGENT_DEVELOPMENT_PLAN.md"
    ]));
    expect(body.checks.map((check: { name: string }) => check.name)).toContain("historical docs are labeled away from current starting points");
    expect(body.checks.map((check: { name: string }) => check.name)).toContain("hosted smoke template preserves release and secret caveats");
    expect(body.hostedSmokeTemplateRequiredPhrases).toEqual(expect.arrayContaining([
      "pnpm smoke:deploy",
      "PLAYWRIGHT_BASE_URL",
      "platform-level firewall/rate limiting",
      "not release evidence",
      "Do not paste secrets"
    ]));
  });

  it("reports Fal media smoke as skipped by default with no spend", () => {
    const stdout = execFileSync("node", ["scripts/fal-media-smoke.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: { ...process.env, RUN_LIVE_FAL_SMOKE: "0", FAL_KEY: "", FAL_API_KEY: "" }
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.status).toBe("skipped_no_spend");
    expect(body.liveGateEnabled).toBe(false);
    expect(body.liveCallCount).toBe(0);
    expect(body.appMediaWiring).toBe("not_implemented_dashboard_ui_only");
  });

  it("redacts fake Fal provider keys in no-spend smoke output", () => {
    const fakeKey = "fal_secret_test_value_do_not_print";
    const fakeBackupKey = "fal_backup_secret_value_do_not_print";
    const stdout = execFileSync("node", ["scripts/fal-media-smoke.mjs", "--json"], {
      cwd: process.cwd(),
      encoding: "utf8",
      env: {
        ...process.env,
        RUN_LIVE_FAL_SMOKE: "0",
        FAL_KEY: fakeKey,
        FAL_API_KEY: fakeBackupKey,
        OPENAI_API_KEY: "openai_secret_value_do_not_print",
        ANTHROPIC_API_KEY: "anthropic_secret_value_do_not_print"
      }
    });
    const body = JSON.parse(stdout);

    expect(body.ok).toBe(true);
    expect(body.status).toBe("skipped_no_spend");
    expect(body.liveCallCount).toBe(0);
    expect(body.keyPresent).toBe(true);
    expect(body.keyEcho).toBe("[REDACTED]");
    expect(stdout).not.toContain(fakeKey);
    expect(stdout).not.toContain(fakeBackupKey);
    expect(stdout).not.toContain("openai_secret_value_do_not_print");
    expect(stdout).not.toContain("anthropic_secret_value_do_not_print");
  });

  it("blocks live Fal media smoke without a provider key and does not print secrets", () => {
    try {
      execFileSync("node", ["scripts/fal-media-smoke.mjs", "--json"], {
        cwd: process.cwd(),
        encoding: "utf8",
        stdio: "pipe",
        env: { ...process.env, RUN_LIVE_FAL_SMOKE: "1", FAL_KEY: "", FAL_API_KEY: "" }
      });
      throw new Error("Expected Fal media smoke to fail without a provider key.");
    } catch (error) {
      const stdout = String((error as { stdout?: string }).stdout ?? "");
      const body = JSON.parse(stdout);
      expect(body.ok).toBe(false);
      expect(body.status).toBe("blocked_missing_key");
      expect(body.liveCallCount).toBe(0);
      expect(stdout).not.toContain("fal_secret");
    }
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
