# Live API Smoke Transcript Template

Use this only if `pnpm smoke:live:json` is intentionally run before submission. The command may hit public data portals, so keep it optional and do not treat it as release evidence unless Task 35 later reruns the full release gate and refreshes `docs/release-evidence.json`.

## Command

```bash
pnpm smoke:live:json
```

## Paste-Safe Summary

```text
Run date/time: [YYYY-MM-DD HH:MM timezone]
Command result: [passed / failed / not run]
Network used: public data API smoke only
Release evidence refreshed: no
Secrets required: no

Dallas live non-ZIP aggregate checks:
- Status: [passed / failed / not run]
- Rows/count summary: [short summary]
- Caveat: Dallas ZIP dashboards still use approved sample fallback because the verified live Socrata view does not expose ZIP.

Austin permits:
- Status: [sample-first / fallback / not run]
- Rows/count summary: [short summary if present]
- Caveat: monthly permit dashboard remains sample-first until a source-owned month grouping is safely verified.

Houston transportation incidents:
- Status: [sample-first / not run]
- Rows/count summary: [short summary if present]
- Caveat: Houston remains sample-first; precise locations are excluded and live feed promotion is not claimed.

Unsupported fields or failed checks:
- [summarize any blocked fields without pasting raw private data, tokens, local paths, or full provider responses]
```

## Safe Wording

- "Optional live smoke was run against approved public-data adapters."
- "Live smoke does not promote unsupported fields or remove sample fallback requirements."
- "Dallas ZIP, Austin monthly, and Houston incident dashboards remain governed sample/fallback paths unless future field-level verification changes the catalog."

## Do Not Claim

- Do not claim complete live Texas data coverage.
- Do not claim live ZIP aggregation for Dallas 311.
- Do not claim Austin monthly live aggregation.
- Do not claim Houston live feed integration or precise address/location display.
- Do not claim this transcript is current release evidence unless the gated release-evidence task runs.
