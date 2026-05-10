# MCP Demo Proof Checklist

Use this checklist when showing the Brainforge/agent portion of CivicCanvas in a Loom or judge walkthrough. It is a demo guide only; it does not require secrets, production deployment, live provider spend, arbitrary SQL, or database persistence.

## Safe Setup Commands

```bash
pnpm --filter @texas-data-canvas/mcp-server build
pnpm --filter @texas-data-canvas/mcp-server inspect
```

The checked-in `inspect` script uses MCP inspector CLI mode to list tools and exit without printing a browser proxy token. The MCP tool test remains a compact fallback proof for the same safe handlers:

```bash
pnpm test -- apps/mcp-server/test/tools.test.ts
```

## No-Secret Inspect Demo

For a Loom or judge walkthrough, keep the MCP proof limited to local build/inspect commands and safe narration. Do not show `.env` files, shell history with tokens, provider dashboards, billing pages, private browser tabs, or full environment dumps.

Safe commands to show or cite:

```bash
pnpm --filter @texas-data-canvas/mcp-server build
pnpm --filter @texas-data-canvas/mcp-server inspect
pnpm test -- apps/mcp-server/test/tools.test.ts
```

Safe narration:

- "The MCP server exposes approved Texas public-data tools backed by the same catalog and Zod contracts as the app."
- "Queries are bounded and catalog-validated; this is not arbitrary SQL or database shell access."
- "Miro output is preview-only JSON with no OAuth, token, board ID, or board write."
- "The demo does not require provider keys or production credentials."

If the inspector prints local paths, keep them out of the public transcript unless they are needed for debugging. If it prints environment details, stop the recording and rerun with a clean terminal.

## What To Show In 15-30 Seconds

- The repo ships a custom MCP server under `apps/mcp-server`.
- MCP tools expose approved catalog discovery, bounded query execution, source attribution, query audit, canvas validation/generation, and preview-only Miro export specs.
- All query paths are constrained by the same catalog, schemas, row limits, hidden-field rules, and sample/live fallback boundaries as the web app.
- Unsupported datasets or unsafe fields should fail with governed errors instead of arbitrary SQL or fabricated dashboards.

## Safe Tool Examples To Narrate

- List approved Texas public datasets.
- Validate catalog health.
- Run a bounded Dallas/Austin/Houston sample or approved aggregate query.
- Generate or validate a `CanvasDocument` with a `SourceMethodBlock`.
- Generate a preview-only `MiroExportSpec` JSON artifact.

## Boundary Phrases For The Demo

Use phrases like:

- "The MCP server lets agents work with the same approved data contracts as the app."
- "This is deterministic and bounded, not an arbitrary SQL or code-execution tool."
- "Miro output is preview JSON only; there is no OAuth or board write in this repo."
- "Saved canvases remain browser-local by default; this MCP demo does not add backend persistence."
- "Live/provider work remains opt-in and gated; the default demo uses safe samples/fallbacks where required."

Avoid claiming:

- Generic natural-language database access.
- Production database persistence.
- Live coverage for every city/dataset/field.
- Real Miro board creation or update.
- App-generated image/video artifacts.
- Current release evidence unless Task 35 has intentionally refreshed it for the target commit.

## Validation Before Recording

```bash
pnpm lint
pnpm typecheck
pnpm test -- apps/mcp-server/test/tools.test.ts
pnpm governance:audit
```

These checks are local/no-spend. Network-dependent live smoke, hosted deployment checks, and release evidence refreshes remain separate approval-gated tasks.
