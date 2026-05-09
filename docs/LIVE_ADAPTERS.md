# Live Adapter Policy

Texas Data Canvas supports live public-data adapters only behind the same `BoundedQuerySpec` safety contract used for local samples.

## Current Adapters

- `static_json`: reads approved local sample files and is always available as demo fallback.
- `socrata`: builds allowlisted SoQL requests from validated dataset metadata and query specs.
- `adapterRouter`: chooses live adapters only when catalog metadata marks `liveAvailable: true`; otherwise it uses static fallback.

## Safety Rules

- Do not accept raw SQL, SoQL, URLs, or JavaScript from prompts or model output.
- Dataset IDs, fields, metrics, filters, grouping, ordering, and limits must validate against the approved catalog.
- Generated Socrata URLs may use only allowlisted identifiers.
- Network failures must fall back to static samples with a visible caveat.
- Sample mode remains the default for reliable demos.

## Optional Live Configuration

No secrets are required for sample mode. To enable a live Socrata source later, confirm the public dataset identifier and set these catalog fields:

- `adapter: "socrata"`
- `externalDatasetId`
- `apiBaseUrl`
- `liveAvailable: true`
- `fallbackSampleFile`
