# v0.6 Hosted Public Beta Plan

Last updated: May 9, 2026

## Goal

Move Texas Data Canvas from a no-auth public beta codebase to a hosted beta that can be verified against a public URL. The milestone should prove the app can be deployed, smoke-tested, and demoed without adding authentication, hosted persistence, LLM prompt parsing, live Miro writes, arbitrary generated UI, or arbitrary query execution.

Target tag: `v0.6.0-hosted-beta`

## Starting State

- `main` has been fast-forwarded to the tagged `v0.5.0-public-beta` release.
- v0.6 work is isolated on `feat/v0.6-hosted-beta`.
- No Git remote is configured, so Git-integrated preview and production deploy workflows are blocked until a remote and Vercel project credentials exist.
- Sample mode remains fully functional without secrets.
- Live adapters remain governed by approved catalog metadata and mandatory sample fallback.

## Non-Negotiables

- Dashboards render only from validated `CanvasDocument` JSON.
- React rendering stays behind the allowlisted block registry.
- No arbitrary HTML, JavaScript, SQL, SoQL, external map layers, external scripts, or dynamic React component names.
- No hosted database, authentication, user accounts, LLM dependency, or live Miro board writes in v0.6.
- Do not commit `.vercel/project.json`, Vercel tokens, organization IDs, project IDs, or secret-bearing deployment URLs.

## Work Plan

### 1. Release Hygiene

- Fast-forward `main` to the existing `v0.5.0-public-beta` tag.
- Create `feat/v0.6-hosted-beta` from updated `main`.
- Update implementation status so v0.5 is complete and v0.6 is the active milestone.
- Extend release notes with planned v0.6 work.

### 2. Deployment Configuration

- Document manual Vercel CLI deployment from this monorepo.
- Keep the repo deployable from the root with:
  - `pnpm install --frozen-lockfile`
  - `pnpm --filter @texas-data-canvas/web build`
  - Next.js app served from `apps/web`
- Document hosted-beta environment variables:
  - `NEXT_PUBLIC_APP_ENV=hosted-beta`
  - `NEXT_PUBLIC_APP_VERSION=v0.6.0-hosted-beta`
  - optional `NEXT_PUBLIC_SITE_URL`
- Add a manual workflow only after a Git remote and Vercel credentials exist.
- Avoid committing Vercel project linkage files or secrets.

### 3. Hosted Runtime Health

- Extend `/api/health` with optional hosted metadata:
  - app environment
  - app version
  - deployment provider
  - deployment URL
  - git commit SHA
  - git branch/ref
- Preserve existing health response fields for compatibility.
- Extend deployment smoke checks to cover:
  - `/api/health`
  - `/api/catalog/health`
  - `/explore`
  - `/sources`
  - `/saved`
  - production response headers
  - Dallas canvas generation
  - Austin canvas generation
  - unsupported prompt suggestion flow
  - expected app version when provided

### 4. Remote Browser QA

- Keep local `pnpm test:e2e` behavior unchanged.
- Add a remote mode driven by `PLAYWRIGHT_BASE_URL` with no local web server startup.
- Keep browser smoke tests focused on public beta flows:
  - load `/explore`
  - generate Dallas and Austin dashboards
  - show explicit sample mode
  - show live verification status on `/sources`
  - return suggestions for unsupported or sensitive prompts
  - reject unsafe saved-bundle import
  - include Source & Method in Miro preview
  - avoid mobile horizontal overflow

### 5. Hosted-Beta UX Copy

- Add subtle runtime copy for hosted beta without turning the app into a marketing landing page.
- Keep `/saved` clear that persistence is browser-local and portable bundles are the sharing mechanism.
- Keep `/sources` clear about Dallas ZIP sample fallback and Austin live monthly aggregation limitations.

### 6. Release Decision

- Run local gates:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - `pnpm verify`
- Deploy using Vercel CLI or a later configured manual workflow.
- Run hosted gates:
  - `pnpm smoke:deploy -- --url <public-url> --expect-version v0.6.0-hosted-beta`
  - `PLAYWRIGHT_BASE_URL=<public-url> pnpm test:e2e:remote`
- If no public URL is available, do not tag v0.6. Document the blocker.
- If hosted gates pass and the tree is clean, tag `v0.6.0-hosted-beta`.

## Acceptance Criteria

- `main` contains the complete v0.5 public beta.
- v0.6 work is committed on `feat/v0.6-hosted-beta`.
- Hosted deployment docs exist and do not contain secrets or project linkage.
- `/api/health` exposes optional hosted metadata while keeping existing fields compatible.
- Deployment smoke can validate pages, APIs, response headers, dashboard generation, unsupported prompt behavior, and expected app version.
- Playwright can run against either a local dev server or a remote public URL.
- Public hosted verification has either passed and produced a v0.6 tag, or the missing public URL/credential blocker is explicitly documented.

## Release Checklist

- `git status --short` is clean.
- `pnpm lint` passes.
- `pnpm typecheck` passes.
- `pnpm test` passes.
- `pnpm build` passes.
- `pnpm verify` passes locally.
- Public URL exists.
- Deployment smoke passes against the public URL with `--expect-version v0.6.0-hosted-beta`.
- Remote Playwright smoke passes with `PLAYWRIGHT_BASE_URL`.
- Tag `v0.6.0-hosted-beta`.

## Current Release Status

As of May 9, 2026, the local hosted-beta implementation is complete and local gates pass. The release is not tagged because no public Vercel URL is available in this repo context.

Passed locally:

- `pnpm verify`
- `pnpm smoke:deploy -- --url http://localhost:3004 --expect-version v0.6.0-hosted-beta`
- `PLAYWRIGHT_BASE_URL=http://localhost:3004 pnpm test:e2e:remote`

Blocked:

- No Git remote is configured.
- No Vercel deployment URL is available.
- No `VERCEL_TOKEN`, `VERCEL_ORG_ID`, or `VERCEL_PROJECT_ID` values are present in the local environment.

Do not create the `v0.6.0-hosted-beta` tag until hosted deployment smoke and remote Playwright smoke pass against a public URL.
