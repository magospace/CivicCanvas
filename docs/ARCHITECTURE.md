# Architecture

## System overview

Texas Data Canvas has five layers:

1. Web app
2. Canvas renderer
3. Data/query API
4. MCP server
5. Optional Miro export/integration layer

## Data flow

```text
User prompt
  -> intent interpretation
  -> dataset discovery
  -> metadata lookup
  -> bounded query
  -> query result
  -> visualization recommendation
  -> CanvasSpec generation
  -> schema validation
  -> trusted React block rendering
  -> save/share/export
  -> optional MiroExportSpec
```

## Why CanvasSpec

The app must not execute arbitrary AI-generated HTML or JavaScript.

Instead, AI/tooling returns a CanvasSpec JSON document:

```json
{
  "title": "Dallas 311 Service Requests Explorer",
  "blocks": [
    {
      "id": "summary-1",
      "type": "SummaryBlock",
      "props": { "queryId": "q_123" }
    },
    {
      "id": "chart-1",
      "type": "ChartBlock",
      "props": {
        "queryId": "q_123",
        "chartType": "bar",
        "x": "category",
        "y": "request_count"
      }
    }
  ]
}
```

The frontend validates this spec and renders it through a component registry.

## Trusted block registry

Allowed block types:

- SummaryBlock
- MetricBlock
- ChartBlock
- MapBlock
- TableBlock
- FilterBlock
- SourceMethodBlock
- DatasetCardBlock

Unknown blocks must be rejected.

## Query safety

BoundedQuerySpec supports:

- datasetId
- filters
- groupBy
- metrics
- orderBy
- limit

The server validates:

- datasetId exists in approved catalog
- fields are allowlisted
- operators are allowlisted
- limit is within allowed maximum
- sensitive fields are hidden or aggregated
- source attribution is included

## Miro export architecture

Miro is an output target, not the query engine.

```text
CanvasDocument + QueryResults
  -> generate_miro_export_spec
  -> user confirms
  -> Miro MCP board/frame/doc/table/image creation
```

The MiroExportSpec should be safe to inspect before any board-write operation.

## Storage

For MVP, use local JSON or in-memory storage.

For V1, use Postgres/Supabase.

Entities:

- datasets
- query_results
- canvas_documents
- source_attributions
- query_audits
- miro_export_specs
