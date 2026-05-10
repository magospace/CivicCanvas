# Texas Data Canvas Web

Next.js App Router app for the Texas Data Canvas public-data explorer.

## Routes

- `/` redirects to `/explore`.
- `/explore` renders the main prompt-to-dashboard shell, inspector, governed exports, local save action, and Miro preview spec flow.
- `/sources` renders the approved dataset catalog with live/sample confidence, field classifications, caveats, and fallback status.
- `/saved` renders browser-local saved canvases with import/export bundles, URL-hash share links, duplicate/delete actions, and validated open-in-explore behavior.
- `/gallery` renders checked-in validated demo canvases through the allowlisted canvas renderer.
- `/demo-readiness` renders release utility checks, catalog health, sample/live boundaries, hosted blockers, and copyable demo/release handoff text.

Saved canvases stay in browser `localStorage`; there is no backend saved-canvas database or public share service. The `/api/canvas/save` route validates submitted `CanvasDocument` JSON for contract/API checks only. Despite the route name and `saved: true` response, it does not persist to a server, account, object store, or shared database.

## Commands

Run from the repository root:

```bash
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Open `http://localhost:3000/explore` after `pnpm dev`.

Use `pnpm test:e2e` for visible route, navigation, or accessibility changes. Use `pnpm governance:audit` and `pnpm data:quality` when catalog, sample, gallery, or public-data behavior changes.

Dashboards render only validated `CanvasDocument` JSON from `@texas-data-canvas/shared` through the trusted React block registry.
