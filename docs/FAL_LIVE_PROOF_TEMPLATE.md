# Fal Live Proof Result Template

Use this template only when an approved reviewer intentionally runs one minimal Fal smoke call through the env-gated script. The normal Texas Data Canvas app does not generate image/video/media artifacts during dashboard generation.

## Boundary Statement

This template records an optional provider proof for `scripts/fal-media-smoke.mjs`. It is not app media-generation evidence unless a future task explicitly wires media generation into the product. Do not commit provider secrets, `.env` files, billing details, or generated media artifacts unless a separate task explicitly approves artifact handling.

## Required Gate

No-spend dry run:

```bash
pnpm media:fal:smoke:json
```

Approved one-call live proof:

```bash
RUN_LIVE_FAL_SMOKE=1 FAL_KEY=<redacted> pnpm media:fal:smoke:json
```

The live command should make at most one minimal provider call. Stop if billing risk, credential scope, provider terms, or artifact handling is unclear.

## Result Metadata

- Reviewer: `[name or initials]`
- Date/time with timezone: `[YYYY-MM-DD HH:mm TZ]`
- Approval source: `[who approved the live call]`
- Command run: `[dry run / live gated command]`
- Model: `[from output, default fal-ai/fast-sdxl unless changed]`
- Prompt class: `Minimal civic dashboard thumbnail proof; no user/private data`
- Approximate live call count: `[0 or 1]`
- HTTP status: `[if live call was run]`
- Result status: `[skipped_no_spend / live_proof_completed / live_proof_failed / blocked_missing_key]`
- App media wiring status: `not_implemented_dashboard_ui_only`

## Redaction Checklist

Before saving any notes or sharing output, verify:

- `FAL_KEY`, `FAL_API_KEY`, and any provider key values are not visible.
- Output contains `[REDACTED]` or omits secret values entirely.
- No `.env` file contents are copied.
- No shell history line with a real key is pasted.
- No OpenAI/Anthropic/model-provider keys are visible.
- No billing account IDs, dashboards, or invoices are included.
- Artifact URLs are treated as public/ephemeral unless provider docs say otherwise.

## Artifact Handling

- Generated artifact URL: `[redacted / omitted / URL if approved to share]`
- Local file downloaded: `[no by default]`
- Committed to repo: `No, unless a separate generated-media task explicitly approves it.`
- Used in submission: `[yes/no, with caveat]`

Recommended wording if cited:

> We ran an optional env-gated Fal smoke proof separately from the app. Normal dashboard generation still renders validated dashboard UI and does not call Fal or generate media artifacts.

## Output Summary

Paste sanitized JSON summary only:

```json
{
  "status": "[fill]",
  "liveGateEnabled": true,
  "appMediaWiring": "not_implemented_dashboard_ui_only",
  "liveCallCount": 1,
  "keyEcho": "[REDACTED]"
}
```

## Follow-Up

- If the proof failed, record whether failure was missing key, provider response, network issue, or unclear billing risk.
- If generated media should become a product feature, create a new architecture task for server-side provider calls, storage/ownership, cost controls, moderation, UI copy, and tests.
- Do not update release evidence from this template.
