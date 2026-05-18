# PAPERCLIP.md - CivicCanvas Agent Operating Contract

Paperclip is the durable control plane for CivicCanvas work. Repo files remain the detailed engineering memory, but Paperclip is where visible company work, ownership, assignment, blocked state, and cross-agent handoff should live.

## Paperclip Identity

- Company: CivicCanvas
- Issue prefix: `CIV`
- Local workspace: `/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet`
- Dashboard: `http://127.0.0.1:3100`
- API base: `http://127.0.0.1:3100/api`
- Product Engineering project: `06393449-a9a8-4c9e-9a18-352ba0cfdb08`
- Current company goal: Build a production Texas public-data canvas for governed dashboards, safe dataset discovery, bounded queries, source attribution, MCP workflows, local persistence, and deploy-ready civic data exploration.

## Paperclip Runtime Workspace

When Paperclip launches this run with `PAPERCLIP_WORKSPACE_CWD`, that path is the authoritative execution workspace. Before reading repo docs, editing files, running validation, or committing, run:

```bash
cd "$PAPERCLIP_WORKSPACE_CWD"
pwd
git rev-parse --show-toplevel
git status --short --branch
```

If `PAPERCLIP_WORKSPACE_CWD` differs from the source repo path in `PAPERCLIP_WORKSPACES_JSON`, treat the source repo as read-only reference for this run. Use relative paths after changing into the execution workspace; do not pass absolute source repo paths to edit/write tools, and do not edit or commit in the source repo unless Eduardo explicitly approved a source-repo pilot. Tool shell calls may not preserve a previous `cd`; for every shell command, either set the command working directory to `$PAPERCLIP_WORKSPACE_CWD` or prefix the command with `cd "$PAPERCLIP_WORKSPACE_CWD"`. If the intended file is missing from the execution workspace, stop and report a stale or incomplete checkout instead of writing into the source repo.

If the isolated workspace has no `node_modules` but the source repo does, create an ignored `node_modules` symlink to the source repo before package-script validation and run with the source dependency bin on `PATH`. Do not run `npm install`, `pnpm install`, `yarn install`, `bun install`, edit the source repo, or switch validation back to the source repo just to find local binaries unless the issue or operator explicitly approves that setup change. If the symlink fallback is insufficient, stop with a dependency setup blocker.

For scoped Next.js lint on bracketed dynamic route files, prefer the project script with a quoted file path, for example `npm run lint -- --file 'app/api/scenarios/[id]/route.ts'`. Avoid ad hoc escaped `npx next lint --file app/api/scenarios/\\[id\\]/route.ts` commands because Next lint can treat that as an empty or invalid pattern.

Run validation commands serially unless the repo's own workflow explicitly permits parallel execution. Do not run E2E/dev-server validation in parallel with lint, typecheck, build, docs audits, or other checks that share generated output directories. If a transient validation race occurs, rerun the affected checks serially and record both the race and the clean rerun.

## Paperclip Issue Status Gate

Only `backlog` and `todo` issues are dispatchable for checkout or first-run preparation. Every dispatchable issue must have an explicit Paperclip `projectId` whose project owns the repo and isolated `executionWorkspacePolicy`; a company-level issue with no project is prep-only/review-only until it is attached to a project. Treat `in_progress` as already active, `in_review` as closeout/review work, `blocked` as blocker resolution, and `done`/`cancelled` as terminal audit lanes. Use `paperclip:issue-readiness` and a dry-run `paperclip:claim-issue` before any apply run; a null patch or blocker list is a stop signal.

## Operator Decision Stops

When `paperclip:continuation-loop` selects `operator_decision_required`, or when an MCP continuation response reports the same gate, stop automated checkout/wake work and refresh the operator decision brief instead of improvising lifecycle changes.

Safe review:

