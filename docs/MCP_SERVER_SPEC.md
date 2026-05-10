# MCP Server Specification

## Server name

`texas-public-data-mcp`

## Purpose

Expose safe, bounded tools for discovering, querying, summarizing, visualizing, and exporting Texas public datasets.

## Design principles

1. Tools are narrow and typed.
2. Dataset sources are allowlisted.
3. Queries are bounded and validated.
4. Results include attribution and caveats.
5. Sensitive fields are hidden or aggregated.
6. Canvas and Miro exports are specs, not arbitrary executable code.

## Tools

### `list_supported_sources`

Returns the allowlisted portals/sources.

Input:

```json
{}
```

Output:

```json
{
  "sources": [
    {
      "id": "city_of_dallas_open_data",
      "name": "City of Dallas Open Data",
      "url": "https://www.dallasopendata.com/",
      "adapter": "socrata_or_static"
    }
  ]
}
```

### `search_datasets`

Find relevant datasets in the approved catalog.

Input:

```json
{
  "query": "Dallas 311 requests",
  "city": "Dallas",
  "topic": "311 Requests",
  "limit": 10
}
```

Output:

```json
{
  "datasets": [
    {
      "datasetId": "dallas_311_requests",
      "title": "Dallas 311 Service Requests",
      "sourceName": "City of Dallas Open Data",
      "confidence": 0.95,
      "recommendedUse": ["trend", "map", "table", "bar_chart"]
    }
  ]
}
```

### `get_dataset_metadata`

Return schema and source details.

Input:

```json
{ "datasetId": "dallas_311_requests" }
```

Output:

```json
{
  "datasetId": "dallas_311_requests",
  "title": "Dallas 311 Service Requests",
  "fields": [
    { "name": "created_date", "type": "date", "classification": "safe_public" }
  ],
  "dateFields": ["created_date"],
  "geoFields": ["zip_code"],
  "caveats": ["311 data reflects reported service requests, not all conditions."]
}
```

### `query_dataset`

Run a bounded validated query.

Input:

```json
{
  "schemaVersion": "1.0",
  "datasetId": "dallas_311_requests",
  "mode": "sample_only",
  "filters": [
    { "field": "created_date", "operator": "between", "value": ["2024-01-01", "2024-12-31"] }
  ],
  "groupBy": ["zip_code", "category"],
  "metrics": [{ "type": "count", "alias": "request_count" }],
  "limit": 500
}
```

Output:

```json
{
  "queryId": "q_123",
  "datasetId": "dallas_311_requests",
  "resultType": "geo_aggregate",
  "rows": [],
  "columns": [],
  "source": {},
  "caveats": []
}
```

Validation:

- dataset must exist in approved catalog
- `filters[].operator` must be one of `eq`, `neq`, `in`, `between`, `gte`, `lte`, or `contains`
- `metrics[].type` must be one of `count`, `sum`, `avg`, `min`, or `max`
- fields must be allowlisted and mapped in catalog metadata
- limit must be below configured max: 100 raw rows or 1000 aggregate rows
- sensitive fields must be blocked or aggregated

### `get_server_status`

Returns MCP server readiness, active shared release metadata, data-mode controls, and safety model summary.

### `get_release_evidence`

Returns checked-in release evidence for local and hosted readiness gates.

Output includes the active release version, branch, local gate results, governance audit summary, production-local result, and hosted status. Hosted status remains `blocked` until a real public URL passes deploy smoke and remote Playwright.

### `validate_catalog`

Returns catalog health, live-enabled datasets, fallback sample availability, and validation issues.

### `list_live_sources`

Returns live-enabled datasets and their verified live field mappings. Sample-first or blocked datasets are intentionally excluded from this list.

### `get_sample_rows`

Returns a safe preview of a dataset.

### `summarize_query_result`

Creates a descriptive plain-English summary from a QueryResult. Must include caveats.

### `recommend_visualization`

Recommends blocks based on schema and result type.

Rules:

- date field + metric -> line chart
- category + count -> bar chart
- geography + metric -> map block
- grouped rows -> table
- every result -> source/method block

### `generate_canvas_spec`

Creates a safe CanvasSpec using only approved block types.

Must reject:

- unknown block types
- raw HTML
- scripts
- external URLs except source links
- missing SourceMethodBlock

### `validate_canvas_spec`

Validates a CanvasSpec and returns errors/warnings.

### `get_source_attribution`

Returns source metadata for a dataset/query.

### `audit_query`

Returns audit metadata: dataset, filters, fields used, row limits, executedAt, and safety decisions.

### `generate_miro_export_spec` stretch

Converts a CanvasDocument into a MiroExportSpec.

Input:

```json
{
  "canvas": "validated CanvasDocument object with SourceMethodBlock",
  "template": "briefing_board"
}
```

Output:

```json
{
  "title": "Dallas 311 Service Requests Briefing",
  "template": "briefing_board",
  "frames": [
    {
      "title": "Executive Summary",
      "items": [{ "type": "text", "content": "Dallas 311 requests were highest in..." }]
    },
    {
      "title": "Source & Method",
      "items": [{ "type": "text", "content": "Source: City of Dallas Open Data..." }]
    }
  ],
  "sourceMethodFrameRequired": true
}
```

The MCP server validates tool outputs before serializing them with `jsonContent()`. Successful tool outputs preserve their existing shapes; failures return:

```json
{
  "ok": false,
  "error": {
    "category": "unsupported_field",
    "message": "Field is not allowlisted."
  }
}
```

## MCP testing

Use the MCP Inspector for local testing once the server builds.

Example:

```bash
npx @modelcontextprotocol/inspector node apps/mcp-server/dist/index.js
```
