# CivicCanvas Hackathon Review Triage

Review date: 2026-05-10
Reviewer mode: repo-local triage only. No secrets inspected. No code changes required by this file.

## Current MVP Readiness

Readiness score: 0.78 / 1.00

Summary: CivicCanvas is a strong local Brainforge / Vicinity Texas Open Data submission if the demo clearly shows governed public-data dashboards, dataset provenance, sample/live boundaries, and the MCP server / agent skill requirement. The main risks are dirty-tree reconciliation, clear CivicCanvas naming, and proving the exact demo prompts plus MCP build/inspect before recording.

Observed repo state during review:

- Branch: `feat/v1.3-hosted-launch-readiness...origin/main [ahead 7]`.
- Dirty/untracked files observed:
  - `apps/web/app/api/canvas/[id]/route.ts`
  - `apps/web/lib/data.ts`
  - `apps/web/test/canvas-seed-route.test.ts`
  - `clauderecommends.md`
  - `data/seed-canvases.json`
- Recent commits included OpenAI assist boundary, media-generation boundary, live API smoke transcript stub, and visual audit reconciliation.

## Likely Judging Strength

- Technical Execution: 0.86
  - Strong monorepo, governed `CanvasDocument` rendering, bounded query specs, source attribution, tests, and MCP server.
- Partner Ecosystem / Utility: 0.90
  - Strongest fit is Brainforge / Vicinity Texas Open Data because it directly uses Texas public-data catalog plus MCP / agent skill.
- Value / Impact: 0.84
  - Clear civic/public-data value and strong trust/governance story.
- Innovation: 0.78
  - Strong governance + MCP angle, but less visually flashy; sample fallback is central.

## P0 - Must Resolve Before Submission

### P0.1 Reconcile and validate dirty tree

Risk: current repo has uncommitted route/data/test changes plus untracked seed canvas data. Do not submit or record final proof assuming readiness until these are reconciled.

Scope to inspect/validate:

- `apps/web/app/api/canvas/[id]/route.ts`
- `apps/web/lib/data.ts`
- `apps/web/test/canvas-seed-route.test.ts`
- `data/seed-canvases.json`

Acceptance criteria:

- Dirty changes are intentional, validated, and recorded in repo-local progress/task state.
- No unrelated untracked recommendation files are mixed into the submission work.
- No secrets or live-provider data are committed.

### P0.2 Verify public project naming is CivicCanvas

Risk: product-facing UI/submission must say CivicCanvas, while internal package names can safely remain `@texas-data-canvas/*` if renaming would add risk.

Acceptance criteria:

- Public demo surfaces, README/submission docs, and Loom wording consistently use CivicCanvas.
- Internal package/workspace names are not changed during hackathon finalization unless already safely handled.

### P0.3 Prove the three exact demo prompts

Risk: if exact prompts fail or lack source/caveat blocks, the submission loses its strongest trust story.

Prompts to prove:

- `Show Dallas 311 service requests by category and ZIP code for 2024.`
- `Show Austin building permits by month and ZIP code.`
- `Show Houston traffic incidents by ZIP and incident type for 2024.`

Acceptance criteria:

- Each supported prompt generates a source-cited dashboard.
- Each relevant dashboard includes maps/charts/tables/caveats/source attribution and visible data-mode metadata.
- Unsupported prompts return approved dataset suggestions instead of hallucinated dashboards.

### P0.4 Prove MCP / agent-skill requirement

Risk: Brainforge / Vicinity strength depends on showing both the MCP server and the agent skill, not just the web dashboard.

Acceptance criteria:

- MCP server builds.
- MCP inspect/tool listing works without secrets or live-provider calls.
- `.agents/skills/texas-public-data-explorer/SKILL.md` is easy to point to in Loom/submission.
- Skill language references CivicCanvas, approved datasets, bounded queries, source/caveat boundaries, and safe agent workflows.

### P0.5 Keep dataset provenance and sample/live boundaries visible

Risk: judges may think sample fallback means fabricated data unless provenance is explained.

Acceptance criteria:

- `/sources`, `/explore`, `/gallery`, `/saved`, and `/demo-readiness` clearly distinguish live, sample fallback, browser-local saves, and preview-only Miro.
- Dallas ZIP sample fallback is explained because the verified live Socrata source does not expose ZIP safely.
- Austin monthly and Houston transportation flows are described as sample-first where appropriate.

## P1 - High-Value Improvements If Time Remains

### P1.1 Add or record a sanitized MCP proof transcript

Useful evidence:

