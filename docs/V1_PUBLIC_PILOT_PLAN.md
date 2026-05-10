# Texas Data Canvas v1.0 Public Pilot Plan

Last updated: May 9, 2026

## Summary

The v1.0 public pilot starts from the locally verified v0.9 public-reliability branch. Hosted release tags for v0.6 through v0.9 remain operationally blocked in this repo context because there is no public Vercel URL, Git remote, or Vercel project linkage. The v1.0 branch therefore focuses on product proof that can be verified locally now and hosted later: one governed third dataset, clearer release readiness, and stronger public-demo surfaces without changing the safety model.

The project remains no-auth, no hosted database, no LLM dependency, no arbitrary generated HTML/JavaScript/SQL/SoQL, no external map layers, and no live Miro writes. Dashboards continue to render only validated `CanvasDocument` JSON through the allowlisted React block registry.

## Release Closeout Policy

Do not tag `v0.9.0-public-reliability` or `v1.0.0-public-pilot` until a public deployment passes:

- `pnpm smoke:deploy -- --url <public-url> --expect-version <release-version>`
- `PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote`
- Platform-level Vercel firewall/rate limiting confirmation.
- Clean `git status --short`.

Until then, release docs should record the operational blocker rather than creating a tag that implies public verification.

## v1.0 Scope

### 1. Houston Transportation Pilot

Houston transportation incidents is the single v1.0 third-dataset candidate. It is intentionally sample-first:

- Approved catalog metadata is present.
- The public source is documented as the City of Houston Active Incidents page.
- Exposed fields are classified before query use.
- `precise_address` is classified `sensitive_hide` and is not available to queries, exports, Miro previews, gallery canvases, or tables.
- A local fallback sample powers demos and tests.
- No live adapter is promoted until a stable source-owned API/schema is verified.
- Deterministic prompts can generate a governed Houston dashboard only after the bounded-query and canvas tests pass.

### 2. Public Readiness Surfaces

- `/demo-readiness` shows Dallas, Austin, and Houston dataset readiness in one compact panel.
- `/sources` explains whether each dataset is live-capable, sample-first, blocked, or coming later, including last verification notes.
- The canvas toolbar surfaces fallback/sample messaging near the user’s workflow, not only in the inspector.
- Deployment smoke covers Houston metadata, a bounded Houston sample query, and Houston canvas generation.

### 3. Governance Review

Every v1.0 addition must preserve:

- No dynamic rendering paths.
- No arbitrary external URLs.
- No unvalidated saved/hash/gallery import rendering.
- No sensitive field leakage in CSV, JSON, Miro, gallery, saved-canvas, or table output.
- No new query language.

## Verification Plan

Required before every commit:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm build`

Required before hosted release:

- `pnpm verify`
- `pnpm smoke:deploy -- --url http://localhost:<port>`
- `pnpm smoke:deploy:json -- --url http://localhost:<port>`
- Hosted smoke against the public URL.
- Remote Playwright against the public URL.

Local implementation verification passed on May 9, 2026:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test` — 49 unit/API/MCP tests passed.
- `pnpm build`
- `pnpm verify` — includes preflight, lint, typecheck, unit tests, build, live smoke, and 13 Playwright checks.
- `pnpm smoke:deploy -- --url http://localhost:3007` — 17/17 deployment smoke checks passed.
- `pnpm smoke:deploy:json -- --url http://localhost:3007` — summary reported `passed: 17`, `failed: 0`.

## Houston Test Checklist

- Catalog validation includes Houston metadata and sample fallback.
- Bounded Houston sample query grouped by incident type and ZIP succeeds.
- Invalid dataset, invalid field, unsupported operator, over-limit query, and hidden `precise_address` access are rejected.
- Generated Houston dashboard includes `SourceMethodBlock`.
- Houston gallery fixture validates before render.
- Browser smoke covers Houston prompt generation and mobile layout with no horizontal overflow.

## Assumptions

- Vercel remains the hosted target.
- Houston stays sample-first for v1.0 unless live access is separately verified.
- Dallas and Austin remain core demo flows.
- Texas spending stays deferred.
- Sample fallback remains mandatory for every live-enabled dataset.
