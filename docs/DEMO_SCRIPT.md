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
   - CivicCanvas mark in the header and the Texas Data Canvas product label.
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

1. Enter: `Show Houston traffic incidents by ZIP and incident type for 2024.`
2. Click Generate View.
3. Point out the sample-first data-mode badge and the Source & Method caveat that precise locations are excluded.

Narration:

- Houston is the third public-pilot dataset and remains sample-first. Houston TranStar provides sample feed documentation, but live feed access and aggregate-safe mappings are not promoted yet.
- The precise address field is classified as hidden and cannot be queried or exported.
- The same CanvasDocument and BoundedQuerySpec rules govern the new dataset.

## Demo 4 - Sources browser

1. Open `/sources`.
2. Filter by city or topic.
3. Show source, city, topic, update/access status, field status, caveats, and recommended visual types.
4. Point out the Dallas ZIP sample fallback, Austin monthly aggregation blocker, and Houston sample-first status.

## Demo 5 - Demo readiness

1. Open `/demo-readiness`.
2. Show dataset readiness for Dallas, Austin, and Houston.
3. Use Copy demo checklist if you need a plain-text release flow.

## Demo 6 - Unsupported prompt safety

1. Return to `/explore`.
2. Enter: `Compare tax abatements across El Paso.`
3. Show that the app returns approved dataset suggestions instead of inventing a dashboard.

## Demo 7 - Miro stretch preview

1. Generate the Dallas dashboard.
2. Choose a Miro template in the inspector or use the main canvas toolbar.
3. Explain that the app generates frame cards plus preview-only MiroExportSpec JSON with a required Source & Method frame.
4. No Miro board write occurs in the MVP.

## Demo 8 - Saved bundle workflow

1. Save the Dallas dashboard.
2. Open `/saved`.
3. Export the portable saved-canvas bundle and copy a no-backend share link.
4. Explain that the share link stores the bundle in the URL hash and validates before import.
5. Paste invalid JSON containing an unknown block and show the friendly rejection message.

Narration:

- Saved canvases remain browser-local.
- Portable bundles are validated on import.
- Unsafe CanvasSpec JSON is rejected before render.

## Demo 9 - Curated gallery

1. Open `/gallery`.
2. Show the checked-in Dallas, Austin, Houston, and unsupported-sensitive prompt examples.
3. Explain that the gallery is static validated CanvasDocument JSON rendered through the same allowlisted registry.

## MCP server check

```bash
pnpm --filter @texas-data-canvas/mcp-server build
pnpm --filter @texas-data-canvas/mcp-server inspect
```

Show tools such as `get_server_status`, `validate_catalog`, `list_live_sources`, `search_datasets`, `get_dataset_metadata`, `query_dataset`, `generate_canvas_spec`, `validate_canvas_spec`, and `audit_query`.

## Closing pitch

Texas Data Canvas is a safe interaction layer for Texas open data. It helps residents, civic teams, businesses, researchers, journalists, and nonprofits move from raw public datasets to visual, source-cited insight without arbitrary code generation.
