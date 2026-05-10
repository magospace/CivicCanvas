# Hackathon Realness Audit

Last audited: May 10, 2026

Scope: read `AGENTS.md`, `TASKS.md`, `HERMES_PROGRESS.md`, `README.md`, `ARCHITECTURE_MAP.md`, `CODEBASE_OVERVIEW.md`, `DEVELOPMENT_GUIDE.md`, `.env.example`, package scripts, API routes, shared backend/data code, MCP server code, tests, docs, and current git status. This audit changed documentation/task files only and did not run paid APIs, deploy, mutate production data, reset databases, or touch secrets.

Current git status at audit start: clean working tree on `feat/v1.3-hosted-launch-readiness`.

| Claim | Current implementation | Real/mock/local status | Evidence file/path | Risk | Recommended next task |
|---|---|---|---|---|---|
| The app has no database-backed persistence. | Catalog, samples, gallery canvases, and release evidence are checked-in JSON; saved canvases use browser storage; no ORM, migrations, `DATABASE_URL`, Supabase, or persistent user store was found. `docs/SAMPLE_AND_PERSISTENCE_REALNESS.md` now summarizes sample, gallery, saved, share-link, seed API, and release-evidence boundaries. | Local/static only. No real DB. | `ARCHITECTURE_MAP.md`; `CODEBASE_OVERVIEW.md`; `apps/web/lib/data.ts`; `apps/web/lib/saved-canvases.ts`; `packages/shared/src/persistence/index.ts`; `.env.example`; `docs/SAMPLE_AND_PERSISTENCE_REALNESS.md` | Low after matrix; still avoid narrating saved/share links as multi-user durable links. | Task 41, seed/save API naming audit. |
| `/saved` stores canvases. | Save/import/delete/duplicate/share actions write validated `SavedCanvas` objects to `window.localStorage`; share links encode a validated bundle in the URL hash. Docs now state there is no backend saved-canvas database or public share service, and the realness matrix labels saved canvases as browser-local. | Local browser persistence. | `apps/web/lib/saved-canvases.ts`; `packages/shared/src/persistence/index.ts`; `apps/web/components/saved-canvases.tsx`; `apps/web/app/saved/page.tsx`; `apps/web/test/saved-canvases.test.ts`; `README.md`; `apps/web/README.md`; `docs/SAMPLE_AND_PERSISTENCE_REALNESS.md` | Data disappears with browser storage clearing and does not sync across browsers/devices. | Task 41, seed/save API naming audit. |
| `/api/canvas/save` saves a canvas. | The route parses and validates a `CanvasDocument`, returns `saved: true`, and includes a note that actual persistence is browser-local. It does not write to a server store, account, object store, shared database, or public share service; docs now call it a validation stub despite the route name. | Validation stub only. | `apps/web/app/api/canvas/save/route.ts`; `apps/web/test/canvas-save-route.test.ts`; `ARCHITECTURE_MAP.md`; `README.md`; `apps/web/README.md` | Low after docs update; future API demos should still avoid presenting this route as durable persistence. | Task 41, seed/save API naming audit. |
| `/api/canvas/[id]` retrieves saved canvases. | The route maps two hardcoded seed IDs to demo prompts and regenerates canvases. Unknown IDs return 404. | Seed/demo helper only. | `apps/web/app/api/canvas/[id]/route.ts`; `apps/web/test/canvas-seed-route.test.ts`; `ARCHITECTURE_MAP.md` | Route shape resembles a general object lookup even though no object store exists. | Task 41, seed/save API naming audit. |
| Dashboard generation is AI/provider-backed. | Prompt handling is deterministic TypeScript: `parsePromptIntent`, supported workflow detection, bounded queries, and validated `CanvasDocument` assembly. No LLM provider env var or SDK path was found. | Rule-based local generation plus optional public-data fetch. | `apps/web/lib/dashboard.ts`; `packages/shared/src/prompt/index.ts`; `packages/shared/src/schemas/index.ts`; `README.md`; package manifests | "Natural language" copy is true at the UI level, but judges may infer LLM generation unless the no-LLM boundary stays explicit. | Task 42, no-LLM/no-provider demo wording pass. |
| Live public data is generally available. | Live Socrata routing exists, but only catalog entries with `liveAvailable: true` can use it. Dallas is promoted only for verified non-ZIP fields; Dallas ZIP dashboards, Austin monthly dashboards, and Houston dashboards render sample/fallback. | Mixed: real public API for narrow Dallas paths; local sample/fallback for core demo dashboards. | `data/catalog/approved-datasets.json`; `packages/shared/src/adapters/index.ts`; `apps/web/lib/dashboard.ts`; `docs/LIVE_ADAPTERS.md`; `apps/web/test/dashboard.test.ts` | Overclaiming "live data" is the highest demo-honesty risk. Core judge prompts currently demonstrate fallback/sample truth more than live freshness. | Existing Task 30, public-data live/fallback proof matrix. |
| Static samples are source-owned production data. | Sample files are checked-in synthetic development samples aligned to public schemas, not complete source-owned production extracts. The sample/persistence matrix records Dallas 120 rows, Austin 120 rows, Houston 40 rows, zero missing ZIP rows, and Houston `precise_address` as hidden. | Local synthetic sample data. | `data/samples/*.sample.json`; `scripts/data-quality.mjs`; `apps/web/app/demo-readiness/page.tsx`; `README.md`; `docs/SAMPLE_AND_PERSISTENCE_REALNESS.md` | Low after matrix; demo narration should still say synthetic/schema-aligned sample rows. | Task 42, no-LLM/no-provider demo wording pass. |
| Miro export creates or updates Miro boards. | Web and MCP routes generate a validated preview-only `MiroExportSpec` JSON with required Source & Method content. No OAuth, access token, board ID, or write call exists. Docs now match the current three-template schema and label board creation as future-only. | Mock/preview spec only; no real third-party side effect. | `packages/shared/src/miro/index.ts`; `apps/web/app/api/export/miro-spec/route.ts`; `apps/mcp-server/src/index.ts`; `apps/web/test/miro-export-route.test.ts`; `docs/MIRO_EXPORT_SPEC.md`; `README.md` | Low after docs alignment; future Miro writes would require a new auth/security/provider boundary. | Task 38, no media-provider statement. |
| Image/video/media generation is implemented. | No image/video generation provider path, upload pipeline, artifact ownership model, or credit-spending env gate was found. Docs now say visual output is limited to validated dashboard UI, static brand assets, client-side CSV/JSON downloads, checked-in gallery canvases, and preview-only MiroExportSpec JSON. | Not implemented; no paid media provider. | `rg` audit across package manifests, env examples, API routes, components, shared code, and docs; `apps/web/public/brand`; `apps/web/lib/client-downloads.ts`; `README.md`; `ARCHITECTURE_MAP.md`; `docs/DEMO_SCRIPT.md` | Low after docs update; future media features would require explicit provider/storage/ownership/security design. | Task 42, no-LLM/no-provider demo wording pass. |
| Auth/security uses real accounts or demo identities. | No auth provider, login route, session middleware, JWT handling, user model, or demo identity seed was found. Header/docs say no-account/no-auth. | No auth; public app. | `apps/web/components/header.tsx`; `SECURITY.md`; `ARCHITECTURE_MAP.md`; package manifests; `.env.example` | Public hosting still needs platform-level firewall/rate limiting because middleware is only in-memory defense in depth. | Keep QA finding active; future platform rate-limit task requires deployment approval. |
| API integrations are secret-gated. | Runtime env example contains only public `NEXT_PUBLIC_*` labels and hosting/CI metadata; live Socrata calls use public endpoints and catalog mappings without keys. Vercel token references are docs/workflow-only. | Public/env-light; no runtime secrets required for sample mode. | `.env.example`; `apps/web/app/api/health/route.ts`; `packages/shared/src/adapters/index.ts`; `docs/HOSTED_BETA_DEPLOYMENT.md`; `scripts/verify-vercel-build-output.mjs` | New integrations could accidentally introduce secret requirements without a matching architecture/security update. | Task 42, no-provider/no-secret demo wording pass. |
| Release evidence proves current HEAD. | `docs/release-evidence.json` records commit `a5ce07a81ee932bdf7a37724af0e7aab3a3d9f0f`; the current branch has advanced beyond that evidence. `GOVERNANCE_NOTE.md`, `docs/DEMO_SCRIPT.md`, and `docs/README.md` now warn not to cite it as current proof until Task 35 reruns the full gate. | Historical release evidence, not current proof. | `docs/release-evidence.json`; `QA_FINDINGS.md`; `GOVERNANCE_NOTE.md`; `docs/DEMO_SCRIPT.md`; `docs/README.md`; `pnpm governance:audit` warning history | Low for demo wording after docs warning; still high for release readiness until Task 35 refreshes evidence. | Existing Task 35, gated release evidence refresh. |

## Validation Commands

Commands that prove or preserve the current claims without paid/live/deploy/destructive side effects:

```bash
git status --short --branch
git diff --check
pnpm lint
pnpm typecheck
pnpm test
pnpm governance:audit
pnpm data:quality
```

Optional/network-dependent checks that should be run only when explicitly approved or during release readiness:

```bash
pnpm smoke:live
pnpm smoke:deploy -- --url <running-url>
PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote
pnpm verify:prod-local
pnpm release:check
```

Do not use `pnpm clean`, deploy commands, production data mutation, release-evidence refresh, or paid provider calls as part of a routine realness audit.

## Audit Notes

- Current user-facing copy is mostly honest about local saves, sample fallback, preview-only Miro output, no auth, and no database.
- The main release/demo risks are overclaiming live data, treating synthetic samples as full source extracts, treating release evidence as current, and letting route names imply persistence where none exists.
- No product behavior was changed by this audit.
