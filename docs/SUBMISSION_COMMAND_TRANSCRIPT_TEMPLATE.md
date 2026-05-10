# Submission Command Transcript Template

Use this template when pasting final validation evidence into a submission note, README snippet, or reviewer handoff. It is designed for safe summaries, not raw terminal dumps.

## Redaction Rules

Before sharing any transcript:

- Replace local user paths with `[repo-root]`.
- Do not paste `.env` contents, shell history, provider keys, auth tokens, signed URLs, billing pages, private dashboards, or personal browser data.
- Keep generated screenshots/videos/provider artifacts as local or external references unless a task explicitly approves committing them.
- Summarize long command output; do not paste unrelated environment dumps.

## Local No-Spend Command Summary

```text
git status --short --branch
[result: branch/status summary]

pnpm submission:readiness:json
[result: ok / known todos / gated checks not run]

pnpm demo:readiness:snapshot:json
[result: ok / no network / no mutation / known blockers]

pnpm lint
[result]

pnpm typecheck
[result]

pnpm test
[result]

pnpm governance:audit
[result]

pnpm data:quality
[result]

pnpm live:fallback-proof:json
[result: no-network Dallas/Austin/Houston boundary proof]

pnpm media:fal:smoke:json
[result: skipped_no_spend / liveCallCount 0]

pnpm release:evidence:precheck:json
[result: current_for_head or historical_not_current_head]

pnpm demo:artifact-hygiene:json
[result: generated artifacts ignored / none staged]
```

## Optional Hosted/Live Evidence

Only fill these in if intentionally run. Leave as `not run` otherwise.

```text
pnpm smoke:deploy -- --url <hosted-url> --expect-version <expected-version>
[result: not run / pass / fail summary]

PLAYWRIGHT_BASE_URL=<hosted-url> pnpm test:e2e:remote
[result: not run / pass / fail summary]

pnpm smoke:live:json
[result: not run / pass / fail summary]

RUN_LIVE_FAL_SMOKE=1 FAL_KEY=<redacted> pnpm media:fal:smoke:json
[result: not run / one-call live proof summary]
```

## Caveats To Keep With Transcript

- This transcript is not release evidence unless Task 35 reruns the full release gate and refreshes `docs/release-evidence.json`.
- Hosted smoke notes are not deployment proof unless the exact public URL was tested.
- Live API smoke does not promote unsupported catalog fields.
- Fal smoke is script-level proof and separate from normal dashboard rendering.
- Saved canvases remain browser-local unless a future approved backend-persistence task changes the architecture.
