const args = process.argv.slice(2);
const urlArgIndex = args.indexOf("--url");
const expectedVersionIndex = args.indexOf("--expect-version");
const jsonMode = args.includes("--json");
const checkedAt = new Date().toISOString();
const startedAt = Date.now();

if (urlArgIndex === -1 || !args[urlArgIndex + 1]) {
  console.error("Usage: pnpm smoke:deploy -- --url <base-url> [--expect-version <version>] [--json]");
  process.exit(1);
}

const expectedVersion = expectedVersionIndex === -1 ? undefined : args[expectedVersionIndex + 1];
if (expectedVersionIndex !== -1 && !expectedVersion) {
  console.error("Usage: --expect-version requires a value.");
  process.exit(1);
}

const baseUrl = new URL(args[urlArgIndex + 1]);
baseUrl.pathname = baseUrl.pathname.replace(/\/$/, "");
baseUrl.search = "";
baseUrl.hash = "";

const headerExpectations = [
  ["content-security-policy", "default-src 'self'"],
  ["strict-transport-security", "max-age=63072000"],
  ["x-content-type-options", "nosniff"],
  ["referrer-policy", "strict-origin-when-cross-origin"],
  ["x-frame-options", "DENY"],
  ["permissions-policy", "camera=()"]
];

const dashboardPromptChecks = [
  {
    name: "dallas_canvas_generation",
    prompt: "Show Dallas 311 service requests by category and ZIP code for 2024.",
    expect: (body) => {
      const blockTypes = body?.canvas?.blocks?.map((block) => block.type) ?? [];
      return {
        ok: Boolean(body?.canvas?.title?.includes("Dallas 311")) && blockTypes.includes("SourceMethodBlock"),
        reason: "Expected Dallas dashboard with required SourceMethodBlock."
      };
    }
  },
  {
    name: "austin_canvas_generation",
    prompt: "Show Austin building permits by month and ZIP code.",
    expect: (body) => {
      const blockTypes = body?.canvas?.blocks?.map((block) => block.type) ?? [];
      return {
        ok: Boolean(body?.canvas?.title?.includes("Austin Building Permits")) &&
          blockTypes.includes("SourceMethodBlock"),
        reason: "Expected Austin dashboard with required SourceMethodBlock."
      };
    }
  },
  {
    name: "unsupported_prompt_suggestions",
    prompt: "Show private phone numbers for bridge repairs on Mars.",
    expect: (body) => ({
      ok: Boolean(body?.canvas?.title?.includes("Choose") && body?.suggestedDatasets?.length > 0),
      reason: "Expected unsupported sensitive prompt to return dataset suggestions."
    })
  }
];

