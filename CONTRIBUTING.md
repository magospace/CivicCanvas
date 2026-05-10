# Contributing

Thanks for helping improve Texas Data Canvas. This project is intentionally governed: dashboards must remain validated JSON specs rendered through the allowlisted React block registry.

## Branches

- Use `feat/<short-topic>` for feature and hardening work.
- Keep commits phase-scoped and reviewable.
- Do not commit `.vercel/project.json`, deployment URLs with secrets, tokens, org IDs, project IDs, build output, or local environment files.

## Local Setup

```bash
pnpm install
pnpm build
pnpm --filter @texas-data-canvas/web dev
```

## Required Checks

Before opening a PR or asking for review, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm governance:audit
pnpm data:quality
```

Before any release candidate, also run:

```bash
pnpm verify
pnpm verify:prod-local
pnpm release:check
```

## Safety Rules

- No arbitrary generated HTML, JavaScript, SQL, SoQL, external map layers, or dynamic React components.
- No `dangerouslySetInnerHTML`, `eval`, generated script strings, or model-provided component names.
- Dataset access must go through approved catalog metadata and `BoundedQuerySpec`.
- Every generated or curated `CanvasDocument` must include `SourceMethodBlock`.
- Fields classified `sensitive_hide` or `unknown_review` must not appear in queries, exports, Miro previews, gallery fixtures, or saved-canvas bundles.

## Data Changes

Catalog or sample changes must include:

- field classification for every exposed field
- source URL and caveats
- fallback sample file for live-enabled datasets
- bounded query tests for new queryable fields
- governance audit passing after the change

## Pull Request Checklist

- [ ] The change preserves allowlisted Canvas block rendering.
- [ ] The change preserves bounded query validation.
- [ ] New dataset fields are classified.
- [ ] Hidden fields do not appear in generated artifacts.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` pass.
- [ ] `pnpm governance:audit` passes for data, schema, or export changes.
