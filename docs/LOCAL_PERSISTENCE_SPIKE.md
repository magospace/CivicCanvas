# Local Backend Persistence Spike Plan

Last reviewed: May 10, 2026

This is a planning document only. It does not implement server persistence, add a database dependency, create migrations, or change the default browser-local saved-canvas workflow.

## Current Boundary

- `/saved` persists canvases in browser `localStorage`.
- Share links encode validated saved-canvas bundles in the URL hash.
- `/api/canvas/save` is a validation stub and does not write to a backend.
- `/api/canvas/[id]` is a hardcoded seed/demo helper, not an object lookup service.

## Spike Goal

Prototype an optional local/dev backend saved-canvas store while preserving the existing no-account browser-local demo path.

A future implementation must be explicitly env-gated, local/dev only by default, and honest in UI/API metadata. It must not touch production data or require production credentials.

## Candidate Local Store

Preferred spike target: SQLite file under an ignored local development path.

Rationale:

- Runs locally without managed infrastructure.
- Supports migration/reset/seed flows with ordinary files.
- Keeps production deployment unaffected unless a later approved task promotes the architecture.
- Avoids introducing a hosted account, auth provider, or production database during the spike.

Do not silently introduce `DATABASE_URL` or a hosted database. If a future task chooses Postgres/Supabase/Neon instead, it must add explicit secret handling, local test database setup, and production-safety docs before implementation.

## Proposed Env Gate

Use a non-secret public/local switch for the spike, for example:

```bash
TDC_ENABLE_LOCAL_CANVAS_DB=1
TDC_LOCAL_CANVAS_DB_PATH=.local/texas-data-canvas.sqlite
```

Rules:

- Default unset behavior remains browser-local only.
- `.local/` and any SQLite files must stay ignored/uncommitted.
- Do not commit `.env` files with real values.
- API health/status metadata must show whether backend persistence is disabled, local-dev only, or unavailable.

## Draft Schema

One table is enough for a spike:

```sql
CREATE TABLE saved_canvases (
  id TEXT PRIMARY KEY,
  canvas_json TEXT NOT NULL,
  prompt TEXT NOT NULL,
  title TEXT NOT NULL,
  saved_at TEXT NOT NULL,
  app_version TEXT,
  schema_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

Validation rules:

- Parse `canvas_json` through `savedCanvasSchema` or `canvasDocumentSchema` before insert and after read.
- Reject oversized imports using existing `runtimeLimits.maxSavedCanvasImportBytes`.
- Preserve SourceMethodBlock and hidden-field checks.
- Never store raw secrets, provider keys, auth tokens, or unvalidated user HTML.

## Approval Checklist Before Implementation

Do not start a local/backend persistence implementation until an explicitly scoped task records approval for all of these items:

- Persistence mode and owner: confirm the task is local/dev only, not production persistence or a public share service.
- Storage target: confirm SQLite under an ignored local path, or document why another local/dev database is required.
- Env gate: confirm default unset behavior keeps browser-local localStorage and URL-hash sharing unchanged.
- Migration scope: list the migration command, target path, idempotence expectation, and temporary-test-database validation.
- Seed/reset scope: list seed source fixtures and prove reset refuses paths outside `.local/` or test temp directories.
- Rollback path: document how to return to browser-local-only mode by unsetting the env gate, without deleting user browser-local data.
- UI/API honesty: define copy and health metadata that distinguish browser-local, local-backend-enabled, unavailable, and production-unsupported states.
- Validation gates: include focused persistence tests, saved-canvas E2E default-path coverage, governance checks, and `pnpm persistence:readiness:json`.


## Submission And Demo Gate

Submission/demo docs must continue to describe current saved-canvas behavior as browser-local until a future approved Task 55 implementation changes product behavior. `pnpm persistence:readiness:json` is the safe no-network readiness check for this boundary; it should report no mutation, no DB runtime files, no env-value echo, and `persistenceImplemented: false` until the implementation task is approved.

Do not use submission pressure as approval to create migrations, reset local databases, add `DATABASE_URL`, or replace URL-hash/browser-local fallback behavior.

## Migration And Rollback Assumptions

Migration assumptions:

1. Migrations run only when `TDC_ENABLE_LOCAL_CANVAS_DB=1`.
2. Migrations target only the configured local SQLite file.
3. Migration command should be idempotent and safe on an empty local database.
4. CI can run migrations against a temporary file.

Rollback assumptions:

1. Stop using the backend path by unsetting `TDC_ENABLE_LOCAL_CANVAS_DB`.
2. Browser-local saved canvases remain available because default localStorage behavior is preserved.
3. Delete the local SQLite file only when explicitly resetting local dev state.
4. Do not add destructive production rollback instructions until a production database exists and is approved.

## Seed/Reset Strategy

Future commands could be:

```bash
pnpm local-db:migrate
pnpm local-db:seed
pnpm local-db:reset
```

Constraints:

- `reset` must refuse to run unless the configured path is under an approved local directory such as `.local/` or a test temp directory.
- Seed data should use checked-in gallery canvases or generated sample canvases; no production exports.
- Generated SQLite files and seed outputs must not be committed.

## API/UI Behavior Changes Needed

If implemented later:

- `/api/canvas/save` should stop saying only validation stub when local backend mode is enabled, but must still state local/dev persistence only.
- `/saved` should show whether saves are browser-local or local backend-backed.
- Share links should remain hash-bundle based unless a future public share service is explicitly designed.
- Health metadata should expose persistence mode without leaking paths outside a safe basename/status summary.

## Test Matrix For Future Implementation

Required tests before implementation can be considered complete:

- Default mode: `/api/canvas/save` remains validation-only and does not create a DB file.
- Env-gated local mode: valid saved canvas inserts and reads back after schema validation.
- Invalid canvas: rejected before insert.
- Oversized import: rejected before insert.
- Hidden-field fixture: rejected or fails governance checks.
- Reset guard: refuses paths outside allowed local/test directories.
- Health metadata: reports browser-local default vs local-backend enabled mode honestly.
- E2E: saved-canvas workflow still works without the backend gate.

Validation commands for a future implementation:

```bash
git diff --check
pnpm persistence:readiness:json
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e -- tests/e2e/product-demo.spec.ts -g "saved"
pnpm governance:audit
```

`pnpm persistence:readiness:json` is a read-only pre-implementation check. It does not create a database, run migrations, or enable persistence; it records that browser-local storage remains the default and points back to this plan plus Task 55.

If migrations are added, also run the migration command, seed command, and reset command against a temporary local database.

## Non-Goals

- No auth or user accounts.
- No production database.
- No public multi-user share service.
- No destructive operations against production data.
- No replacement of browser-local fallback unless explicitly approved.
