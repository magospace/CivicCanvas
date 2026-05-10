#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";

const jsonMode = process.argv.includes("--json");
const liveGateEnabled = process.env.RUN_LIVE_OPENAI_SMOKE === "1";
const apiKey = process.env.OPENAI_API_KEY?.trim() ?? "";
const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
const catalog = JSON.parse(readFileSync(join(process.cwd(), "data/catalog/approved-datasets.json"), "utf8"));
const datasets = Array.isArray(catalog) ? catalog : catalog.datasets;
const approvedDatasetIds = datasets.map((dataset) => dataset.id);
const prompt = "Show Dallas 311 service requests by category for 2024.";

function baseResult(overrides = {}) {
  return {
    ok: true,
    provider: "openai",
    status: "skipped_no_spend",
    liveGateEnabled,
    keyStatus: apiKey ? "present" : "missing",
    model,
    network: "not_used",
    liveCallCount: 0,
    serverSideOnly: true,
    secretEcho: false,
    mutatesFiles: false,
    writesArtifacts: false,
    prompt,
    approvedDatasetIds,
    validation: {
      schemaValid: false,
      catalogDatasetValid: false,
      fallbackSafe: true
    },
    boundaries: [
      "Default run is no-spend and no-network.",
      "Live mode requires RUN_LIVE_OPENAI_SMOKE=1 plus a server-side key.",
      "The live proof validates structured prompt-assist metadata only; it does not generate dashboards, SQL, code, or hidden-field output."
    ],
    ...overrides
  };
}

function emit(result, exitCode = 0) {
  if (jsonMode) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } else {
    process.stdout.write([
      `OpenAI smoke: ${result.status}`,
      `Network: ${result.network}`,
      `Live calls: ${result.liveCallCount}`,
      `Key status: ${result.keyStatus}`,
      `Model: ${result.model}`
    ].join("\n") + "\n");
  }
  process.exit(exitCode);
}

function validatePromptAssist(value) {
  if (!value || typeof value !== "object") {
    return { ok: false, reason: "result_not_object" };
  }
  const providerOk = value.provider === "openai";
  const modeOk = ["supported", "unsupported"].includes(value.mode);
  const candidatesOk = Array.isArray(value.datasetCandidates)
    && value.datasetCandidates.every((datasetId) => approvedDatasetIds.includes(datasetId));
  const shapeOk = ["approved_dataset_query", "catalog_discovery", "unsupported_refusal"].includes(value.supportedQueryShape);
  const textOk = typeof value.closestSupportedPrompt === "string"
    && typeof value.explanation === "string"
    && Array.isArray(value.caveats)
    && value.caveats.every((item) => typeof item === "string");
  const forbiddenText = JSON.stringify(value).toLowerCase();
  const safetyOk = !forbiddenText.includes("select ")
    && !forbiddenText.includes("precise_address")
    && !forbiddenText.includes("street address")
    && !forbiddenText.includes("<script");
  return {
    ok: providerOk && modeOk && candidatesOk && shapeOk && textOk && safetyOk,
    providerOk,
    modeOk,
    candidatesOk,
    shapeOk,
    textOk,
    safetyOk
  };
}

if (!liveGateEnabled) {
  emit(baseResult({
    status: "skipped_no_spend",
    validation: {
      schemaValid: false,
      catalogDatasetValid: false,
      fallbackSafe: true
    }
  }));
}

if (!apiKey) {
  emit(baseResult({
    ok: false,
    status: "blocked_missing_key",
    liveGateEnabled: true
  }), 1);
}

const requestBody = {
  model,
  response_format: { type: "json_object" },
  temperature: 0,
  messages: [
    {
      role: "system",
      content: [
        "Return only JSON for a CivicCanvas PromptAssistResult.",
        "Use provider=openai.",
        "Never return SQL, code, hidden fields, precise addresses, or datasets outside the approvedDatasetIds list."
      ].join(" ")
    },
    {
      role: "user",
      content: JSON.stringify({
        prompt,
        approvedDatasetIds,
        requiredShape: {
          provider: "openai",
          mode: "supported|unsupported",
          datasetCandidates: approvedDatasetIds,
          supportedQueryShape: "approved_dataset_query|catalog_discovery|unsupported_refusal",
          closestSupportedPrompt: "string",
          explanation: "string",
          blockedReason: "optional string",
          caveats: ["string"]
        }
      })
    }
  ]
};

try {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    emit(baseResult({
      ok: false,
      status: "live_request_failed",
      network: "used",
      liveCallCount: 1,
      validation: {
        schemaValid: false,
        catalogDatasetValid: false,
        fallbackSafe: true
      }
    }), 1);
  }

  const body = await response.json();
  const content = body?.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);
  const validation = validatePromptAssist(parsed);

  emit(baseResult({
    ok: validation.ok,
    status: validation.ok ? "live_validated" : "live_invalid_schema",
    network: "used",
    liveCallCount: 1,
    validation: {
      schemaValid: validation.ok,
      catalogDatasetValid: Boolean(validation.candidatesOk),
      fallbackSafe: !validation.ok,
      providerOk: Boolean(validation.providerOk),
      modeOk: Boolean(validation.modeOk),
      shapeOk: Boolean(validation.shapeOk),
      textOk: Boolean(validation.textOk),
      safetyOk: Boolean(validation.safetyOk)
    },
    result: validation.ok ? {
      provider: parsed.provider,
      mode: parsed.mode,
      datasetCandidates: parsed.datasetCandidates,
      supportedQueryShape: parsed.supportedQueryShape,
      caveatCount: parsed.caveats.length
    } : undefined
  }), validation.ok ? 0 : 1);
} catch {
  emit(baseResult({
    ok: false,
    status: "live_exception",
    network: "used",
    liveCallCount: 1,
    validation: {
      schemaValid: false,
      catalogDatasetValid: false,
      fallbackSafe: true
    }
  }), 1);
}
