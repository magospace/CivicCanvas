# Demo Script

## Setup

```bash
pnpm install
pnpm typecheck
pnpm test
pnpm build
pnpm smoke:live
pnpm test:e2e
pnpm dev
```

Open `http://localhost:3000/explore`.

## Demo 1 - Dallas 311 dashboard

1. Enter: `Show Dallas 311 service requests by category and ZIP code for 2024.`
2. Click Generate View.
3. Point out:
   - Summary and metric blocks.
   - Monthly trend chart.
   - ZIP-code geography bubble renderer.
   - Grouped detail table.
   - Filter definitions.
   - Required Source & Method card.
   - Query audit section in the inspector.
   - Prompt intent transparency: matched terms, reason codes, mode hint, and rejected fields.

Narration:

- The app found the Dallas 311 dataset from the approved catalog.
- It ran bounded governed queries with validated fields, operators, metrics, and row limits.
- The data-mode badge explains when live public data is used and when sample fallback is active.
- It generated a CanvasDocument and rendered only allowlisted React blocks.
- Source, method, filters, fields, and caveats stay visible.

## Demo 2 - Austin permits dashboard

1. Enter: `Show Austin building permits by month and ZIP code.`
2. Click Generate View.
3. Point out the same governed CanvasSpec rendering and source/caveat behavior.

Narration:

- The same safe workflow runs over a different city/topic.
- Permit records are presented as administrative public data with caveats.
- The app does not imply construction starts or causation.

## Demo 3 - Sources browser

1. Open `/sources`.
2. Filter by city or topic.
3. Show source, city, topic, update/access status, fields, caveats, and recommended visual types.

## Demo 4 - Unsupported prompt safety

1. Return to `/explore`.
2. Enter: `Compare tax abatements across El Paso.`
3. Show that the app returns approved dataset suggestions instead of inventing a dashboard.

## Demo 5 - Miro stretch preview

1. Generate the Dallas dashboard.
2. Choose a Miro template in the inspector and click the export icon.
3. Explain that the app generates a preview-only MiroExportSpec with a required Source & Method frame.
4. No Miro board write occurs in the MVP.

## Demo 6 - Saved bundle workflow

1. Save the Dallas dashboard.
2. Open `/saved`.
3. Export the portable saved-canvas bundle.
4. Paste invalid JSON containing an unknown block and show the friendly rejection message.

Narration:

- Saved canvases remain browser-local.
- Portable bundles are validated on import.
- Unsafe CanvasSpec JSON is rejected before render.

## MCP server check

```bash
pnpm --filter @texas-data-canvas/mcp-server build
pnpm --filter @texas-data-canvas/mcp-server inspect
```

Show tools such as `get_server_status`, `validate_catalog`, `list_live_sources`, `search_datasets`, `get_dataset_metadata`, `query_dataset`, `generate_canvas_spec`, `validate_canvas_spec`, and `audit_query`.

## Closing pitch

Texas Data Canvas is a safe interaction layer for Texas open data. It helps residents, civic teams, businesses, researchers, journalists, and nonprofits move from raw public datasets to visual, source-cited insight without arbitrary code generation.