const checks = [
  {
    name: "health",
    path: "/api/health",
    kind: "json",
    expect: (body) => {
      const versionOk = expectedVersion ? body?.appVersion === expectedVersion : true;
      return {
        ok: body?.ok === true && typeof body?.catalogCount === "number" && versionOk,
        reason: expectedVersion && body?.appVersion !== expectedVersion
          ? `Expected appVersion ${expectedVersion}, received ${body?.appVersion ?? "missing"}.`
          : "Expected healthy runtime metadata."
      };
    }
  },
  {
    name: "catalog_health",
    path: "/api/catalog/health",
    kind: "json",
    expect: (body) => ({
      ok: Boolean(body?.health && body.health.status !== "failed"),
      reason: "Expected catalog health to be ok or degraded, not failed."
    })
  },
  {
    name: "datasets_api",
    path: "/api/datasets",
    kind: "json",
    expect: (body) => {
      const datasetIds = body?.datasets?.map((dataset) => dataset.id) ?? [];
      return {
        ok: datasetIds.includes("dallas_311_requests") && datasetIds.includes("austin_building_permits"),
        reason: "Expected datasets API to return Dallas and Austin approved datasets."
      };
    }
  },
  {
    name: "dataset_metadata",
    path: "/api/datasets/dallas_311_requests",
    kind: "json",
    expect: (body) => {
      const fields = body?.dataset?.fields?.map((field) => field.name) ?? [];
      return {
        ok: body?.dataset?.id === "dallas_311_requests" && fields.includes("category"),
        reason: "Expected Dallas dataset metadata with allowlisted category field."
      };
    }
  },
  {
    name: "query_endpoint",
    path: "/api/query",
    method: "POST",
    kind: "json",
    body: {
      schemaVersion: "1.0",
      datasetId: "dallas_311_requests",
      mode: "sample_only",
      filters: [{ field: "created_date", operator: "between", value: ["2024-01-01", "2024-12-31"] }],
      groupBy: ["category"],
      metrics: [{ type: "count", alias: "request_count" }],
      orderBy: [{ field: "request_count", direction: "desc" }],
      limit: 5
    },
    expect: (body) => ({
      ok: body?.result?.datasetId === "dallas_311_requests" &&
        Array.isArray(body?.result?.rows) &&
        body.result.rows.length > 0 &&
        Array.isArray(body?.audit?.safetyDecisions),
      reason: "Expected query endpoint to return bounded Dallas rows and audit decisions."
    })
  },
  {
    name: "explore_page",
    path: "/explore",
    kind: "text",
    expect: (body) => ({
      ok: body.includes("Texas Data Canvas") && body.includes("Ask about Texas public data"),
      reason: "Expected explore shell copy."
    })
  },
  {
    name: "sources_page",
    path: "/sources",
    kind: "text",
    expect: (body) => ({
      ok: body.includes("Texas public data sources") && body.includes("Approved catalog"),
      reason: "Expected sources catalog copy."
    })
  },
  {
    name: "saved_page",
    path: "/saved",
    kind: "text",
    expect: (body) => ({
      ok: body.includes("Saved canvases") && body.includes("Import saved canvas"),
      reason: "Expected saved canvases copy."
    })
  },
  {
    name: "gallery_page",
    path: "/gallery",
    kind: "text",
    expect: (body) => ({
      ok: body.includes("Validated sample canvases") && body.includes("Dallas 311 Sample Dashboard"),
      reason: "Expected curated gallery canvases to render."
    })
  },
  {
    name: "demo_readiness_page",
    path: "/demo-readiness",
    kind: "text",
    expect: (body) => ({
      ok: body.includes("Demo readiness") && body.includes("Known sample/live boundaries"),
      reason: "Expected demo readiness utility page to render."
    })
  },
  {
    name: "production_headers",
    path: "/explore",
    kind: "text",
    expect: (_body, response) => {
      const missing = headerExpectations.filter(([key, expected]) => {
        const value = response.headers.get(key) ?? "";
        return !value.includes(expected);
      });
      return {
        ok: missing.length === 0,
        reason: missing.length === 0
          ? "Expected production-safe headers are present."
          : `Missing or unexpected headers: ${missing.map(([key]) => key).join(", ")}.`
      };
    }
  },
  ...dashboardPromptChecks.map((promptCheck) => ({
    name: promptCheck.name,
    path: "/api/canvas/generate",
    method: "POST",
    kind: "json",
    body: {
      prompt: promptCheck.prompt,
      dataModePreference: "sample"
    },
    expect: promptCheck.expect
  }))
];

function checkUrl(path) {
  const url = new URL(baseUrl.toString());
  url.pathname = `${baseUrl.pathname}${path}`.replace(/\/+/g, "/");
  return url.toString();
}

async function fetchWithTimeout(url, init = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function fetchInit(check) {
  if (!check.body) {
    return { method: check.method ?? "GET" };
  }

  return {
    method: check.method ?? "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(check.body)
  };
}

function normalizeOutcome(outcome, defaultReason) {
  if (typeof outcome === "boolean") {
    return { ok: outcome, reason: defaultReason };
  }

  return {
    ok: Boolean(outcome?.ok),
    reason: outcome?.reason ?? defaultReason
  };
}

const results = [];

for (const check of checks) {
  const url = checkUrl(check.path);
  try {
    const response = await fetchWithTimeout(url, fetchInit(check));
    const contentType = response.headers.get("content-type") ?? "";
    const body = check.kind === "json" || contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    const outcome = normalizeOutcome(
      check.expect(body, response),
      "Deployment smoke check returned unexpected content."
    );
    const ok = response.ok && outcome.ok;
    results.push({
      checkedAt,
      name: check.name,
      url,
      status: response.status,
      ok,
      reason: ok ? "Deployment smoke check passed." : outcome.reason
    });
  } catch (error) {
    results.push({
      checkedAt,
      name: check.name,
      url,
      status: 0,
      ok: false,
      reason: error instanceof Error ? error.message : "Unknown deployment smoke failure."
    });
  }
}

const summary = {
  ok: results.every((result) => result.ok),
  total: results.length,
  passed: results.filter((result) => result.ok).length,
  failed: results.filter((result) => !result.ok).length,
  durationMs: Date.now() - startedAt,
  ...(expectedVersion ? { expectedVersion } : {})
};
const payload = {
  schemaVersion: "1.0",
  checkedAt,
  baseUrl: baseUrl.toString(),
  ...(expectedVersion ? { expectedVersion } : {}),
  summary,
  results
};

if (jsonMode) {
  console.log(JSON.stringify(payload, null, 2));
} else {
  for (const result of results) {
    const label = result.ok ? "OK" : "FAILED";
    console.log(`Deploy smoke ${label}: ${result.name} (${result.status}) ${result.url}. ${result.reason}`);
  }
  console.log(`Deploy smoke summary: ${summary.passed}/${summary.total} passed in ${summary.durationMs}ms.`);
}

if (results.some((result) => !result.ok)) {
  process.exit(1);
}
