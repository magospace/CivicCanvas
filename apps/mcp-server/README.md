# Texas Public Data MCP Server

MCP stdio server for safe Texas public dataset discovery, bounded queries, source attribution, audit records, and validated CanvasSpec generation.

## Commands

```bash
pnpm --filter @texas-data-canvas/mcp-server typecheck
pnpm --filter @texas-data-canvas/mcp-server build
pnpm --filter @texas-data-canvas/mcp-server inspect
pnpm smoke:live
pnpm smoke:live:json
```

## Tools

- `list_supported_sources`
- `get_server_status`
- `validate_catalog`
- `list_live_sources`
- `search_datasets`
- `get_dataset_metadata`
- `query_dataset`
- `get_sample_rows`
- `summarize_query_result`
- `recommend_visualization`
- `generate_canvas_spec`
- `validate_canvas_spec`
- `get_source_attribution`
- `audit_query`
- `generate_miro_export_spec`

## Sample bounded query

```json
{
  "datasetId": "dallas_311_requests",
  "mode": "sample_only",
  "filters": [
    { "field": "created_date", "operator": "between", "value": ["2024-01-01", "2024-12-31"] }
  ],
  "groupBy": ["category", "zip_code"],
  "metrics": [{ "type": "count", "alias": "request_count" }],
  "orderBy": [{ "field": "request_count", "direction": "desc" }],
  "limit": 25
}
```

The server does not execute arbitrary SQL, generated JavaScript, generated HTML, or unapproved dataset access.

## Safety model

- All tool inputs are validated with Zod before execution.
- Dataset access is routed through the approved catalog and adapter router.
- Current catalog entries keep live access disabled unless `liveAvailable` is explicitly true.
- Live Socrata/Tyler calls are generated from allowlisted `BoundedQuerySpec` fields, operators, and catalog `liveFieldMap` entries; callers never provide raw SQL or SoQL.
- Network or live adapter failures fall back to approved sample JSON with an explicit caveat.
- Tool errors are returned with validation categories when invoked through the MCP server.
- Status and catalog-health tools expose live source readiness without returning sample rows.
- Canvas outputs are JSON only, use allowlisted block types, and require a `SourceMethodBlock`.
- Miro output is a preview-only `MiroExportSpec`; this server does not write to boards.
