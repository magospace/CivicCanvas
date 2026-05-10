# Local Demo Smoke Checklist

Use this checklist before recording the CivicCanvas Loom or doing an in-person local demo. It focuses on the browser-local saved-canvas edit/export/share path and preserves the current no-account/no-database honesty boundary.

## Preconditions

- Run from a local dev server at `http://localhost:3000/explore` or a validated equivalent local URL.
- Do not open `.env` files or provider dashboards on screen.
- Do not claim backend persistence, account sync, public share hosting, production auth, or a deployed database.
- If browser storage already has old demo records, either use a clean profile or say that saved canvases are local to this browser.

## Browser-Local Save/Edit/Share Flow

1. Open `/explore`.
2. Run the main prompt:

   ```text
   Show Dallas 311 service requests by category and ZIP code for 2024.
   ```

3. Confirm the generated dashboard shows source/method attribution, caveats, and query audit.
4. Save the canvas locally.
5. Open `/saved`.
6. Confirm the saved card appears with browser-local copy.
7. Edit the saved title and prompt metadata.
8. Confirm the edited title/prompt remain visible on the saved card.
9. Reopen the edited saved canvas in `/explore`.
10. Confirm the reopened dashboard uses the edited metadata while preserving validated source/method content.
11. Return to `/saved` and export the saved bundle JSON.
12. Generate/copy the URL-hash share link.
13. If showing import, use the normal saved-canvas JSON import control and validate that unsafe JSON is rejected.
14. Delete the saved record if you need a clean ending state.

## What To Say

Use concise wording like:

- "Saved canvases are browser-local in this MVP. They are real editable local records through the normal product UI, but they are not stored in a backend database."
- "The export and share link are validated bundles. The share link is a URL hash, not a hosted public object."
- "Clearing browser storage or switching browsers can remove these saved records."
- "This local persistence is useful for the hackathon demo without pretending we have accounts, sync, or production storage."

## Data Realism Classification

- Saved canvas card: browser-local persistence / acceptable.
- Edited title/prompt: browser-local saved record mutation through normal UI / acceptable.
- Reopen path: normal saved-canvas bundle → validated canvas path / acceptable.
- Export/share: validated JSON/hash bundle / acceptable, not backend persistence.
- Invalid import rejection: normal product validation / acceptable.

## Validation Commands

Run the automated proof when touching saved-canvas behavior:

```bash
pnpm test -- apps/web/test/saved-canvases.test.ts
pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "saved bundle"
pnpm lint
```

Run broader checks before final handoff when time permits:

```bash
pnpm typecheck
pnpm test
pnpm data:realism:json
```

## Do Not Claim

- Database-backed saved canvases.
- User accounts or cross-device sync.
- Public hosted share links.
- Production storage or object buckets.
- Release evidence for the current commit unless Task 35 refreshes it intentionally.
