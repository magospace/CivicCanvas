# Documentation Index

Use this index to choose the current source of truth before opening older milestone notes. Treat the `Current Starting Points`, `Current Domain Docs`, and `Release And Demo Docs` sections as the operational entry points for today's app; treat `Historical And Reference Docs` as background unless a current doc links to a specific historical section.

## Current Starting Points

| Document | Use |
|---|---|
| [`../README.md`](../README.md) | Product scope, setup, routes, verification commands, deployment notes, and known sample/live boundaries. |
| [`../CODEBASE_OVERVIEW.md`](../CODEBASE_OVERVIEW.md) | Current system overview, supported workflows, folder ownership, environment variables, and risks. |
| [`../ARCHITECTURE_MAP.md`](../ARCHITECTURE_MAP.md) | Current architecture diagram, route/API/data-flow map, validation boundaries, persistence model, and side effects. |
| [`../DEVELOPMENT_GUIDE.md`](../DEVELOPMENT_GUIDE.md) | Local setup, safe change workflows, risky files, validation commands, and recommended next work. |
| [`../AGENTS.md`](../AGENTS.md) | Repo-specific agent constraints and public-data safety rules. |
| [`../GOVERNANCE_NOTE.md`](../GOVERNANCE_NOTE.md) | Current release-evidence warning and safe resolution process. |
| [`../SECURITY.md`](../SECURITY.md) | Security reporting process and product safety boundaries. |

## Current Domain Docs

| Document | Use |
|---|---|
| [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) | Current implementation status, supported workflows, and known gaps. |
| [`DATA_GOVERNANCE.md`](DATA_GOVERNANCE.md) | Dataset approval, hidden-field, aggregation, caveat, and fallback expectations. |
| [`LIVE_ADAPTERS.md`](LIVE_ADAPTERS.md) | Live public API adapter boundaries and fallback behavior. |
| [`LIVE_FALLBACK_PROOF.md`](LIVE_FALLBACK_PROOF.md) | Dallas, Austin, and Houston demo prompt proof matrix for live, sample, and fallback claims. |
| [`SAMPLE_AND_PERSISTENCE_REALNESS.md`](SAMPLE_AND_PERSISTENCE_REALNESS.md) | Sample row provenance, browser-local persistence, share-link, seed API, gallery fixture, and historical release-evidence boundaries. |
| [`LOCAL_PERSISTENCE_SPIKE.md`](LOCAL_PERSISTENCE_SPIKE.md) | Planning-only local/backend saved-canvas persistence spike with env gate, migration, reset, rollback, and test assumptions. |
| [`MCP_SERVER_SPEC.md`](MCP_SERVER_SPEC.md) | MCP server tools, contracts, and safety expectations. |
| [`CANVAS_SPEC.md`](CANVAS_SPEC.md) | Canvas document/block model rendered by the trusted React registry. |
| [`MIRO_EXPORT_SPEC.md`](MIRO_EXPORT_SPEC.md) | Preview-only Miro export spec boundaries. |

## Release And Demo Docs

These are current operational handoff docs, but release proof remains gated. Use checklist and runbook docs for demo preparation; do not treat historical evidence or milestone plans as current proof.

| Document | Use |
|---|---|
| [`RELEASE_NOTES.md`](RELEASE_NOTES.md) | Current release notes and version-specific changes. |
| [`HOSTED_BETA_DEPLOYMENT.md`](HOSTED_BETA_DEPLOYMENT.md) | Manual hosted deployment runbook. |
| [`V1_3_HOSTED_LAUNCH_READINESS_PLAN.md`](V1_3_HOSTED_LAUNCH_READINESS_PLAN.md) | Current v1.3 hosted launch-readiness plan. |
| [`DEMO_SCRIPT.md`](DEMO_SCRIPT.md) | Demo prompts and walkthrough steps. |
| [`DEMO_VIDEO_CHECKLIST.md`](DEMO_VIDEO_CHECKLIST.md) | Screen-recording checklist for hackathon demo video capture without generated-media claims. |
| [`HACKATHON_SUBMISSION_CHECKLIST.md`](HACKATHON_SUBMISSION_CHECKLIST.md) | Submission metadata and proof checklist that separates local, hosted, live, media, and release-evidence claims. |
| [`HACKATHON_DEMO_READINESS.md`](HACKATHON_DEMO_READINESS.md) | Local-first judge-demo checklist that does not refresh release evidence. |
| [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md) | Product acceptance checklist. |
| [`release-evidence.json`](release-evidence.json) | Historical release evidence consumed by health/demo-readiness/governance checks. It records commit `a5ce07a81ee932bdf7a37724af0e7aab3a3d9f0f`, not the current branch `HEAD`; do not cite it as current proof or refresh it without rerunning the release gate through Task 35. |

## Historical And Reference Docs

These files are useful background, but they are milestone snapshots rather than the primary current-state docs. Do not cite them as current architecture, release proof, live-provider support, media-generation support, Miro board-write support, or persistence behavior unless a current operational doc above explicitly confirms the same claim.

Historical docs are intentionally retained for auditability; do not delete or rewrite them as part of index maintenance.

- [`PRD.md`](PRD.md)
- [`MVP_BUILD_BRIEF.md`](MVP_BUILD_BRIEF.md)
- [`AGENT_DEVELOPMENT_PLAN.md`](AGENT_DEVELOPMENT_PLAN.md)
- [`REPO_STRUCTURE.md`](REPO_STRUCTURE.md)
- [`SECURITY_GOVERNANCE_REVIEW.md`](SECURITY_GOVERNANCE_REVIEW.md)
- [`CODEX_PROMPTS.md`](CODEX_PROMPTS.md)
- [`REFERENCES.md`](REFERENCES.md)
- [`HOUSTON_TRANSTAR_ACCESS_PACKET.md`](HOUSTON_TRANSTAR_ACCESS_PACKET.md)
- [`V0_4_PRODUCTION_PILOT_PLAN.md`](V0_4_PRODUCTION_PILOT_PLAN.md)
- [`V0_5_PUBLIC_BETA_PLAN.md`](V0_5_PUBLIC_BETA_PLAN.md)
- [`V0_6_HOSTED_BETA_PLAN.md`](V0_6_HOSTED_BETA_PLAN.md)
- [`V0_8_PRODUCT_READINESS_PLAN.md`](V0_8_PRODUCT_READINESS_PLAN.md)
- [`V0_9_PUBLIC_RELIABILITY_PLAN.md`](V0_9_PUBLIC_RELIABILITY_PLAN.md)
- [`V1_PUBLIC_PILOT_PLAN.md`](V1_PUBLIC_PILOT_PLAN.md)
- [`V1_1_PRODUCT_DEPTH_PLAN.md`](V1_1_PRODUCT_DEPTH_PLAN.md)
- [`V1_2_HOSTED_TRUST_PLAN.md`](V1_2_HOSTED_TRUST_PLAN.md)
