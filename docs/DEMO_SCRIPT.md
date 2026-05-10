# Final Judge Demo Script

Use this script for the hackathon judge walkthrough. It keeps the story centered on governed public-data dashboards and avoids overstating persistence, live data, auth, AI/provider output, or Miro integration.

## Pre-Demo Setup

Run the quick local checks before the room opens:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Start the app:

```bash
pnpm dev
```

Open `http://localhost:3000/explore`.

Do not refresh `docs/release-evidence.json` for this demo script. Release evidence is a separate gated task.

## Opening Pitch

Texas Data Canvas turns approved Texas public datasets into source-cited dashboards. The app is intentionally governed: no accounts, no database, no arbitrary SQL, no arbitrary generated HTML or JavaScript, no LLM-backed dashboard generation, no image/video/media-generation provider, and no live Miro board writes.

Every dashboard is a validated `CanvasDocument` rendered through the trusted React block registry. Every query is a bounded `BoundedQuerySpec` against the approved catalog, static samples, or narrowly verified live public APIs with sample fallback. Visual outputs are the dashboard UI, static brand assets, client-side CSV/JSON downloads, checked-in gallery canvases, and preview-only MiroExportSpec JSON.

## Demo 1 - Sources And Boundaries

1. Open `/sources`.
2. Point out the approved Dallas, Austin, and Houston datasets.
3. Show the field status badges, hidden-field warning, caveats, and live/sample confidence.
4. Name the boundary before generating anything:
   - Dallas has limited live Socrata support for verified non-ZIP aggregate fields.
   - Dallas ZIP dashboards use sample fallback because the verified live view does not expose ZIP.
   - Austin monthly dashboards are sample-first until source-owned month grouping is safely verified.
   - Houston transportation is sample-first and excludes precise locations.

Checkpoint: judges should see catalog health, live/sample copy, and the hidden `precise_address` warning.

## Demo 2 - Dallas Core Dashboard

1. Open `/explore`.
2. Enter exactly:

   ```text
   Show Dallas 311 service requests by category and ZIP code for 2024.
   ```

3. Click Generate View.
4. Point out:
   - The generated title, summary, metric, trend, ZIP map, table, filters, and Source & Method card.
   - The visible data-mode message: `Live unavailable, sample fallback used`.
   - The fallback reason that the verified live source lacks required ZIP fields.
   - The "Why this dashboard?" inspector with matched prompt terms, reason codes, query audit, fields, filters, row limits, and active bounded query JSON.

Narration: The app understood a supported public-data question, selected an approved dataset, built bounded aggregate queries, and kept the fallback caveat visible instead of pretending the ZIP view was live.

## Demo 3 - Austin And Houston Variants

Run the Austin prompt:

```text
Show Austin building permits by month and ZIP code for 2024.
```

Expected proof:

- The dashboard title is `Austin Building Permits Explorer`.
- The inspector shows sample/fallback status.
- Source & Method explains the approved sample fallback and caveats for administrative permit data.

Run the Houston prompt:

```text
Show Houston transportation incidents by ZIP and incident type for 2024.
```

Expected proof:

- The dashboard title is `Houston Transportation Incidents Explorer`.
- The UI shows sample fallback/sample-first language.
- Source & Method and the table/map caveats say precise incident locations are excluded.

Narration: These two examples show that the same CanvasDocument and BoundedQuerySpec model works across cities while preserving source-specific caveats.

## Demo 4 - Unsupported Prompt Safety

Enter:

```text
Show private phone numbers for bridge repairs on Mars.
```

Expected proof:

- The app returns `Choose an approved dataset`, not a fabricated dashboard.
- The UI shows exact supported prompt suggestions.
- Approved source cards for Dallas, Austin, and Houston are visible.
- Sensitive terms are named as rejected/governed fields.

Narration: Unsupported or sensitive prompts produce safe suggestions instead of hallucinated datasets or private-field output.

## Demo 5 - Saved Canvas Local Handoff

1. Generate the Dallas dashboard again if needed.
2. Click Save canvas locally.
3. Open `/saved`.
4. Show the saved card and the local-only page copy.
5. Click:
   - Open in `/explore`.
   - Duplicate.
   - Export bundle.
   - Copy share link.
6. Paste invalid JSON with an unknown block into the import box and click Import.

Expected proof:

- Saved canvases are browser-local `localStorage`.
- Share links keep the validated bundle in the URL hash.
- Imports validate before rendering and reject unsafe blocks.
- There is no hosted database or public saved-canvas service.

## Demo 6 - Miro Preview Stretch

1. Generate a governed dashboard.
2. Use the inspector Miro template selector.
3. Click Generate Miro export preview.

Expected proof:

- The preview includes a Source & Method frame.
- The output is preview-only `MiroExportSpec` JSON.
- There is no Miro OAuth, access token, board ID, or board write in the current app.

Narration: Miro export is a safe handoff spec for future collaboration tooling, not a live third-party write integration.

## Demo 7 - MCP Talking Points

Build the MCP server if you want to inspect it locally:

```bash
pnpm --filter @texas-data-canvas/mcp-server build
pnpm --filter @texas-data-canvas/mcp-server inspect
```

Mention the key tools:

- `get_server_status`
- `validate_catalog`
- `list_live_sources`
- `search_datasets`
- `get_dataset_metadata`
- `query_dataset`
- `generate_canvas_spec`
- `validate_canvas_spec`
- `audit_query`
- `generate_miro_export_spec`

Narration: The MCP server reuses the same catalog, bounded query, canvas validation, source attribution, and preview-only Miro spec boundaries as the web app.

## Closing

Texas Data Canvas is not trying to be a generic chatbot. It is a trustworthy civic-data interface: narrow prompts, approved sources, bounded queries, visible caveats, local fallback reliability, and exportable dashboards that keep source and method attached.
