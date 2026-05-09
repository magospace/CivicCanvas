const args = process.argv.slice(2);
const urlArgIndex = args.indexOf("--url");
const jsonMode = args.includes("--json");
const checkedAt = new Date().toISOString();

if (urlArgIndex === -1 || !args[urlArgIndex + 1]) {
  console.error("Usage: pnpm smoke:deploy -- --url <base-url> [--json]");
  process.exit(1);
}

const baseUrl = new URL(args[urlArgIndex + 1]);
baseUrl.pathname = baseUrl.pathname.replace(/\/$/, "");
baseUrl.search = "";
baseUrl.hash = "";

const checks = [
  {
    name: "health",
    path: "/api/health",
    kind: "json",
    expect: (body) => body && body.ok === true && typeof body.catalogCount === "number"
  },
  {
    name: "catalog_health",
    path: "/api/catalog/health",
    kind: "json",
    expect: (body) => body?.health && body.health.status !== "failed"
  },
  {
    name: "explore_page",
    path: "/explore",
    kind: "text",
    expect: (body) => body.includes("Texas Data Canvas") && body.includes("Ask about Texas public data")
  },
  {
    name: "sources_page",
    path: "/sources",
    kind: "text",
    expect: (body) => body.includes("Texas public data sources") && body.includes("Approved catalog")
  },
  {
    name: "saved_page",
    path: "/saved",
    kind: "text",
    expect: (body) => body.includes("Saved canvases") && body.includes("Import saved canvas")
  }
];

function checkUrl(path) {
  const url = new URL(baseUrl.toString());
  url.pathname = `${baseUrl.pathname}${path}`.replace(/\/+/g, "/");
  return url.toString();
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

const results = [];

for (const check of checks) {
  const url = checkUrl(check.path);
  try {
    const response = await fetchWithTimeout(url);
    const contentType = response.headers.get("content-type") ?? "";
    const body = check.kind === "json" || contentType.includes("application/json")
      ? await response.json()
      : await response.text();
    const ok = response.ok && check.expect(body);
    results.push({
      checkedAt,
      name: check.name,
      url,
      status: response.status,
      ok,
      reason: ok ? "Deployment smoke check passed." : "Deployment smoke check returned unexpected content."
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

if (jsonMode) {
  console.log(JSON.stringify({ schemaVersion: "1.0", checkedAt, baseUrl: baseUrl.toString(), results }, null, 2));
} else {
  for (const result of results) {
    const label = result.ok ? "OK" : "FAILED";
    console.log(`Deploy smoke ${label}: ${result.name} (${result.status}) ${result.url}. ${result.reason}`);
  }
}

if (results.some((result) => !result.ok)) {
  process.exit(1);
}
