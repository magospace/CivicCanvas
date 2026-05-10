# Catalog Onboarding Checklist

Use this checklist before adding or promoting a dataset in `data/catalog/approved-datasets.json`. It is a planning and review checklist only; it does not authorize catalog mutation, live API promotion, production data handling, or backend persistence work by itself.

## 1. Source And Terms Review

- Record the official source owner, portal URL, endpoint URL, and dataset title.
- Confirm the dataset is public and appropriate for a no-account civic-data demo.
- Record license, terms of use, attribution requirements, and update cadence.
- Note the last source review date and who reviewed it.
- Do not promote source-owned freshness claims until the source terms and update cadence are checked.

## 2. Field Classification

Classify every field before it is used by prompts, queries, dashboards, MCP tools, samples, or exports:

| Classification | Use |
|---|---|
| `safe_public` | Public fields that can be shown directly in bounded dashboards. |
| `safe_with_aggregation` | Fields that may appear only after grouping, counting, bucketing, or otherwise reducing precision. |
| `sensitive_hide` | Fields that must not appear in samples, dashboards, exports, prompt suggestions, MCP outputs, or Miro preview specs. |
| `unknown_review` | Fields blocked until a human review classifies them. |

Required review questions:

- Does any field contain names, phone numbers, emails, free-text reports, precise addresses, exact coordinates, case notes, or other sensitive details?
- Can geography be safely bucketed to ZIP, district, tract, or another approved aggregation?
- Are date/time values safe at the proposed granularity?
- Are filters and groupings limited to catalog-owned allowlisted fields?

## 3. Live API Verification

Before setting or keeping a dataset/field as live-ready:

- Verify the exact endpoint and field names with a small read-only request.
- Confirm the promoted aggregate can be queried without exposing hidden fields.
- Confirm row limits and bounded grouping behavior.
- Record whether the live path supports every intended prompt dimension; if not, keep unsupported views sample-first.
- Keep deterministic sample fallback even when a live path is promoted.
- Prefer `pnpm live:fallback-proof:json` for no-network proof; use `pnpm smoke:live:json` only when a network proof is intentionally approved.

## 4. Sample Fallback Requirements

- Add or update a deterministic sample file under `data/samples/` only when the task explicitly includes data mutation.
- Ensure samples are synthetic/schema-aligned or otherwise clearly documented; do not imply complete source-owned production extracts.
- Exclude every `sensitive_hide` field.
- Include enough rows to exercise expected charts, maps, filters, tables, source/method caveats, and fallback copy.
- Run data-quality checks before claiming the sample is ready.

## 5. Dashboard, MCP, And Export Boundaries

- Update prompt parsing only for explicitly supported prompt patterns.
- Validate every query with `BoundedQuerySpec` and preserve query audit metadata.
- Render dashboards only through approved `CanvasDocument` blocks.
- Keep `SourceMethodBlock` attribution and caveats visible.
- Keep MCP tools bounded and catalog-validated.
- Keep Miro output preview-only unless a separate approved auth/write task implements real Miro integration.

## 6. Required Validation Before Merge

Run the smallest relevant set for the actual change, then record results in `TASKS.md` and `HERMES_PROGRESS.md`:

```bash
pnpm governance:audit
pnpm data:quality
pnpm test
pnpm lint
pnpm typecheck
```

Add focused dashboard, prompt, MCP, API, and e2e checks when those surfaces change. Always run:

```bash
git diff --check
```

## 7. Safe Claim Language

Safe:

- "This dataset is approved for the current catalog with documented field classifications."
- "This view uses sample fallback unless the live proof explicitly marks the requested fields as live-ready."
- "Hidden fields are excluded from samples, dashboards, exports, and MCP outputs."

Avoid unless separately proven:

- "All fields are live."
- "This is complete source-owned production data."
- "Precise locations or personal details are available."
- "The app supports arbitrary public-data search."

## 8. Rollback Notes

If a catalog change is reverted, also review and revert any coupled prompt examples, sample files, gallery canvases, docs, tests, and live/fallback proof references. Do not leave docs claiming a dataset or live path that no longer exists in the approved catalog.
