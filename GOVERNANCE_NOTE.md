# Governance Note

Last reconciled: May 10, 2026

## Release Evidence Warning

`pnpm governance:audit` currently passes, but emits this warning:

```text
release evidence commit differs from HEAD: Recorded a5ce07a; current HEAD is 2021b47.
Refresh hosted release evidence before tagging if this is not intentional.
```

The warning is caused by `docs/release-evidence.json`. That file records:

- `releaseVersion`: `v1.3.0-hosted-launch-readiness`
- `branch`: `feat/v1.3-hosted-launch-readiness`
- `commit`: `a5ce07a81ee932bdf7a37724af0e7aab3a3d9f0f`

The current branch `HEAD` is:

- `2021b47806547d89760065dd13dc290b840c39f6`

`scripts/governance-audit.mjs` treats this as a warning, not a failure, when the recorded commit resolves locally but does not equal `HEAD`.

## Why This Exists

The release evidence file is a historical evidence surface for release reviewers and `/demo-readiness`. It records the commit and gate results that were verified at the time evidence was produced. The current `HEAD` contains later governance-audit and release-evidence-check changes, so blindly changing the evidence commit to `HEAD` would imply that every recorded gate in `docs/release-evidence.json` was rerun for the newer commit.

That would break the audit trail unless the full release gate was actually rerun and the evidence was intentionally refreshed.

## Safe Resolution Before Release

Before tagging or claiming release readiness:

1. Start from a clean working tree on the intended release branch.
2. Run the full release gate expected for release evidence, not only the lightweight local checks.
3. Refresh `docs/release-evidence.json` with the verified release version, branch, commit under test, timestamps, gate results, hosted status, and screenshot paths.
4. Re-run `pnpm governance:audit`.
5. If the evidence commit intentionally records a tested commit that is not the evidence-file commit itself, keep that distinction documented rather than rewriting history only to silence the warning.

Until then, the warning should remain documented and treated as a release-readiness reminder, not as a product-behavior blocker.

## Daily Checks Versus Release Gates

Routine development checks are the safe default for normal code, test, and docs work:

```bash
pnpm lint
pnpm typecheck
pnpm test
```

Add focused local checks when relevant:

- UI/accessibility changes: `pnpm test:e2e`
- Catalog/sample/gallery changes: `pnpm governance:audit` and `pnpm data:quality`

Release and deployment gates are broader and should be run only when intentionally validating release readiness:

```bash
pnpm build
pnpm preflight
pnpm verify:prod-local
pnpm release:check
```

Smoke and remote checks are environment-dependent:

- `pnpm smoke:live` uses public live APIs.
- `pnpm smoke:deploy -- --url <url>` requires a running local or hosted deployment URL.
- `pnpm test:e2e:remote` requires `PLAYWRIGHT_BASE_URL`.

Do not refresh `docs/release-evidence.json` as part of daily checks. Refresh it only after the intended release gate has been rerun for the intended release commit.
