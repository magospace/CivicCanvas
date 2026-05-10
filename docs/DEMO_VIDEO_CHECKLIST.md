# Demo Video Capture Checklist

Use this checklist to record a short hackathon submission video from the current app. It describes screen-recording the product UI only. It does not claim that Texas Data Canvas generates video, images, or media artifacts.

## Boundary Statement For The Video

Say this once near the beginning or in the submission notes:

> This video is a screen recording of the running Texas Data Canvas app. The app currently renders governed dashboard UI, client-side downloads, checked-in gallery canvases, and preview-only MiroExportSpec JSON. It does not generate images or video, upload media, or call a media provider during normal dashboard generation. Optional Fal proof is a separate env-gated smoke script, not part of this recording flow.

Do not show or mention provider keys. Do not run `RUN_LIVE_FAL_SMOKE=1` during the recording unless a separate approved provider-proof task is intentionally being captured.

## Pre-Capture Setup

1. Use a clean browser profile or clear local demo state if old saved canvases could confuse the story.
2. Run the normal local confidence checks:

   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```

3. Start the app locally:

   ```bash
   pnpm dev
   ```

4. Open `http://localhost:3000/explore`.
5. Keep the terminal out of frame if it might display local paths or environment variables.
6. Do not refresh `docs/release-evidence.json`; checked-in release evidence remains historical until Task 35 reruns the full release gate.

## Suggested 2-3 Minute Route Sequence

### 0:00-0:20 - Product And Governance Setup

- Start on `/sources`.
- Show Dallas, Austin, and Houston approved sources.
- Point at the live/sample confidence notes and hidden-field warning.
- Say that unsupported or sensitive fields are rejected rather than improvised.

### 0:20-1:10 - Primary Dallas Dashboard

- Navigate to `/explore`.
- Enter exactly:

  ```text
  Show Dallas 311 service requests by category and ZIP code for 2024.
  ```

- Click Generate View.
- Show the generated dashboard title, map/table/chart blocks, and Source & Method card.
- Say the app requested a supported Dallas workflow but used visible sample fallback for ZIP because the verified live Socrata view does not expose ZIP.

### 1:10-1:45 - Data Mode And Inspector Trust Proof

- Open or point to the inspector.
- Show:
  - requested data mode and rendered data mode,
  - fallback reason,
  - query audit / bounded query JSON,
  - source attribution and caveats.
- Use wording such as: "The app keeps the live-vs-sample boundary visible instead of overclaiming live support."

### 1:45-2:15 - Secondary City Coverage

Run one secondary prompt if time permits:

```text
Show Austin building permits by month and ZIP code for 2024.
```

or:

```text
Show Houston transportation incidents by ZIP and incident type for 2024.
```

Expected wording:

- Austin monthly permit dashboards are sample-first until source-owned month grouping is verified.
- Houston transportation incidents are sample-first and precise locations are excluded.

### 2:15-2:45 - Local Save And Preview Export

- Click Save canvas locally.
- Open `/saved` and show the saved card.
- Say saved canvases are browser-local and share links use URL hashes, not a hosted database.
- If time permits, return to `/explore` and show Miro export preview JSON.
- Say Miro output is preview-only JSON with no OAuth, board ID, or board write.

### 2:45-3:00 - Closing Claim

Use this closing line:

> Texas Data Canvas is a governed civic-data dashboard interface: approved sources, deterministic prompt parsing, bounded queries, visible caveats, local fallback reliability, and exportable source-cited canvases.

## Capture Settings

- Recommended size: 1920x1080 or 1280x720.
- Browser zoom: 90-100% so the inspector and Source & Method card are readable.
- Cursor: visible.
- Audio: record narration live or add captions after recording.
- Avoid showing terminal output containing environment variables, machine usernames, or local paths if the video will be public.

## Post-Capture Checks

Before uploading the video:

- Confirm no secrets, tokens, `.env` contents, or private browser tabs are visible.
- Confirm narration does not claim generated image/video output.
- Confirm narration does not claim server-side saved-canvas persistence.
- Confirm narration does not claim real Miro board creation.
- Confirm Dallas ZIP, Austin month, and Houston incident workflows are described with their sample/live/fallback limits.
- If using screenshots or video stills as submission assets, keep them as local generated artifacts unless a separate task explicitly approves committing them.

## Optional Local Screenshot Plan

Use the screenshot helper in dry-run mode to preview deterministic submission screenshots without creating files:

```bash
pnpm demo:screenshots:json
```

When a local app is already running and generated assets are intentionally needed, capture screenshots under the ignored `demo-artifacts/screenshots/` directory:

```bash
pnpm demo:screenshots -- --run --base-url=http://localhost:3002
```

Do not commit files under `demo-artifacts/` unless a separate task explicitly approves committing generated screenshot assets.

## Optional Separate Proofs Not Part Of The Video

These can be cited only if intentionally run and recorded elsewhere:

- `pnpm live:fallback-proof:json` for no-network live/fallback boundary proof.
- `pnpm media:fal:smoke:json` for no-spend Fal proof-script availability.
- `RUN_LIVE_FAL_SMOKE=1 FAL_KEY=<redacted> pnpm media:fal:smoke:json` for one approved live Fal smoke call.
- `docs/FAL_LIVE_PROOF_TEMPLATE.md` for recording a sanitized live Fal proof result without claiming normal app media generation.
- Task 35 full release gate for current release evidence.
