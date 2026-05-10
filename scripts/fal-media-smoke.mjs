const jsonMode = process.argv.includes("--json");
const liveGate = process.env.RUN_LIVE_FAL_SMOKE === "1";
const falKey = process.env.FAL_KEY || process.env.FAL_API_KEY || "";
const model = process.env.FAL_SMOKE_MODEL || "fal-ai/fast-sdxl";
const endpoint = `https://queue.fal.run/${model}`;

function redact(value) {
  if (!value) return "";
  return "[REDACTED]";
}

function print(output) {
  if (jsonMode) {
    console.log(JSON.stringify(output, null, 2));
    return;
  }
  console.log(`Fal media smoke: ${output.status}`);
  console.log(`- live gate: ${output.liveGateEnabled ? "enabled" : "disabled"}`);
  console.log(`- app media wiring: ${output.appMediaWiring}`);
  console.log(`- live call count: ${output.liveCallCount}`);
  if (output.reason) console.log(`- reason: ${output.reason}`);
  if (output.artifact?.url) console.log(`- artifact url: ${output.artifact.url}`);
}

function baseOutput(overrides = {}) {
  return {
    schemaVersion: "1.0",
    ok: true,
    status: "skipped_no_spend",
    provider: "fal",
    liveGateEnabled: liveGate,
    appMediaWiring: "not_implemented_dashboard_ui_only",
    note: "Texas Data Canvas does not generate app media artifacts by default; this script is an optional provider-gated proof path.",
    requiredGate: "RUN_LIVE_FAL_SMOKE=1",
    acceptedKeyEnv: ["FAL_KEY", "FAL_API_KEY"],
    keyPresent: Boolean(falKey),
    keyEcho: redact(falKey),
    model,
    liveCallCount: 0,
    ...overrides
  };
}

async function runLiveProof() {
  if (!falKey) {
    const output = baseOutput({
      ok: false,
      status: "blocked_missing_key",
      reason: "RUN_LIVE_FAL_SMOKE=1 was set, but FAL_KEY or FAL_API_KEY is missing. No provider call was made."
    });
    print(output);
    process.exitCode = 1;
    return;
  }

  const prompt = process.env.FAL_SMOKE_PROMPT || "Minimal Texas public data dashboard thumbnail, simple civic map and bar chart, no text, clean vector style";
  const startedAt = new Date().toISOString();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Key ${falKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      prompt,
      image_size: "square_hd",
      num_inference_steps: 4,
      num_images: 1,
      enable_safety_checker: true
    })
  });

  let body = null;
  const text = await response.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text.slice(0, 500) };
  }

  const artifactUrl = body?.images?.[0]?.url ?? body?.image?.url ?? body?.url ?? null;
  const output = baseOutput({
    ok: response.ok,
    status: response.ok ? "live_proof_completed" : "live_proof_failed",
    endpoint: endpoint.replace(model, "[MODEL]"),
    httpStatus: response.status,
    startedAt,
    completedAt: new Date().toISOString(),
    liveCallCount: 1,
    artifact: artifactUrl ? { url: artifactUrl } : null,
    responseShape: body && typeof body === "object" ? Object.keys(body).slice(0, 20) : []
  });

  print(output);
  if (!response.ok) process.exitCode = 1;
}

if (!liveGate) {
  print(baseOutput({
    reason: "RUN_LIVE_FAL_SMOKE is not set to 1, so no Fal request was made."
  }));
} else {
  await runLiveProof();
}
