# Optional Hosted Smoke Evidence Template

Use this template to record smoke-test observations for an already-deployed hosted URL. It is not deployment automation, does not mutate hosted configuration, and does not refresh `docs/release-evidence.json`.

## Evidence Boundary

This document is a note-taking template only. Hosted smoke notes become current release evidence only if Task 35 intentionally reruns the full release gate for the intended commit and refreshes `docs/release-evidence.json`.

Do not paste secrets, provider tokens, Vercel project metadata with credentials, `.env` contents, private dashboard URLs, or billing details into this template.

## Smoke Session Metadata

- Reviewer: `[name or initials]`
- Date/time with timezone: `[YYYY-MM-DD HH:mm TZ]`
- Hosted URL: `[https://example]`
- Expected branch: `feat/v1.3-hosted-launch-readiness`
- Expected version: `v1.3.0-hosted-launch-readiness`
- Expected commit: `[short or full commit]`
- Browser/device: `[browser, OS, viewport]`
- Network context: `[office/home/mobile/VPN/etc.]`
- Platform rate-limit/firewall status: `[not configured / configured externally / unknown]`

## Commands To Run

Run only against the intended hosted URL:

```bash
pnpm smoke:deploy -- --url <hosted-url> --expect-version <expected-version>
PLAYWRIGHT_BASE_URL=<hosted-url> pnpm test:e2e:remote
```

Optional, only when live public API behavior is in scope:

```bash
pnpm smoke:live:json
pnpm live:fallback-proof:json
```

Do not run release evidence refresh commands from this template.

## Manual Route Checks

| Route | Expected result | Observed result | Pass/fail | Notes |
|---|---|---|---|---|
| `/` or redirect target | App loads without auth prompt or server error. | `[fill]` | `[fill]` | `[fill]` |
| `/sources` | Dallas/Austin/Houston sources show live/sample notes and hidden-field warnings. | `[fill]` | `[fill]` | `[fill]` |
| `/explore` Dallas prompt | Dashboard renders with Source & Method and visible Dallas ZIP fallback. | `[fill]` | `[fill]` | `[fill]` |
| `/explore` unsupported prompt | Governed suggestions show approved sources; no fabricated dashboard. | `[fill]` | `[fill]` | `[fill]` |
| `/saved` | Browser-local save/import/share boundary is visible; no hosted database claim. | `[fill]` | `[fill]` | `[fill]` |
| `/demo-readiness` | Catalog health, blockers, and historical release-evidence warning are visible. | `[fill]` | `[fill]` | `[fill]` |

## Command Results

Paste summaries only; do not paste secrets or full environment dumps.

```text
pnpm smoke:deploy -- --url <hosted-url> --expect-version <expected-version>
[result summary]

PLAYWRIGHT_BASE_URL=<hosted-url> pnpm test:e2e:remote
[result summary]
```

## Screenshot / Artifact References

Generated screenshots or videos should usually remain local artifacts. If recorded, list local or external storage references without committing generated media unless explicitly approved.

- Screenshot directory: `[local path or N/A]`
- Video file: `[local path or N/A]`
- Demo artifacts committed to repo: `No, unless a separate task approved them.`

## Known Caveats To Preserve

- Hosted rate limiting requires platform-level controls; in-repo middleware is defense-in-depth only.
- Release evidence remains historical until Task 35 refreshes it after the full release gate.
- Dallas has limited live support; the Dallas ZIP demo uses visible sample fallback.
- Austin monthly and Houston transportation demos remain sample-first/fallback bounded.
- Saved canvases are browser-local and URL-hash based, not server persisted.
- Miro export is preview-only JSON with no OAuth or board write.
- Normal app dashboard generation does not create image/video/media artifacts or call Fal.

## Reviewer Sign-Off

- Smoke result: `[pass / fail / inconclusive]`
- Blocking issues: `[none or list]`
- Follow-up task needed: `[none or TASKS.md item]`
- Safe to cite in submission notes: `[yes/no, with caveats]`
