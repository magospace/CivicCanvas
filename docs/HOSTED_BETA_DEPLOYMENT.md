# Hosted Beta Deployment Runbook

Last updated: May 10, 2026

This runbook supports a future hosted-beta deployment. The currently validated hackathon path is local/Loom first, and no public URL should be entered in a submission form until `pnpm smoke:deploy` has passed against that exact URL. Use manual Vercel CLI deployment only when a deployment owner, public URL, and smoke window are available. Add Git-integrated preview or production workflows only after the Vercel project and credential ownership are clear.

## Safety Rules

- Do not commit `.vercel/project.json`.
- Do not commit Vercel tokens, organization IDs, project IDs, or secret-bearing deployment URLs.
- Do not commit `.env.local` or any `.env.*.local` file.
- Keep the app usable without secrets; sample fallback must remain available.
- Keep dashboards as validated `CanvasDocument` JSON rendered through the allowlisted React block registry.
- Keep Vercel-native firewall or rate-limit controls enabled for broad public sharing. The repo includes lightweight middleware throttling as a best-effort no-database guard, not as a replacement for platform controls.

## Hosted-Beta Environment

Use these values for the hosted beta deployment:

```bash
NEXT_PUBLIC_APP_ENV=hosted-beta
NEXT_PUBLIC_APP_VERSION=v1.3.0-hosted-launch-readiness
```

Optional:

```bash
NEXT_PUBLIC_SITE_URL=https://your-public-beta.example
```

`NEXT_PUBLIC_SITE_URL` is used only for public runtime metadata and smoke-test diagnostics. It is not a secret.

Next.js reads `NEXT_PUBLIC_*` values into the production client/server bundle at build time. For version-sensitive smoke checks, build the web app with the hosted-beta environment values set, not only `next start`.

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

For a local production-style hosted smoke check after `pnpm build`, rebuild the web app with hosted-beta public metadata and run `next start` from `apps/web`:

```bash
NEXT_PUBLIC_APP_ENV=hosted-beta \
NEXT_PUBLIC_APP_VERSION=v1.3.0-hosted-launch-readiness \
pnpm --dir apps/web exec next build

NEXT_PUBLIC_APP_ENV=hosted-beta \
NEXT_PUBLIC_APP_VERSION=v1.3.0-hosted-launch-readiness \
pnpm --dir apps/web exec next start -p 3004
```

Then, from another shell:

```bash
pnpm smoke:deploy -- --url http://localhost:3004 --expect-version v1.3.0-hosted-launch-readiness
PLAYWRIGHT_BASE_URL=http://localhost:3004 pnpm test:e2e:remote
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
NEXT_PUBLIC_APP_VERSION=v1.3.0-hosted-launch-readiness \
pnpm install --frozen-lockfile

NEXT_PUBLIC_APP_ENV=hosted-beta \
NEXT_PUBLIC_APP_VERSION=v1.3.0-hosted-launch-readiness \
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
pnpm smoke:deploy -- --url https://your-public-beta.example --expect-version v1.3.0-hosted-launch-readiness
pnpm smoke:deploy:json -- --url https://your-public-beta.example --expect-version v1.3.0-hosted-launch-readiness
PLAYWRIGHT_BASE_URL=https://your-public-beta.example pnpm test:e2e:remote
```

Do not claim hosted readiness, tag a hosted release, or put a public URL in the hackathon form until the hosted deployment smoke and remote browser smoke pass against that public URL.

If a Git remote is available, the same checks can be run from GitHub Actions through the manual `Hosted Deploy Verify` workflow. Provide the public deployment URL and expected version when dispatching the workflow.

## GitHub Deployment Workflow Blocker

A manual `workflow_dispatch` workflow that performs Vercel deployment should be added only after all of the following are true:

- A Git remote is configured.
- `VERCEL_TOKEN` is available as a GitHub Actions secret.
- `VERCEL_ORG_ID` is available as a GitHub Actions secret.
- `VERCEL_PROJECT_ID` is available as a GitHub Actions secret.

Until then, manual Vercel CLI deployment is the supported path.

The repository includes a separate manual hosted verification workflow that checks an already deployed URL. It does not deploy, does not require Vercel secrets, and is safe to keep network-free normal CI unchanged.
