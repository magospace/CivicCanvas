# Hackathon Demo Readiness Checklist

Use this checklist before a local judge demo. It is intentionally local-first and does not refresh `docs/release-evidence.json`.

## Quick Local Gate

Run these from the repo root:

```bash
git status --short --branch
pnpm demo:readiness:snapshot:json
pnpm lint
pnpm typecheck
pnpm test
```

Expected result:

- The working tree is clean or contains only intentional demo-doc changes.
- `pnpm demo:readiness:snapshot:json` emits a no-network, non-mutating JSON summary of sample counts, live/fallback proof pointers, media-proof boundaries, release-evidence status, and known blockers.
- `pnpm lint` passes. The known `next lint` deprecation notice may still appear.
- Typecheck and Vitest pass without requiring secrets, hosted URLs, live API access, or production data.

## Demo Flow Smoke

Start the local app:

```bash
pnpm dev
```

Open `http://localhost:3000/explore` and walk these routes:

1. `/sources`: verify Dallas, Austin, and Houston sources appear with live/sample notes and hidden-field warnings.
2. `/explore`: generate the Dallas prompt and confirm `Live unavailable, sample fallback used` is visible.
3. `/explore`: generate the Austin and Houston prompts and confirm sample/fallback caveats stay visible.
4. `/explore`: submit an unsupported sensitive prompt and confirm approved dataset suggestions appear.
5. `/saved`: save a Dallas canvas locally, export a bundle, copy a share link, and confirm invalid JSON import is rejected.
6. `/gallery`: confirm checked-in sample canvases render.
7. `/demo-readiness`: confirm catalog health, sample data quality, hosted blockers, and known sample/live boundaries are visible.

Core prompts:

```text
Show Dallas 311 service requests by category and ZIP code for 2024.
Show Austin building permits by month and ZIP code for 2024.
Show Houston transportation incidents by ZIP and incident type for 2024.
```

## Optional Local Browser Check

Run when browser workflow confidence matters or after visible route/copy changes:

```bash
pnpm test:e2e
```

This starts a local Playwright server when `PLAYWRIGHT_BASE_URL` is unset.

## Optional Data Governance Checks

Run when demo claims mention catalog/sample quality, gallery fixtures, or live/fallback boundaries:

```bash
pnpm governance:audit
pnpm data:quality
```

Expected result:

- Governance checks pass, though release evidence may still warn if `docs/release-evidence.json` points at a historical commit.
- Data quality reports three fallback sample datasets and the expected local row counts.

## Network Or Hosted Checks

Skip these unless the demo explicitly needs live/hosted proof:

```bash
pnpm smoke:live
pnpm smoke:deploy -- --url <running-url>
PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote
```

These checks are network- or environment-dependent. They should not be required for a local hackathon demo.

If you do run hosted smoke checks for an already-deployed URL, record results with `docs/HOSTED_SMOKE_TEMPLATE.md`. Those notes are not release evidence and must not mutate deployment config or refresh `docs/release-evidence.json`.

## Hosted Rate-Limit Boundary

Local judge demos can rely on the local gate, Playwright coverage, and the in-repo middleware as defense-in-depth for write-like POST routes. Do not present that middleware as distributed hosted abuse protection.

Before broad public sharing of a hosted URL, configure platform-level firewall/rate limiting outside this repo and record the provider-specific proof in a dedicated hosted-readiness task. No Vercel firewall, WAF, bot protection, or edge rate-limit rule is currently claimed as implemented by this checklist.

## Release Evidence Boundary

Do not update `docs/release-evidence.json` from this checklist.

Release evidence refresh belongs to `TASKS.md` item 35 and requires a clean or intentionally reviewed tree plus the full validation gate for the intended commit. Treat checked-in release evidence as historical until that task runs.

## Presenter Reminders

- Saved canvases are browser-local and share links use URL hashes.
- The core demo dashboards rely on sample/fallback truth for Dallas ZIP, Austin monthly grouping, and Houston transportation.
- Miro export is preview-only JSON; there is no OAuth flow or board write.
- Prompt handling is deterministic and rule-based; no LLM/provider call is required for the local demo.
- Public hosted abuse protection still needs platform-level firewall/rate limiting before broad sharing.
