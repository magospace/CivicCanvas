# Houston TranStar Live Access Packet

Houston transportation remains sample-first until official live feed access is approved and safely bounded.

## Source Owner Checklist

- Identify the Houston TranStar contact or access process for traffic data feeds.
- Confirm terms of use allow public aggregate dashboards.
- Confirm refresh cadence and any attribution requirements.
- Confirm whether ZIP or another generalized geography is available without exposing precise locations.

## Requested Aggregate-Safe Fields

- `incident_id` or stable non-personal record key for deduplication only
- `reported_date`
- `month` or a source-owned month/date aggregation field
- `incident_type`
- `status`
- `zip_code` or approved generalized geography
- `corridor_area`
- `mode`
- `severity_score` if public and non-identifying

## Explicitly Excluded Fields

- precise street address
- exact latitude/longitude
- personal names
- phone numbers
- emails
- vehicle identifiers or other personal identifiers

## Required Query Shapes

- incidents by `incident_type`
- incidents by `status`
- incidents by month/date
- incidents by ZIP or approved geography
- incidents by incident type and ZIP/geography

## Promotion Rules

- Keep `precise_address` classified as `sensitive_hide`.
- Keep sample fallback mandatory.
- Add live metadata only for verified fields.
- Add non-network adapter URL-generation tests before enabling live mode.
- Add optional `pnpm smoke:live` coverage only after an official endpoint is verified.

## Public Caveat Language

Houston transportation dashboards use approved sample fallback until official live feed access and aggregate-safe mappings are verified. Precise incident locations are excluded, and ZIP/geography views are approximate context rather than parcel-level analysis.
