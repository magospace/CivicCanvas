# Local Submission Command Transcript Skeleton

Use this paste-safe template when preparing the CivicCanvas hackathon submission or a reviewer handoff. It is a skeleton for human-copied command output; do not paste secrets, `.env` values, provider dashboard screenshots, or generated artifacts here.

## Redaction Rules

- Replace any local username, private path segment, token, key, request ID, deployment URL, or account identifier with `<redacted>` unless it is already a public repo URL.
- Do not paste `.env`, `.env.local`, provider dashboard, Vercel project, or billing output.
- Keep live provider proof separate and explicitly labeled if a gated live command was intentionally run.
- Do not update `docs/release-evidence.json` from this transcript. Release evidence remains historical until an intentional release gate refresh.

## Repo State

```bash
git status --short --branch
```

Expected local-only note:

```text
## feat/v1.3-hosted-launch-readiness...origin/main [ahead <N>]
?? REVIEW_RECOMMENDATIONS.md
?? clauderecommends.md
```

The untracked recommendation files above are external inputs intentionally left untracked unless a future task explicitly adopts them.

## No-Spend Local Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm governance:audit
pnpm data:quality
pnpm test:e2e -- tests/e2e/product-demo.spec.ts
pnpm submission:todo-scan
pnpm docs:links
```

Paste summarized results here:

```text
pnpm lint: passed
pnpm typecheck: passed
pnpm test: passed, <count> tests across <count> files
pnpm governance:audit: passed 19/19 checks; expected warning that docs/release-evidence.json records historical commit a5ce07a while current HEAD is newer
pnpm data:quality: passed, 3 samples, 280 rows, 4 gallery canvases
pnpm test:e2e -- tests/e2e/product-demo.spec.ts: passed, 21/21 browser tests
pnpm submission:todo-scan: passed, 0 issues
pnpm docs:links: passed, local markdown links resolved
```

## Demo Route Proof

Local URL for the Loom:

```text
http://localhost:3000/explore
```

Core route sequence:

1. `/sources` — show Dallas, Austin, Houston approved sources and caveats.
2. `/explore` — run `Show Dallas 311 service requests by category and ZIP code for 2024.`
3. `/saved` — save locally, edit title/prompt, reopen, export/share hash bundle, and delete/duplicate if useful.
4. `/gallery` — show checked-in validated canvases loaded through gallery fixtures.
5. `/demo-readiness` — show local boundaries, provider/no-key status, and historical release-evidence warning.

## Provider And Live Call Summary

```text
Live API calls: 0 unless explicitly listed below.
OpenAI calls: 0 unless RUN_LIVE_OPENAI_SMOKE=1 was intentionally run.
Fal/media calls: 0 unless RUN_LIVE_FAL_SMOKE=1 was intentionally run.
```

If a live gated proof is intentionally run, paste only redacted readiness metadata here. Do not paste secrets, raw provider responses containing account data, or generated media URLs unless they are intended public artifacts.

## Public URL / Hosted Boundary

```text
Public deployed URL: TODO unless pnpm smoke:deploy passed against the exact public URL.
Hosted smoke command: pnpm smoke:deploy -- --url <public-url> --expect-version v1.3.0-hosted-launch-readiness
```

Until the hosted smoke passes, cite the local Loom and local URL only.

## Release Evidence Boundary

`docs/release-evidence.json` is historical evidence for commit `a5ce07a...`, not current HEAD proof. Do not cite it as current release proof unless Task 35 or an equivalent intentional release-evidence refresh reruns the full gate for the intended commit.
