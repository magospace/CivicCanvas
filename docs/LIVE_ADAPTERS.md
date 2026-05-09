# Live Adapter Policy

Texas Data Canvas supports live public-data adapters only behind the same `BoundedQuerySpec` safety contract used for local samples.

## Current Adapters

- `static_json`: reads approved local sample files and is always available as demo fallback.
- `socrata`: builds allowlisted SoQL requests from validated dataset metadata and query specs.
- `adapterRouter`: chooses live adapters only when catalog metadata marks `liveAvailable: true`; otherwise it uses static fallback.
- `liveFieldMap`: maps canonical app fields to verified portal fields or approved generated expressions such as `date_trunc_ym(created_date)`.
- `liveVerification`: records promotion status, tested fields, live-capable fields, sample-only fields, and the smoke query shapes used for Dallas/Austin readiness decisions.

## Safety Rules

- Do not accept raw SQL, SoQL, URLs, or JavaScript from prompts or model output.
- Dataset IDs, fields, metrics, filters, grouping, ordering, and limits must validate against the approved catalog.
- Generated Socrata URLs may use only allowlisted identifiers and approved date truncation expressions from the catalog.
- Network failures must fall back to static samples with a visible caveat.
- Missing live field mappings must fall back to static samples with a visible caveat.
- Sample mode remains the default for reliable demos.

## Optional Live Configuration

No secrets are required for sample mode. To enable a live Socrata source later, confirm the public dataset identifier and set these catalog fields:

- `adapter: "socrata"`
- `externalDatasetId`
- `apiBaseUrl`
- `liveAvailable: true`
- `fallbackSampleFile`
- `liveFieldMap`

## Verified v0.5 Sources

- Dallas 311: `https://www.dallasopendata.com/resource/d7e7-envw.json`, live enabled for mapped non-ZIP aggregates. ZIP-code dashboards intentionally use approved sample fallback because the verified live view does not expose ZIP.
- Austin issued building permits: `https://data.austintexas.gov/resource/quv8-5ckq.json`, metadata plus `permit_type` and `zip_code` aggregate checks verified. Austin remains sample-first because generated monthly aggregation is still blocked on the live portal.

`pnpm smoke:live` checks only catalog entries with `liveAvailable: true`. `pnpm smoke:live:json` emits machine-readable results with dataset ID, external ID, check name, tested fields, tested URL, row count, data mode, and pass/fail reason.
