# Texas Data Canvas Web

Next.js App Router shell for the Texas Data Canvas MVP.

## Routes

- `/` redirects to `/explore`
- `/explore` renders the main prompt and validated canvas shell
- `/sources` renders the approved dataset catalog
- `/saved` renders the saved canvases placeholder

## Commands

```bash
pnpm --filter @texas-data-canvas/web dev
pnpm --filter @texas-data-canvas/web typecheck
pnpm --filter @texas-data-canvas/web build
```

The P1 canvas uses a local seed `CanvasDocument` validated by `@texas-data-canvas/shared`.