```bash
node /Users/eduardobrambila/agent-stack/scripts/paperclip-operator-decision-brief.mjs --company CIV --json
node /Users/eduardobrambila/agent-stack/scripts/paperclip-operator-decision-brief.mjs --company CIV --apply --json
```

The MCP equivalent is `paperclip_operator_decision_brief`. The brief writes only an `operator-decision-brief` issue document when applied and includes `decisionActionGuide` with grouped decision kinds, selected stop, safe dry-run review commands, operator choices, approval-required apply templates, and forbidden shortcuts.

Treat the guide as report-only evidence. Safe dry-run review commands may be copied for inspection; approval-required apply templates are not permission to mutate. Do not wake agents, check out work, change issue lifecycle status, clean dirty trees, bind native workspaces, or edit `WORKFLOW.md` unless the operator explicitly approves that exact action.

## Symphony Workflow Contract

`WORKFLOW.md` is the active Paperclip/Symphony automated run contract for this repo. It defines issue tracker state, git-worktree workspace rules, validation hooks, Codex app-server posture, native `/goal` generation, and the issue prompt template. It does not replace this file, `AGENTS.md`, or `TASKS.md`; it tells automated dispatch how to use them safely.

## Native Agent Goals

There are three goal layers:

- Paperclip company goals: product and company strategy.
- Paperclip issues: the visible work envelope agents should prepare for native checkout, update, and complete.
- Native `/goal`: a per-session execution loop for one Paperclip issue or one bounded phase only.

When `WORKFLOW.md` contains a `goals` block, use the rendered `/goal` command for Codex, Claude Code, or Hermes runs that should continue across turns. Do not use `/goal` for vague portfolio backlogs or "keep working forever" instructions. Check status with `/goal`, pause with `/goal pause`, resume with `/goal resume`, and clear with `/goal clear`.

## Subagent Policy

Codex or Claude subagents may be used only as bounded helpers inside one active Paperclip issue. They do not own Paperclip issues, commits, pushes, or final reporting; the parent agent owns integration, validation, scoped commit, operator-gated push handoff, and Paperclip handoff.

Default limits:

- max 2 concurrent subagents inside one parent issue run;
- max depth 1, with no recursive fan-out;
- explicit, bounded instruction required before spawning;
- disjoint file ownership required for write-heavy subtasks.

Good uses: read-heavy exploration, code review, test triage, asset/research inventory, and independent implementation slices. Avoid portfolio-wide fanout, same-file concurrent edits, dirty-tree reconciliation with unclear ownership, unclear product decisions, destructive production operations, or vague "keep improving" work.

## Agent Routing Matrix

Paperclip agents are available role templates, not an always-on workforce. Route one issue to one lane before checkout prep:

| Issue type | Primary lane | Fallback lane |
| --- | --- | --- |
| build / implementation | Claude Builder | Codex Builder |
| review / QA / security / release | Claude QA Reviewer | Codex QA Backup |
| planning / roadmap / task replenishment | CEO | Codex CEO Backup |
| recovery / dirty tree / interrupted run | Hermes Orchestrator | Hermes CodexPro Orchestrator |
| creative / media / provider-live | Creative Media Planner | Codex Creative Backup |

Use `paperclip:agent-routing` or the MCP `paperclip_agent_routing` tool to generate the issue-scoped `agent-routing` document. Browser overlays may display or copy routing commands only; CLI/MCP readiness and capacity gates remain authoritative.

## Product Visual Identity

Use Google's `DESIGN.md` format as the repo-owned visual identity contract. For UI, brand, asset, component, or visual polish work:

- read repo-root `DESIGN.md` when present;
- if missing, inspect existing UI/assets and create a product-specific `DESIGN.md` before broad redesign work;
- preserve this product's own visual language instead of copying another portfolio app;
- validate changed design files with `npm --prefix /Users/eduardobrambila/agent-stack run design:lint -- DESIGN.md`;
- report whether `DESIGN.md` was present, changed, missing, or intentionally deferred.

## Local Capacity Policy

