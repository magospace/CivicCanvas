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

## Symphony Workflow Contract

`WORKFLOW.md` is the active Paperclip/Symphony automated run contract for this repo. Read it before automated issue work; it defines tracker state, git-worktree workspace policy, validation hooks, Codex app-server posture, and the prompt template.

## Native Agent Goals

There are three goal layers:

- Paperclip company goals: product and company strategy.
- Paperclip issues: the visible work envelope agents should claim, update, and complete.
- Native `/goal`: a per-session execution loop for one Paperclip issue or one bounded phase only.

When `WORKFLOW.md` contains a `goals` block, use the rendered `/goal` command for Codex, Claude Code, or Hermes runs that should continue across turns. Do not use `/goal` for vague portfolio backlogs or "keep working forever" instructions. Check status with `/goal`, pause with `/goal pause`, resume with `/goal resume`, and clear with `/goal clear`.

## Product Visual Identity

Use Google's `DESIGN.md` format as the repo-owned visual identity contract. For UI, brand, asset, component, or visual polish work:

- read repo-root `DESIGN.md` when present;
- if missing, inspect existing UI/assets and create a product-specific `DESIGN.md` before broad redesign work;
- preserve this product's own visual language instead of copying another portfolio app;
- validate changed design files with `npm --prefix /Users/eduardobrambila/agent-stack run design:lint -- DESIGN.md`;
- report whether `DESIGN.md` was present, changed, missing, or intentionally deferred.

## Local Capacity Policy

This Mac should not run the whole portfolio at once. Default capacity is 1 active Paperclip/Symphony agent per company and 2 active agents portfolio-wide. Check capacity with:

```bash
npm --prefix /Users/eduardobrambila/agent-stack run paperclip:capacity
```

Do not wake or assign more work when capacity is full. Use explicit capacity override only when Eduardo intentionally wants a short burst.

## Agent Routing Matrix

Paperclip agents are available role templates, not an always-on workforce. Route one issue to one lane before checkout prep:

| Issue type | Primary lane | Fallback lane |
| --- | --- | --- |
| build / implementation | Codex Builder | Hermes Orchestrator |
| review / QA / security / release | Claude QA Reviewer | Codex QA Backup |
| planning / roadmap / task replenishment | CEO | Codex CEO Backup |
| recovery / dirty tree / interrupted run | Hermes Orchestrator | Hermes CodexPro Orchestrator |
| creative / media / provider-live | Creative Media Planner | Codex Creative Backup |

Use `paperclip:agent-routing` or the MCP `paperclip_agent_routing` tool to generate the issue-scoped `agent-routing` document. Browser overlays may display or copy routing commands only; CLI/MCP readiness and capacity gates remain authoritative.

## Official OpenAI Docs

Use the OpenAI developer documentation MCP server named `openaiDeveloperDocs` before implementing or advising on OpenAI API, Responses API, Agents SDK, ChatGPT Apps SDK, Codex, MCP, skills, model selection, or prompt/model migration work. If the MCP is unavailable, use official OpenAI docs as fallback evidence and record the gap in `HERMES_PROGRESS.md`.

## First Move

Before selecting or editing work:

1. Read `AGENTS.md`.
2. Read this file.
3. Read `TASKS.md`, `HERMES_PROGRESS.md`, `QA_FINDINGS.md` if present, `REALNESS_AUDIT.md` if present, and relevant docs for the touched area.
4. Run `git status --short --branch`.
5. If Paperclip env vars are present, fetch the assigned issue and heartbeat context before using `TASKS.md`.
6. If no Paperclip env vars are present, use this repo normally, but keep work easy to mirror into Paperclip.

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
