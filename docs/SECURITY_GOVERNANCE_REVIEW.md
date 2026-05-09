# Security And Governance Review

## Current Controls

- Canvas rendering is restricted to allowlisted React blocks.
- `CanvasDocument` requires `SourceMethodBlock`.
- Script-like strings such as `<script>`, `javascript:`, inline event handlers, and iframe markup are rejected.
- Query execution requires approved dataset IDs and allowlisted fields.
- Raw row limits and aggregate row limits are enforced centrally.
- Sensitive and unknown-review fields are blocked by default.
- Miro export is preview-only and includes a required Source & Method frame.
- Portable saved-canvas bundles must validate before import and render.

## Review Checklist

- API routes validate request bodies with Zod or shared schemas.
- API errors use structured envelopes with request IDs and no raw stack traces.
- MCP tools validate inputs before invoking query/canvas helpers.
- Live adapters generate requests from validated specs only.
- Live adapters translate canonical fields through catalog-owned `liveFieldMap`; raw SoQL is never accepted.
- Missing live mappings, network failures, and portal errors fall back to approved samples with explicit caveats.
- No model output is executed as code.
- No arbitrary external data URLs or map layers are accepted from generated specs.
- Public-data summaries remain descriptive and avoid unsupported causation.

## Known Residual Risks

- Current sample datasets are synthetic development samples aligned to public schemas.
- Dallas live 311 is enabled only for verified mapped fields; ZIP views fall back to samples.
- Austin live permit metadata is verified but disabled until final source approval.
- ZIP geography uses approximate bundled centroids, not authoritative boundaries.
