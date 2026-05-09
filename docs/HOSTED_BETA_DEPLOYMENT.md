# Hosted Beta Deployment Runbook

Last updated: May 9, 2026

This runbook supports the first `v0.6.0-hosted-beta` deployment path while the repository has no configured Git remote. Use manual Vercel CLI deployment for now. Add Git-integrated preview or production workflows only after a remote exists and Vercel project credentials are available.

## Safety Rules

- Do not commit `.vercel/project.json`.
- Do not commit Vercel tokens, organization IDs, project IDs, or secret-bearing deployment URLs.
- Do not commit `.env.local` or any `.env.*.local` file.
- Keep the app usable without secrets; sample fallback must remain available.
- Keep dashboards as validated `CanvasDocument` JSON rendered through the allowlisted React block registry.

## Hosted-Beta Environment

Use these values for the hosted beta deployment:

```bash
NEXT_PUBLIC_APP_ENV=hosted-beta
NEXT_PUBLIC_APP_VERSION=v0.6.0-hosted-beta
```

Optional:

```bash
NEXT_PUBLIC_SITE_URL=https://your-public-beta.example
```

`NEXT_PUBLIC_SITE_URL` is used only for public runtime metadata and smoke-test diagnostics. It is not a secret.

## Local Preflight

From the repository root:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm verify
```

## Manual Vercel CLI Path

Install and authenticate the Vercel CLI outside the repo if needed:

```bash
npx vercel@latest login
```

Pull project settings only after selecting the correct Vercel team/project:

```bash
npx vercel@latest pull --yes --environment=preview
```

The pull step creates `.vercel/project.json`; keep it local and uncommitted.

Set hosted-beta public env vars in Vercel project settings or during deployment. Then build and deploy from the repository root:

```bash
NEXT_PUBLIC_APP_ENV=hosted-beta \
NEXT_PUBLIC_APP_VERSION=v0.6.0-hosted-beta \
pnpm install --frozen-lockfile

NEXT_PUBLIC_APP_ENV=hosted-beta \
NEXT_PUBLIC_APP_VERSION=v0.6.0-hosted-beta \
npx vercel@latest build

npx vercel@latest deploy --prebuilt
```

Expected Vercel settings:

- Install command: `pnpm install --frozen-lockfile`
- Build command: `pnpm --filter @texas-data-canvas/web build`
- Framework preset: Next.js
- App directory: `apps/web`
- Required secrets: none for sample mode

## Hosted Verification

After deployment, run:

```bash
pnpm smoke:deploy -- --url https://your-public-beta.example --expect-version v0.6.0-hosted-beta
pnpm smoke:deploy:json -- --url https://your-public-beta.example --expect-version v0.6.0-hosted-beta
PLAYWRIGHT_BASE_URL=https://your-public-beta.example pnpm test:e2e:remote
```

Do not tag `v0.6.0-hosted-beta` until the hosted deployment smoke and remote browser smoke pass against a public URL.

## GitHub Workflow Blocker

A manual `workflow_dispatch` deploy workflow should be added only after all of the following are true:

- A Git remote is configured.
- `VERCEL_TOKEN` is available as a GitHub Actions secret.
- `VERCEL_ORG_ID` is available as a GitHub Actions secret.
- `VERCEL_PROJECT_ID` is available as a GitHub Actions secret.

Until then, manual Vercel CLI deployment is the supported path.
