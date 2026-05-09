# Security And Governance Review

## Current Controls

- Canvas rendering is restricted to allowlisted React blocks.
- `CanvasDocument` requires `SourceMethodBlock`.
- Script-like strings such as `<script>`, `javascript:`, inline event handlers, and iframe markup are rejected.
- Query execution requires approved dataset IDs and allowlisted fields.
- Raw row limits and aggregate row limits are enforced centrally.
- Sensitive and unknown-review fields are blocked by default.
- Miro export is preview-only and includes a required Source & Method frame.

## Review Checklist

- API routes validate request bodies with Zod or shared schemas.
- MCP tools validate inputs before invoking query/canvas helpers.
- Live adapters generate requests from validated specs only.
- No model output is executed as code.
- No arbitrary external data URLs or map layers are accepted from generated specs.
- Public-data summaries remain descriptive and avoid unsupported causation.

## Known Residual Risks

- Current sample datasets are synthetic development samples aligned to public schemas.
- Live Socrata dataset IDs are configured as disabled until verified.
- ZIP geography uses approximate bundled centroids, not authoritative boundaries.
