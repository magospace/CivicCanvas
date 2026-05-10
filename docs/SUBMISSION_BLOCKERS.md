# Submission Blockers Snapshot

Use this snapshot with `pnpm submission:readiness:json` before filling out the final hackathon form. It summarizes current blockers and boundaries without implying they are fixed by the repo.

## Current Required Form Items

- Public repo URL: confirm the final URL from `pnpm submission:readiness:json` or the hosting platform before pasting into the form.
- Loom URL: still must be recorded and pasted manually after the 2-5 minute demo video is uploaded.
- Team roster/contact fields: fill in names, roles, and contact handles outside committed files; do not commit private contact lists or secrets.
- Optional hosted URL: include only if a deployment task has intentionally deployed and smoke-tested a URL.

## Proof And Boundary Blockers

- Release evidence: checked-in `docs/release-evidence.json` is historical until Task 35 reruns the full release gate for the intended commit.
- Hosted rate limiting: broad public sharing still needs platform-level firewall/rate-limit proof; in-repo middleware is defense in depth only.
- Backend persistence: saved canvases are browser-local and URL-hash based today; Task 55 approval is required before local/dev backend persistence work.
- Media generation: normal dashboard generation does not call Fal or create images/videos; `pnpm media:fal:smoke:json` is no-spend script-level proof only.
- Live data: Dallas has narrow non-ZIP live support; Dallas ZIP, Austin monthly, and Houston transportation demos remain sample/fallback bounded unless future catalog proof changes that.
- Loom visual polish: `docs/VISUAL_UI_UX_AUDIT.md` is committed and localized dashboard polish landed, but mobile prompt-first ordering and dense `/sources` cards remain narration risks; screenshot artifacts belong under ignored `demo-artifacts/` and are not release evidence.

## Safe Commands

```bash
pnpm submission:readiness:json
pnpm demo:readiness:snapshot:json
pnpm release:evidence:precheck:json
pnpm demo:artifact-hygiene:json
```

These commands are intended to be no-network/no-mutation checks. Do not use this snapshot to run deployment mutation, release evidence refresh, live provider spend, or database operations.

## Submission Wording

Safe wording:

- "The repo is locally ready for a governed public-data demo with explicit known blockers."
- "Hosted, release-evidence, backend-persistence, and live-provider claims require separate approved proof."
- "Current saved canvases are browser-local; media proof is optional script-level and no-spend by default."

Avoid wording:

- "All blockers are resolved."
- "Release evidence proves this exact commit."
- "A hosted URL is production-ready without platform firewall/rate-limit proof."
- "The app has backend saved-canvas persistence or app-generated media."
