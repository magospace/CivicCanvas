# Supported Prompt Grammar

Texas Data Canvas uses deterministic TypeScript prompt parsing for a small set of governed public-data workflows. It is not a generic chatbot, LLM prompt router, arbitrary SQL generator, or open-ended natural-language database interface.

## Supported Dashboard Prompts

Use these exact prompts for the most reliable demo path:

```text
Show Dallas 311 service requests by category and ZIP code for 2024.
Show Austin building permits by month and ZIP code for 2024.
Show Houston transportation incidents by ZIP and incident type for 2024.
```

The parser also accepts bounded synonyms that map to the same approved workflows:

| Workflow | Accepted wording examples | Notes |
|---|---|---|
| Dallas 311 | `311`, `service requests`, `complaints`, `cases`, `trash complaints` | ZIP-level dashboard views use approved sample fallback because the verified live Socrata mapping does not expose ZIP. |
| Austin permits | `permits`, `building activity`, `construction permits`, `issued permits` | Monthly/ZIP demo dashboards are sample-first until live month grouping is safely verified. |
| Houston transportation | `transportation incidents`, `traffic incidents`, `road hazards`, `lane closures`, `crashes` | Houston remains sample-first and excludes precise locations. |

## Supported Parameters

The deterministic parser recognizes a narrow set of safe hints:

- City/workflow: Dallas, Austin, or Houston when paired with an approved topic.
- Year/date range: a year such as `2024`, used as a bounded date filter.
- Top-N hints: requests like `top 5`, capped by dashboard defaults.
- Data-mode hints: `sample` or `live` language, still constrained by catalog live-readiness and fallback rules.
- Grouping hints: category, status, month, or ZIP code where that grouping is approved for the dataset.

## Unsupported Or Sensitive Prompts

Prompts outside the governed workflows return approved dataset suggestions instead of fabricated dashboards. Sensitive requests, such as exact Houston addresses or raw incident locations, are rejected before dashboard generation and return guidance.

Examples that should not generate dashboards:

```text
Compare tax abatements across El Paso.
Show Houston exact addresses and raw incident locations by ZIP for 2024.
Show personal contact details for permit applicants.
```

## Data Mode Boundaries

- Auto: uses live public APIs only when the approved catalog marks the dataset and fields as live-ready.
- Live public API: requests live data but visibly falls back to approved samples when live access is unavailable or unsafe.
- Sample fallback: forces deterministic local samples for reliable demos.

## Developer Validation

When changing prompt behavior, update parser/dashboard tests and run:

```bash
pnpm test -- apps/web/test/dashboard.test.ts packages/shared/test/prompt-intent.test.ts
pnpm typecheck
pnpm test
pnpm governance:audit
```

Do not add generic prompt execution, arbitrary SQL, model-generated components, or unreviewed fields without a new architecture/security task.
