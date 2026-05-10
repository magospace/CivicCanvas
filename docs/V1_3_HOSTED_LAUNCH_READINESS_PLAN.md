# Texas Data Canvas v1.3 Hosted Launch Readiness Plan

`v1.3.0-hosted-launch-readiness` starts from locally verified `feat/v1.2-hosted-trust`. v1.2 remains locally complete but untagged because this repo context still has no public Vercel URL, Git remote, or Vercel project linkage for hosted smoke and remote Playwright verification.

This milestone focuses on deployment handoff, release evidence, demo confidence, data quality, and launch-readiness checks. It does not add auth, hosted database persistence, KV, LLM parsing, arbitrary generated UI/query execution, external map layers, or live Miro writes.

## Deployment Handoff Checklist

- Create or link the Vercel project for `apps/web`.
- Install from the repo root with `pnpm install --frozen-lockfile`.
- Build with `pnpm --filter @texas-data-canvas/web build`.
- Set `NEXT_PUBLIC_APP_ENV=hosted-beta`.
- Set `NEXT_PUBLIC_APP_VERSION=v1.3.0-hosted-launch-readiness`.
- Optionally set `NEXT_PUBLIC_SITE_URL=<public-url>`.
- Enable Vercel firewall/rate limits before broad public sharing.
- Run `pnpm smoke:deploy -- --url <public-url> --expect-version v1.3.0-hosted-launch-readiness`.
- Run `PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote`.
- Record hosted results in `docs/release-evidence.json` before tagging.

## Release Evidence

`docs/release-evidence.json` is the checked-in evidence surface for release reviewers and `/demo-readiness`. It records release version, branch, commit placeholder, local gates, production-local status, governance audit status, hosted status, and recommended screenshot paths.

## Vercel Output Verification

Run `vercel build` when credentials/project linkage are available, then run:

```bash
pnpm verify:vercel-output
```

The check is non-network and safe without credentials. If `.vercel/output` is absent, it reports a skipped output inspection while still scanning tracked files for `.vercel/project.json`, Vercel tokens, org IDs, and project IDs.

## Data Quality And Governance

`pnpm governance:audit` now checks fallback samples, hidden-field leakage, SourceMethodBlock coverage, catalog caveats, sample dataset ID consistency, gallery source references, SourceMethodBlock caveats, governance limits, package versions, and active-release docs.

`pnpm data:quality` reports sample row counts, date ranges, missing ZIP rows, top categories, and top statuses for Dallas, Austin, and Houston.

## Houston TranStar Boundary

Houston remains sample-first. Live promotion requires the separate Houston TranStar access packet, source-owner approval, documented terms, aggregate-safe field mapping, hidden precise-location handling, and retained sample fallback.

## Local Gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm governance:audit
pnpm data:quality
pnpm verify
pnpm verify:prod-local
pnpm release:check
```

## Hosted Gates

```bash
pnpm smoke:deploy -- --url <public-url> --expect-version v1.3.0-hosted-launch-readiness
PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote
```

## Release Result

Pending. No public URL, Git remote, or Vercel project linkage is available in this repo context.