This Mac should not run the whole portfolio at once. Default capacity is 1 active Paperclip/Symphony agent per company, 2 active execution agents portfolio-wide, and 1 review sidecar portfolio-wide with a hard total default of 3 active local runs. Review sidecars are for Claude QA Reviewer/Codex QA Backup style review, QA, audit, security, validation, or release-readiness work in a different company from active implementation.

Check capacity with:

```bash
npm --prefix /Users/eduardobrambila/agent-stack run paperclip:capacity
npm --prefix /Users/eduardobrambila/agent-stack run paperclip:capacity -- --company KAL --work-class review
```

Do not wake or assign more work when capacity is full. `paperclip:issue-readiness`, `paperclip:claim-issue`, and `paperclip:continuation-loop` derive work class from `agent-routing` when possible. Use explicit capacity override only when Eduardo intentionally wants a short burst.

## Official OpenAI Docs

Use the OpenAI developer documentation MCP server named `openaiDeveloperDocs` before implementing or advising on OpenAI API, Responses API, Agents SDK, ChatGPT Apps SDK, Codex, MCP, skills, model selection, or prompt/model migration work. If the MCP is unavailable, use official OpenAI docs as fallback evidence and record the gap in `HERMES_PROGRESS.md`.

## PCL, MCP, Skills, And Instruction Freshness

Paperclip Core / PCL is the self-improvement queue for orchestration, agent routing, MCP tools, skills, Telegram intake, managed Codex homes, Hermes/CodexPro adapters, and agent instruction bundles. Codex, Claude Code, Hermes, and Hermes CodexPro should use the same read-only checks before changing core behavior or agent files.

Read-only PCL checks:

```bash
npm --prefix /Users/eduardobrambila/agent-stack run paperclip:core-system-test -- --json --test-result passed
npm --prefix /Users/eduardobrambila/agent-stack run paperclip:core-feedback-review -- --json
npm --prefix /Users/eduardobrambila/agent-stack run paperclip:core-agent-company-architecture -- --json
```

Freshness checks for runtime access and gateway policy:

```bash
npm --prefix /Users/eduardobrambila/agent-stack run paperclip:codex-home-hygiene -- --json
npm --prefix /Users/eduardobrambila/agent-stack run paperclip:hermes-adapter-sync -- --json
npm --prefix /Users/eduardobrambila/agent-stack run paperclip:portfolio-standards -- --company AGE
npm --prefix /Users/eduardobrambila/agent-stack run agentix:telegram-plugin:verify -- --json
```

The Paperclip MCP server is the shared tool surface for Codex and Claude Code:

```bash
node /Users/eduardobrambila/agent-stack/mcp/paperclip/server.mjs
```

Managed Codex homes must keep the `paperclip` MCP server and `openaiDeveloperDocs` MCP server installed. Hermes/CodexPro adapters must stay on the central model policy. Portfolio instruction bundles must be refreshed from this generator, not hand-maintained per agent. Apply paths are intentional maintenance actions: Codex home hygiene uses `--apply`, Hermes adapter sync uses `--apply --confirmMutation`, portfolio standards use `--apply --confirmMutation`, and Telegram plugin sync uses `--apply` only after verification. Record MCP, skill, adapter, or instruction drift in `HERMES_PROGRESS.md` and convert recurring drift into a PCL/AGE proposal before changing core policy.

The architecture report's propagation map is the checklist for deciding which channels need refresh after a core change: source files, MCP tools, managed Codex homes, Hermes/CodexPro adapters, Telegram gateway policy, skills, and live Paperclip agent instruction bundles.

## First Move

Before selecting or editing work:

