<!-- generated-by: portfolio-foundation-fix -->
# CivicCanvas Validation Guide

Use this file as the first stop for Codex, Hermes, Claude Code, and Paperclip agents before committing or pushing.

## Standard Checks

- `pnpm run typecheck`
- `pnpm run lint`
- `pnpm run test`
- `pnpm run test:e2e`
- `pnpm run build`
- `git diff --check`

## Package Scripts

- `audit:demo-data`: `node scripts/audit-hardcoded-demo-data.mjs`
- `build`: `pnpm -r --sort build`
- `clean`: `rm -rf node_modules apps/web/.next apps/web/tsconfig.tsbuildinfo apps/mcp-server/dist apps/mcp-server/tsconfig.tsbuildinfo packages/shared/dist packages/shared/tsconfig.tsbuildinfo .turbo test-results playwright-report .vercel/output`
- `data:quality`: `node scripts/data-quality.mjs`
- `data:quality:json`: `node scripts/data-quality.mjs --json`
- `data:realism`: `node scripts/data-realism-audit.mjs`
- `data:realism:json`: `node scripts/data-realism-audit.mjs --json`
- `demo:artifact-hygiene`: `node scripts/demo-artifact-hygiene.mjs`
- `demo:artifact-hygiene:json`: `node scripts/demo-artifact-hygiene.mjs --json`
- `demo:readiness:snapshot`: `node scripts/demo-readiness-snapshot.mjs`
- `demo:readiness:snapshot:json`: `node scripts/demo-readiness-snapshot.mjs --json`
- `demo:screenshots`: `node scripts/capture-demo-screenshots.mjs`
- `demo:screenshots:json`: `node scripts/capture-demo-screenshots.mjs --json`
- `dev`: `pnpm --filter @texas-data-canvas/web dev`
- `docs:links`: `node scripts/check-doc-links.mjs`
- `docs:links:json`: `node scripts/check-doc-links.mjs --json`
- `governance:audit`: `node scripts/governance-audit.mjs`
- `governance:audit:json`: `node scripts/governance-audit.mjs --json`
- `hygiene:artifacts`: `node scripts/check-generated-artifact-hygiene.mjs`
- `hygiene:artifacts:json`: `node scripts/check-generated-artifact-hygiene.mjs --json`
- `lint`: `pnpm --filter @texas-data-canvas/web lint`
- `live:fallback-proof`: `node scripts/live-fallback-proof.mjs`
- `live:fallback-proof:json`: `node scripts/live-fallback-proof.mjs --json`
- `local:push-readiness`: `node scripts/local-push-readiness.mjs`
- `local:push-readiness:json`: `node scripts/local-push-readiness.mjs --json`
- `media:fal:smoke`: `node scripts/fal-media-smoke.mjs`
- `media:fal:smoke:json`: `node scripts/fal-media-smoke.mjs --json`
- `persistence:readiness`: `node scripts/local-persistence-readiness.mjs`
- `persistence:readiness:json`: `node scripts/local-persistence-readiness.mjs --json`
- `preflight`: `node scripts/preflight.mjs && node scripts/governance-audit.mjs && pnpm lint && pnpm typecheck && pnpm test && pnpm build`
- `provenance:summary`: `node scripts/source-provenance-summary.mjs`
- `provenance:summary:json`: `node scripts/source-provenance-summary.mjs --json`
- `provider:openai:smoke`: `node scripts/openai-smoke.mjs`
- `provider:openai:smoke:json`: `node scripts/openai-smoke.mjs --json`
- `release:check`: `node scripts/governance-audit.mjs && node scripts/data-quality.mjs && node scripts/verify-prod-local.mjs && node scripts/verify-vercel-build-output.mjs`
- `release:evidence:precheck`: `node scripts/release-evidence-precheck.mjs`
- `release:evidence:precheck:json`: `node scripts/release-evidence-precheck.mjs --json`
- `sample:freshness`: `node scripts/sample-freshness-snapshot.mjs`
- `sample:freshness:json`: `node scripts/sample-freshness-snapshot.mjs --json`
- `smoke:deploy`: `node scripts/smoke-deploy.mjs`
- `smoke:deploy:json`: `node scripts/smoke-deploy.mjs --json`
- `smoke:live`: `node scripts/smoke-live.mjs`
- `smoke:live:json`: `node scripts/smoke-live.mjs --json`
- `start:web`: `pnpm --filter @texas-data-canvas/web start`
- `submission:guard`: `node scripts/final-submission-guard.mjs`
- `submission:guard:json`: `node scripts/final-submission-guard.mjs --json`
- `submission:readiness`: `node scripts/submission-readiness.mjs`
- `submission:readiness:json`: `node scripts/submission-readiness.mjs --json`
- `submission:todo-scan`: `node scripts/submission-todo-scan.mjs`
- `submission:todo-scan:json`: `node scripts/submission-todo-scan.mjs --json`
- `test`: `vitest run`
- `test:e2e`: `playwright test`
- `test:e2e:remote`: `node scripts/require-playwright-base-url.mjs && playwright test`
- `test:watch`: `vitest`
- `typecheck`: `pnpm -r --sort typecheck`
- `verify`: `pnpm preflight && pnpm smoke:live && pnpm test:e2e`
- `verify:prod-local`: `node scripts/verify-prod-local.mjs`
- `verify:vercel-output`: `node scripts/verify-vercel-build-output.mjs`

## Push Gate

- Run task-specific checks first.
- Run `git diff --check` before every commit.
- Confirm no secrets, `.env` values, private exports, caches, or huge generated artifacts are staged.
- Push only with `git push origin HEAD`; never force push without explicit approval.
