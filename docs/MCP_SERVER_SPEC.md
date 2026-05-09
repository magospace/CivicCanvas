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
  "datasetId": "dallas_311_requests",
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
- fields must be allowlisted
- operator must be allowed
- limit must be below configured max
- sensitive fields must be blocked or aggregated

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
  "canvasId": "canvas_dallas_311",
  "template": "briefing_board",
  "includeCharts": true,
  "includeMap": true,
  "includeTable": true,
  "includeSourceMethod": true
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

## MCP testing

Use the MCP Inspector for local testing once the server builds.

Example:

```bash
npx @modelcontextprotocol/inspector node apps/mcp-server/dist/index.js
```
