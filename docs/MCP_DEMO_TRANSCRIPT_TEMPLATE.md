# MCP Demo Transcript Template

Use this paste-safe template when recording or submitting the Brainforge / Vicinity Texas Open Data agent proof. It is a transcript scaffold, not release evidence, and it should not include secrets, `.env` contents, provider keys, browser proxy tokens, private paths, or billing/dashboard screenshots.

## Safe Commands To Run Or Show

```bash
pnpm --filter @texas-data-canvas/mcp-server build
pnpm --filter @texas-data-canvas/mcp-server inspect
pnpm test -- apps/mcp-server/test/tools.test.ts
```

Expected proof shape:

- Build succeeds for the custom MCP server under `apps/mcp-server`.
- Inspector/tool listing shows CivicCanvas tools without requiring production credentials.
- Test proof exercises the same safe handlers and Zod output validation.

## Tool Transcript Skeleton

Fill in only paste-safe summaries. Do not paste raw environment dumps, access tokens, or full local absolute paths.

| Step | MCP tool / command | Paste-safe result | Boundary to say out loud |
|---|---|---|---|
| 1 | `get_server_status` | Server name/version, dataset count, safety model says approved catalog + bounded queries. | MCP works through the same governed contracts as the app, not a database shell. |
| 2 | `list_supported_sources` | Dallas 311, Austin permits, Houston transportation, and catalog-approved metadata are visible. | Source discovery is catalog-backed, not arbitrary web search. |
| 3 | `validate_catalog` | Catalog health is OK or reports specific local fixture issues. | Catalog/sample/gallery records are checked-in fixtures read through data loaders. |
| 4 | `query_dataset` | Bounded Dallas/Austin/Houston query returns source-attributed rows with sample/live mode. | Queries use approved `BoundedQuerySpec`; hidden fields and arbitrary SQL are blocked. |
| 5 | `audit_query` | Query audit lists allowed fields, filters, row limit, caveats, and fallback decisions. | The agent can explain why the query is safe before rendering a dashboard. |
| 6 | `generate_canvas_spec` | Valid `CanvasDocument` with `SourceMethodBlock` and approved visual blocks. | Dashboards are validated JSON rendered by trusted React components, not model-generated UI code. |
| 7 | `generate_miro_export_spec` | Preview-only Miro JSON spec with Source & Method content. | No OAuth, board ID, access token, or live Miro board write exists in this MVP. |

## Example Narration

"CivicCanvas includes a custom MCP server for agents. It exposes approved Texas public-data tools backed by the same catalog, sample/live adapters, Zod schemas, row limits, and hidden-field rules as the web app. The agent can list sources, validate catalog health, run bounded queries, audit the source trail, generate a validated canvas spec, and create a preview-only Miro export spec. This is not arbitrary SQL, not a production database, not a live Miro write, and not LLM-generated dashboard code."

## Data Realism Classification

- Catalog/source metadata: fixture file through data loader / acceptable.
- Dallas approved aggregate live proof: live public API proof exists for narrow non-ZIP aggregate paths when `pnpm smoke:live:json` is run.
- Dallas ZIP, Austin monthly, and Houston demo dashboards: deterministic sample fallback / acceptable when clearly labeled.
- Gallery canvases: fixture files through data loader / acceptable.
- Saved canvases: browser-local persistence / acceptable and editable through normal UI.
- OpenAI prompt assist: provider-gated fallback metadata / acceptable when labeled; not MCP dashboard authority.
- Miro export: preview-only JSON spec / acceptable only when not described as a board write.

## Redaction Rules

Before pasting a transcript:

- Remove shell prompt paths if they expose private local folders.
- Remove any bearer token, provider key, inspector proxy token, signed URL, or browser session identifier.
- Do not paste `.env`, `.env.local`, `printenv`, or provider dashboard content.
- Keep row output short: counts, dataset IDs, source names, mode labels, caveats, and validation status are enough.
- If a tool returns an error, paste only the governed error category/message and the safe next step.

## Optional Evidence Links

Use these docs alongside the transcript:

- `docs/MCP_DEMO_PROOF.md` for the checklist and safe narration.
- `docs/MCP_SERVER_SPEC.md` for tool contracts.
- `docs/SAMPLE_AND_PERSISTENCE_REALNESS.md` for sample/local/persistence boundaries.
- `docs/LIVE_FALLBACK_PROOF.md` for live/sample/fallback proof boundaries.
- `docs/MIRO_EXPORT_SPEC.md` for preview-only Miro behavior.

## Do Not Claim

- Production auth, accounts, billing, database persistence, or hosted readiness.
- Complete live Texas data coverage.
- Arbitrary SQL or unrestricted natural-language database access.
- LLM-generated dashboard code or arbitrary generated React/HTML.
- Live Miro board creation/update.
- Current release evidence unless Task 35 has intentionally rerun the release gate for the target commit.
