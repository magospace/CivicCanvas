# Optional Live Public API Smoke Evidence Template

Use this template only when an approved reviewer intentionally runs the network-dependent live public-data smoke command. The default demo and validation path remains no-network through `pnpm live:fallback-proof:json`.

## Evidence Boundary

Live smoke notes are not release evidence unless Task 35 intentionally reruns the full release gate for the intended commit and refreshes `docs/release-evidence.json`. Do not use this template to promote new live fields, change catalog mappings, edit samples, deploy, or mutate production data.

## Safe Default Proof

Run this no-network proof before any optional live smoke:

```bash
pnpm live:fallback-proof:json
```

Expected current boundaries:

- Dallas 311: limited live Socrata support for verified non-ZIP aggregate fields.
- Dallas ZIP dashboard: sample fallback remains expected because the verified live Socrata view does not expose ZIP.
- Austin monthly building permits: sample-first until a source-owned month grouping is safely verified.
- Houston transportation incidents: sample-first with precise locations excluded.

## Optional Network Smoke

Run only when live public API behavior is in scope and network access is acceptable:

```bash
pnpm smoke:live:json
```

## Smoke Session Metadata

- Reviewer: `[name or initials]`
- Date/time with timezone: `[YYYY-MM-DD HH:mm TZ]`
- Command run: `[pnpm live:fallback-proof:json / pnpm smoke:live:json]`
- Network used: `[no for fallback proof / yes for smoke:live]`
- Release evidence status: `not release evidence unless Task 35 runs`
- Catalog changed: `No`
- Sample files changed: `No`

## Result Notes

- Dallas non-ZIP live fields observed: `[fill from smoke output]`
- Dallas ZIP fallback still expected: `yes`
- Austin monthly live promotion: `no, sample-first unless future catalog proof changes this`
- Houston live promotion: `no, sample-first with precise locations excluded`
- Failures/timeouts: `[none or summarize]`
- Caveats to cite: `[source availability, rate limits, fallback behavior]`

## Do Not Claim

- Do not claim arbitrary live Texas public-data search.
- Do not claim Dallas ZIP live aggregation from the verified Socrata view.
- Do not claim Austin or Houston live dashboard promotion from this template.
- Do not claim current release evidence unless Task 35 completes.
- Do not paste secrets, private URLs, portal account data, or unrelated environment output.
