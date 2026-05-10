# MCP Demo Proof Checklist

Use this checklist when showing the Brainforge/agent portion of Texas Data Canvas in a Loom or judge walkthrough. It is a demo guide only; it does not require secrets, production deployment, live provider spend, arbitrary SQL, or database persistence.

## Safe Setup Commands

```bash
pnpm --filter @texas-data-canvas/mcp-server build
pnpm --filter @texas-data-canvas/mcp-server inspect
```

If an inspector is unavailable in the local environment, show the MCP server package and tests instead:

```bash
pnpm test -- apps/mcp-server/test/tools.test.ts
```

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
