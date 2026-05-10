# Texas Data Canvas v1.2 Hosted Trust Plan

`v1.2.0-hosted-trust` starts from the locally verified `feat/v1.1-product-depth` branch. v1.1 remains locally complete but untagged because this repo context still has no public Vercel URL, Git remote, or Vercel project linkage for hosted smoke and remote Playwright verification.

The milestone focuses on release trust and repeatable verification, not new infrastructure. The product remains no-auth, no hosted database, no KV, no LLM parser, no arbitrary generated UI/query execution, no external map layers, and no live Miro writes.

## Release Policy

Do not backfill older hosted tags unless explicitly requested. Tag only the latest release that passes:

- `pnpm smoke:deploy -- --url <public-url> --expect-version v1.2.0-hosted-trust`
- `PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote`
- platform-level Vercel firewall/rate limiting confirmation
- clean `git status --short`

If no public URL exists, keep `v1.2.0-hosted-trust` untagged and document the hosted blocker.

## v1.2 Scope

- Centralize release metadata in `@texas-data-canvas/shared` so package versions, health responses, MCP status, scripts, and docs converge on `v1.2.0-hosted-trust`.
- Add production-local verification with `pnpm verify:prod-local`, which builds the web app, starts `next start`, runs deployment smoke against localhost, then runs remote-mode Playwright against the same production server.
- Add `pnpm governance:audit` and `pnpm governance:audit:json` for deterministic release dashboards and preflight checks.
- Make `/demo-readiness` show release proof: branch, commit, app version, package version, local gate notes, and hosted status.
- Add v1.2 release-gate copy actions and an `/explore` known-boundaries accordion.

## Governance Audit Requirements

The audit checks:

- every `liveAvailable: true` dataset keeps a fallback sample file
- every checked gallery/generated canvas JSON includes `SourceMethodBlock`
- hidden field identifiers such as `precise_address` do not appear in gallery canvases, extra canvas fixtures, sample row keys, Miro/export fixtures, or table data
- documented governance limits match the code constants
- root, web, MCP, and shared package versions match `1.2.0`
- `/api/health` and MCP status consume shared release metadata
- README, PLAN, implementation status, release notes, and this plan reference `v1.2.0-hosted-trust`

## Houston TranStar Access Request Checklist

Houston stays sample-first until official live access is obtained and safely bounded. Before any live promotion:

- contact/source owner and document the approved access channel
- confirm terms of use permit public dashboard aggregation
- confirm allowed fields and refresh cadence
- classify precise locations, exact coordinates, and addresses as hidden or generalized
- map aggregate-safe fields to the catalog (`incident_type`, `status`, `reported_date`, `month`, `zip_code` or another approved geography)
- verify bounded aggregates for type, status, month/date, and geography
- keep the current fallback sample available
- update `/sources`, `/demo-readiness`, release notes, and smoke-live coverage only after the catalog metadata is verified

## Local Release Gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm governance:audit
pnpm verify
pnpm verify:prod-local
```

## Hosted Release Gates

```bash
pnpm smoke:deploy -- --url <public-url> --expect-version v1.2.0-hosted-trust
PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote
```

## Release Result

Local verification passed on May 9, 2026:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` — 54 tests passed.
- `pnpm build`
- `pnpm governance:audit` — 8/8 checks passed.
- `pnpm verify` — preflight, live smoke, and 14 Playwright checks passed.
- `pnpm verify:prod-local` — production build, `next start`, 17/17 deploy smoke checks, and 14 remote-mode Playwright checks passed against localhost.

Hosted release remains blocked. No public URL, Git remote, or Vercel project linkage is available in this repo context, so no `v1.2.0-hosted-trust` tag has been created.