- MCP build output.
- MCP inspect/tool list output.
- No secrets or provider keys.

### P1.2 Add README/demo links to MCP and agent-skill proof

Useful links:

- MCP server docs.
- MCP proof checklist.
- Agent skill path.

### P1.3 Add a short `/sources` narration legend if missing

Goal: make Loom narration easier by surfacing sample/live/provenance boundaries visually.

### P1.4 Run hosted smoke only if deployment exists and is intentionally in scope

Do not claim hosted readiness from local-only checks.

## P2 - Post-Submission Hardening

- Rename internal package paths only after hackathon if a full monorepo rename is approved.
- Add real backend persistence only behind an explicit local/dev database plan, migrations, seeds, rollback, tests, and UI honesty copy.
- Expand live API coverage only after field-level verification and fallback preservation.
- Refresh release evidence only after an explicit gated release-validation task.
- Strengthen hosted firewall/rate-limit proof before broad public sharing.

## P3 - Nice-To-Have Polish

- Add optional screenshots under ignored artifact paths if Airtable needs images.
- Add a compact architecture graphic to README if judges will inspect the repo quickly.
- Keep demo video under 5 minutes and include a 15-second MCP/agent-skill close.

## What Appears Real vs Mocked / Seeded / Hardcoded

Real:

- Next.js app.
- Governed dashboards.
- Validated `CanvasDocument` blocks.
- Approved public-data catalog.
- Source/method attribution.
- Browser-local saves and share links.
- MCP server package.
- Optional server-side OpenAI prompt-assist boundary.

Sample / seeded / fallback:

- Austin and Houston are mostly sample-first.
- Dallas ZIP dashboards intentionally use sample fallback.
- Gallery/seed canvases are checked-in fixtures.

Mocked / not real:

- No database persistence.
- No arbitrary dataset querying.
- No arbitrary SQL.
- No live Miro writes.
- Optional Fal media proof is separate and not part of normal dashboard generation.

## Demo Readiness and Risk Assessment

Risk level: medium-low.

Main risk is story clarity, not core product shape. If the Loom does not explicitly show MCP/agent skill and sample/live provenance, judges may see it as only a dashboard app. The current dirty tree should be resolved before final recording.

Recommended Loom emphasis:

- CivicCanvas is governed public-data exploration, not a generic chatbot.
- Every dashboard has source/caveat/method context.
- Sample fallback is honest reliability, not a hidden fake.
- MCP + agent skill satisfy the Brainforge / Vicinity agent workflow angle.

## Live API / Media / Data Proof Gaps

Required for submission:

- MCP build/inspect proof.
- Demo-prompt dashboard proof.
- Dataset provenance and sample/live boundary proof.

Optional:

- `pnpm smoke:live` for catalog entries with live adapters.
- Hosted smoke only if a deployment exists.

Not required:

- Fal/media proof. The normal app does not generate image/video media.

## UI / UX Risks

- Product-facing naming must remain CivicCanvas.
- Sample fallback copy must be visible enough that judges do not infer fabricated dashboards.
- Preview-only Miro must not look like a real integration.
- Saved canvases must not imply backend persistence.

## README / Submission Gaps

- Deployment URL and Loom URL remain form-level TODOs unless already filled elsewhere.
- Team roster/contact fields still need final submission values.
- README/submission should keep saying sample mode requires no secrets.
- Include MCP/agent skill in the submission narrative.

## Validation Commands

Safe local baseline:

```bash
git status --short --branch
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm governance:audit
pnpm data:quality
pnpm test:e2e
pnpm --filter @texas-data-canvas/mcp-server build
pnpm --filter @texas-data-canvas/mcp-server inspect
```

If claiming live public-data proof:

```bash
pnpm smoke:live
pnpm smoke:live:json
```

If claiming hosted/deployed proof:

```bash
pnpm smoke:deploy -- --url <hosted-or-local-url>
PLAYWRIGHT_BASE_URL=<hosted-url> pnpm test:e2e:remote
```

## Recommended Next Coding-Agent Prompt

Reviewer triage is in `HACKATHON_REVIEW_TRIAGE.md`. Prioritize final Brainforge readiness only: reconcile the current dirty tree without touching secrets, verify CivicCanvas naming, prove the three exact demo prompts, run MCP build/inspect, confirm the agent skill is discoverable, and verify dataset provenance plus sample/live boundary copy. Run the safe validation commands listed in this file. Update `TASKS.md` and `HERMES_PROGRESS.md` with validation and blockers; do not refresh release evidence, deploy, or add persistence unless explicitly asked.
