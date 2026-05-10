# Hackathon Submission Checklist

Use this checklist before filling out the hackathon submission form. It separates ready-to-claim local proof from optional hosted, live API, media-provider, and release-evidence proof.

## Submission Basics

- Project name: Texas Data Canvas.
- Short description: Governed visual explorer for approved Texas public datasets that turns supported natural-language prompts into source-cited dashboards.
- License: MIT; see `LICENSE`.
- Repository setup:

  ```bash
  pnpm install
  pnpm dev
  ```

- Local app URL: `http://localhost:3000/explore`.
- Core routes to cite:
  - `/explore` for prompt-to-dashboard generation.
  - `/sources` for approved public-data catalog and hidden-field boundaries.
  - `/saved` for browser-local saved canvases and URL-hash share links.
  - `/gallery` for checked-in validated demo canvases.
  - `/demo-readiness` for utility readiness checks and historical evidence warnings.

## Demo Prompts To Include

Use these exact prompts so claims match tested behavior:

```text
Show Dallas 311 service requests by category and ZIP code for 2024.
Show Austin building permits by month and ZIP code for 2024.
Show Houston transportation incidents by ZIP and incident type for 2024.
```

Unsupported prompt proof:

```text
Show private phone numbers for bridge repairs on Mars.
```

Expected claim: unsupported or sensitive prompts return approved-source suggestions, not fabricated dashboards.

## Claim Boundaries

| Area | Safe submission wording | Do not claim unless separately proven |
|---|---|---|
| Prompt handling | Deterministic local TypeScript prompt parsing for supported workflows. | LLM-backed dashboard generation, paid AI inference, or provider-secret prompt processing. |
| Data | Approved Texas public-data catalog with bounded queries, static samples, and narrow Dallas live aggregate support. | Complete statewide coverage, arbitrary public-data search, or unverified live data for all views. |
| Dallas | Limited live Socrata support for verified non-ZIP aggregate fields; ZIP dashboard uses visible sample fallback. | Live ZIP aggregation from the verified Socrata view. |
| Austin | Sample-first monthly permit dashboard with source caveats. | Verified live monthly grouping. |
| Houston | Sample-first transportation incident dashboard with precise locations excluded. | Live Houston incident feed integration or precise address display. |
| Persistence | Browser-local `localStorage`, portable JSON bundles, and URL-hash share links. | Server-side saved-canvas database, accounts, public hosted share service, or multi-user persistence. |
| Miro | Preview-only `MiroExportSpec` JSON. | Miro OAuth, access tokens, board IDs, or live board writes. |
| Media | Screen recordings/screenshots of the app UI; optional no-spend Fal smoke script availability. | App-generated images/video/media artifacts or automatic Fal dashboard rendering. |
| Release evidence | Historical evidence is checked in for audit context. | Current release proof unless Task 35 reruns the full gate and refreshes `docs/release-evidence.json`. |


## Backend Persistence Gate

Current submission wording should say saved canvases are browser-local `localStorage` plus URL-hash share bundles. Do not describe `/saved` or `/api/canvas/save` as a server database, account store, public share service, or multi-user backend.

Future real backend persistence is gated behind Task 55 and the local persistence plan in `docs/LOCAL_PERSISTENCE_SPIKE.md`. Before any backend implementation, the task must approve local/dev-only scope, env gate, migration target, seed/reset assumptions, rollback path, UI/API honesty copy, and validation gates.

Safe readiness command:

```bash
pnpm persistence:readiness:json
```

Expected result today: browser-local default preserved, persistence not implemented, no DB files created, no network, and no env values echoed.

## Local Proof Checklist

Run these before submitting local-demo claims:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Optional focused local checks:

```bash
pnpm test:e2e
pnpm governance:audit
pnpm data:quality
pnpm live:fallback-proof:json
pnpm media:fal:smoke:json
```

Expected boundaries:

- `pnpm live:fallback-proof:json` is no-network and proves current live/fallback metadata boundaries.
- `pnpm media:fal:smoke:json` is no-spend by default and proves only that the script-level Fal gate exists.
- Neither command refreshes release evidence.

## Hosted Proof Checklist

Only fill in these fields if a hosted URL has actually been deployed and smoke-tested:

- Hosted URL: `[fill in when available]`.
- Expected version: `[fill in when available]`.
- Smoke command run:

  ```bash
  pnpm smoke:deploy -- --url <hosted-url> --expect-version <version>
  ```

- Remote browser command run, if applicable:

  ```bash
  PLAYWRIGHT_BASE_URL=<hosted-url> pnpm test:e2e:remote
  ```

Hosted caveat: broad public sharing requires platform-level firewall/rate limiting. The in-repo middleware throttle is defense-in-depth and is not proof that hosted provider controls are configured.

## Live API Proof Checklist

Safe local default:

```bash
pnpm live:fallback-proof:json
```

Optional network proof only when intentionally approved:

```bash
pnpm smoke:live:json
```

Record results without overstating scope:

- Dallas live-capable aggregate fields verified: `[fill in from command output]`.
- Dallas ZIP fallback still expected: yes.
- Austin monthly live promotion: no, sample-first.
- Houston live promotion: no, sample-first with precise locations excluded.

## Media Proof Checklist

Use this section only to describe provider-proof posture. It is not evidence that the app generates dashboard images or videos.

No-spend default:

```bash
pnpm media:fal:smoke:json
```

Expected no-spend result:

- `status` is `skipped_no_spend`.
- `liveCallCount` is `0`.
- `network` is not used for a paid provider call.
- Normal `/explore` dashboard generation still does not call Fal, upload media, or create image/video artifacts.

Optional one-call live proof only with explicit approval, credentials, and accepted billing risk:

```bash
RUN_LIVE_FAL_SMOKE=1 FAL_KEY=<redacted> pnpm media:fal:smoke:json
```

Before citing live Fal proof, fill out `docs/FAL_LIVE_PROOF_TEMPLATE.md` with sanitized output. Do not paste raw provider responses, signed URLs, request tokens, authorization headers, or secret-like values into the submission.

Record:

- Live Fal call made: yes/no.
- Approximate call count: 0 unless the env gate was enabled; one minimal proof request when enabled.
- Output artifact: do not commit generated media unless a separate task explicitly approves it.
- App integration status: normal dashboard generation still does not call Fal or generate media artifacts.
- Safe wording: "Optional script-level Fal proof is env-gated and separate from the app UI." Do not say "CivicCanvas generates media" unless app wiring is implemented and validated in a future task.

## Screenshot And Video Assets

- Use `docs/DEMO_VIDEO_CHECKLIST.md` for video capture sequence and narration.
- Keep generated screenshots/video files out of git unless a separate task explicitly approves committing them.
- Confirm no secrets, private browser tabs, `.env` contents, tokens, local credentials, or unrelated personal data are visible.
- Caption fallback/live boundaries so judges do not infer unsupported live-provider behavior.

## Final Review Before Submit

- Use `docs/SUBMISSION_COMMAND_TRANSCRIPT_TEMPLATE.md` when sharing validation output so local paths, secrets, provider tokens, signed URLs, and optional live/deploy evidence stay separated and redacted.
- Project description mentions governed public-data dashboards, not generic AI chat.
- Install and run commands are present.
- Demo URL is either a tested hosted URL or clearly labeled local-only.
- License is MIT.
- Screenshots/video are current and do not expose secrets.
- Claims distinguish local, sample, live, fallback, hosted, media-provider, and release-evidence boundaries.
- No current release-evidence claim is made unless Task 35 has been completed for the intended commit.