1. Read `AGENTS.md`.
2. If running under Claude Code, read `CLAUDE.md`.
3. Read this file.
4. Read `WORKFLOW.md` when present, especially for automated Paperclip issue work.
5. Read `DESIGN.md` when UI, brand, component, asset, or visual polish work is in scope.
6. Read `TASKS.md`, `HERMES_PROGRESS.md`, `QA_FINDINGS.md` if present, `REALNESS_AUDIT.md` if present, and relevant docs for the touched area.
7. Run `git status --short --branch`.
8. If Paperclip env vars are present, fetch the assigned issue and heartbeat context before using `TASKS.md`.
9. If no Paperclip env vars are present, use this repo normally, but keep work easy to mirror into Paperclip.

## Source Of Truth

- Paperclip issue: current visible work envelope, owner, status, comments, approvals, and blockers.
- `TASKS.md`: detailed repo implementation queue when present.
- `HERMES_PROGRESS.md`: durable run log, validation evidence, selected tasks, and next recommendations when present.
- `QA_FINDINGS.md`: review findings, regressions, and risk notes.
- Git commits: completed validated implementation slices.

Do not rely on chat/session memory for durable state.

## TASKS.md To Paperclip Mapping

When starting a `TASKS.md` item inside a Paperclip issue:

- Add a Paperclip comment naming the `TASKS.md` task number/title.
- Mark or keep the Paperclip issue `in_progress`.
- Update `HERMES_PROGRESS.md` with the Paperclip issue identifier when available.
- On completion, update both `TASKS.md` and the Paperclip issue/comment.

When replenishing `TASKS.md`:

- Add 8-12 repo tasks if the queue is empty or stale.
- Mirror only the next 3-5 high-value executable tasks into Paperclip issues so the dashboard stays readable.
- Each mirrored issue should include scope, likely files, acceptance criteria, validation commands, and whether it is safe for Codex, Hermes, Claude, or a backup agent.

If Paperclip is unavailable, continue only if the task is locally safe, then record the Paperclip sync gap in `HERMES_PROGRESS.md`.

## Agent Lanes And Fallback

- `CEO`: product strategy, prioritization, delegation, and approval handoffs.
- `Codex Builder`: primary implementation, tests, migrations, commits, and push-safe work.
- `Hermes Orchestrator`: continuity, recovery, TASKS/HERMES upkeep, long-running planning, and queue hygiene.
- `Claude QA Reviewer`: review/architecture/design/security when Claude credit is available.
- `Codex CEO Backup`: strategy/delegation fallback when Claude CEO is quota-blocked.
- `Codex QA Backup`: review and QA fallback when Claude is quota-blocked.
- `Hermes CodexPro Orchestrator`: backup long-running Hermes lane using the second Codex Pro account through `codexpro`.
- `Creative Media Planner` / `Codex Creative Backup`: creative/media planning when present.

If a Claude-backed agent fails due to quota, credit, rate limit, or auth, do not retry-loop. Comment on the Paperclip issue and route the work to the matching Codex backup.

## Production Operating Mode

CivicCanvas should move toward a fully functioning production product, not hackathon-only demo mode.

Prefer real product functionality: auth, durable user-owned data, storage, provider integrations, production copy, validation, CI/deploy readiness, observability, privacy/security, and removal or isolation of demo/mock UI.

Keep local/dev fixtures available for tests and development, but isolate them from normal production UX.

## Git Hygiene

- Inspect dirty files before editing.
- Preserve unrelated dirty work from the user or other agents.
- Stage only files for the completed task.
- Run `git diff --check` before every commit.
- Commit each completed task separately when validation passes.
- Push only when explicitly allowed, no secrets are staged, validation is green or explained, and branch/upstream state is understood.
- Never force push without explicit approval.

## Final Report Shape

End every Paperclip-aware run with:

1. Paperclip issue identifier and status.
2. `TASKS.md` items selected/completed/created.
3. Commits made and whether pushed.
4. Validation results.
5. Live provider/API calls and artifacts.
6. Data/auth/storage/provider changes.
7. Remaining dirty/untracked files.
8. Remaining risks.
9. Next recommended Paperclip issue or `TASKS.md` task.
