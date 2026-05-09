# @texas-data-canvas/shared

Shared TypeScript and Zod contracts for Texas Data Canvas.

## Exports

- Dataset catalog and metadata schemas
- `BoundedQuerySpec` and `QueryResult`
- `CanvasDocument` and allowlisted `CanvasBlock` schemas
- Source attribution and visualization recommendation schemas
- Stretch `MiroExportSpec`

`CanvasDocument` validation requires a `SourceMethodBlock` and rejects script-like generated markup values.
