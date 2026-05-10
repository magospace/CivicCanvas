# Texas Data Canvas v1.1 Product Depth Plan

Last updated: May 10, 2026

## Summary

v1.1 starts from the locally verified `feat/v1-public-pilot` branch at `d4bad42`. v1.0 remains locally complete but untagged because this repo context still has no public Vercel URL, Git remote, or Vercel project linkage for hosted smoke and remote Playwright verification.

This milestone deepens the Dallas, Austin, and Houston public-pilot experience without adding infrastructure. The project remains no-auth, no hosted database, no KV dependency, no LLM prompt parser, no arbitrary generated HTML/JavaScript/SQL/SoQL, no external map layers, and no live Miro board writes. Dashboards continue to render only validated `CanvasDocument` JSON through the allowlisted React block registry.

## Hosted Release Policy

Do not tag `v1.0.0-public-pilot` or `v1.1.0-product-depth` until a public deployment passes:

- `pnpm smoke:deploy -- --url <public-url> --expect-version <release-version>`
- `PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote`
- Platform-level Vercel firewall/rate limiting confirmation.
- Clean `git status --short`.

If a public URL becomes available for v1.0 first, build with:

```bash
NEXT_PUBLIC_APP_ENV=hosted-beta \
NEXT_PUBLIC_APP_VERSION=v1.0.0-public-pilot \
pnpm --filter @texas-data-canvas/web build
```

If v1.1 is the next verified hosted build, use `NEXT_PUBLIC_APP_VERSION=v1.1.0-product-depth`.

## Houston Live Verification Boundary

Houston transportation remains sample-first in v1.1. The verification pass uses official/source-owned pages only:

- Houston TranStar documents HTTPS JSON feeds and provides sample incident JSON.
- Houston TranStar states that live data-feed access requires contacting TranStar.
- The City of Houston Active Incidents page is a current-state, auto-refreshing public surface rather than a bounded dataset API for this app.
- Precise locations, exact addresses, and exact coordinates remain excluded from dashboards and exports.

Live promotion is blocked until all of these are true:

- A stable official API endpoint or compatible dataset exists.
- Field names and source terms are documented.
- Aggregate-safe fields map to approved catalog fields.
- Precise addresses or exact coordinates are excluded, generalized, or classified `sensitive_hide`.
- Bounded aggregate queries succeed for incident type, status, month/date, and approved geography.
- Static sample fallback remains available.

## v1.1 Scope

### 1. Product Depth

- Improve Houston dashboard copy so reviewers see sample-first status in the canvas workflow, not only in the inspector.
- Keep Houston within the existing 10-block dashboard governance limit by replacing the dataset card with a status breakdown chart.
- Make Houston map and table caveats explicit that precise incident locations are excluded.
- Improve `/demo-readiness` with a Houston live verification card, source docs link, last checked date, blocker reasons, and next verification command.
- Improve `/sources` with hidden-field copy explaining why `precise_address` is not queryable or exportable.

### 2. Prompt Governance

- Expand sensitive/raw prompt detection for exact address, street address, precise address, exact location, precise location, raw location, and raw incident phrasing.
- Houston prompts that request exact addresses, personal details, or raw incident locations must return suggestion/refusal mode instead of a generated dashboard.
- Prompt transparency should still show matched terms, reason codes, selected query mode, rejected fields, safety warnings, and the generated `BoundedQuerySpec` when generation is allowed.

### 3. MCP And Export Parity

- Keep MCP tool names and valid response shapes compatible.
- Ensure MCP sample queries work for Houston.
- Add tests for Houston metadata, sample fallback queries, hidden `precise_address` rejection, generated canvas attribution, and sample-first source caveats.
- Confirm CSV, Canvas JSON, saved bundle, URL-hash sharing, gallery, and Miro preview do not expose `precise_address`.

## Verification Plan

Required before every commit:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Required before local closeout:

- `pnpm verify`
- `pnpm smoke:deploy -- --url http://localhost:<port>`
- `pnpm smoke:deploy:json -- --url http://localhost:<port>`
- Browser smoke for `/explore`, `/sources`, `/saved`, `/gallery`, and `/demo-readiness`.

Required before hosted tag:

- Hosted deployment smoke against the public URL.
- Remote Playwright against the public URL.
- Platform firewall/rate-limit confirmation.

## Current Decision

Houston is not live-promoted in v1.1. It remains sample-first because official TranStar documentation provides sample feeds and describes live feed access, but does not expose a public live endpoint that can be verified and bounded in this repo without a separate access process.

## Local Verification Result

Local verification passed on May 9, 2026:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` — 52 tests passed.
- `pnpm build`
- `pnpm verify` — preflight, live smoke, build, and 14 Playwright checks passed.
- `pnpm smoke:deploy -- --url http://127.0.0.1:3008` — 17/17 checks passed.
- `pnpm smoke:deploy:json -- --url http://127.0.0.1:3008` — `passed: 17`, `failed: 0`.
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3008 pnpm test:e2e:remote` — 14 checks passed.

Hosted tagging remains blocked until a real public URL passes hosted smoke and remote Playwright and platform-level firewall/rate limiting is confirmed.

## Assumptions

- Vercel remains the hosted target.
- Houston sample-first status is acceptable if the live boundary is documented and visible.
- Dallas and Austin remain core demo flows.
- Texas spending stays deferred.
- Sample fallback remains mandatory for every live-enabled dataset.
