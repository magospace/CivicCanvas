# CLAUDE.md - CivicCanvas (CIV)

<!-- paperclip-claude-memory:v1 -->
## Paperclip Claude Code Memory

Claude Code's project memory is the uppercase `CLAUDE.md` file in this repo or worktree. Keep this file present in every Paperclip-managed project so Claude-backed lanes load the same operating contract as Codex and Hermes. A lowercase `claude.md` file is legacy project background only; if it conflicts with `AGENTS.md`, `PAPERCLIP.md`, or `WORKFLOW.md`, the Paperclip contracts win.

@AGENTS.md
@PAPERCLIP.md
@WORKFLOW.md

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

## Operator Decision Stops

When `paperclip:continuation-loop` selects `operator_decision_required`, or when an MCP continuation response reports the same gate, stop automated checkout/wake work and refresh the operator decision brief instead of improvising lifecycle changes.

Safe review:

```bash
node /Users/eduardobrambila/agent-stack/scripts/paperclip-operator-decision-brief.mjs --company CIV --json
node /Users/eduardobrambila/agent-stack/scripts/paperclip-operator-decision-brief.mjs --company CIV --apply --json
```

The MCP equivalent is `paperclip_operator_decision_brief`. The brief writes only an `operator-decision-brief` issue document when applied and includes `decisionActionGuide` with grouped decision kinds, selected stop, safe dry-run review commands, operator choices, approval-required apply templates, and forbidden shortcuts.

Treat the guide as report-only evidence. Safe dry-run review commands may be copied for inspection; approval-required apply templates are not permission to mutate. Do not wake agents, check out work, change issue lifecycle status, clean dirty trees, bind native workspaces, or edit `WORKFLOW.md` unless the operator explicitly approves that exact action.

## Claude Paperclip Guardrails

- Company: CivicCanvas (CIV).
- Source repo reference: `/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet`.
- Company goal: Build a production Texas public-data canvas for governed dashboards, safe dataset discovery, bounded queries, source attribution, MCP workflows, local persistence, and deploy-ready civic data exploration.
- If launched with `PAPERCLIP_WORKSPACE_CWD`, first run `cd "$PAPERCLIP_WORKSPACE_CWD"`, `pwd`, `git rev-parse --show-toplevel`, and `git status --short --branch`.
- Treat source repo paths from Paperclip documents as read-only references unless they exactly match the current execution workspace.
- Use relative paths after changing into the execution workspace; do not pass absolute source repo paths to edit/write tools in isolated runs. For every shell command, either set the tool working directory to `$PAPERCLIP_WORKSPACE_CWD` or prefix the command with `cd "$PAPERCLIP_WORKSPACE_CWD"`.
- If the isolated workspace lacks `node_modules`, use an ignored symlink to the source repo's `node_modules` plus its `node_modules/.bin` as a validation-only fallback; do not run dependency install commands in the worker without explicit operator approval, and keep reads/edits/commits in the execution workspace.
- Run validation serially by default; do not overlap E2E/dev-server checks with lint, typecheck, build, docs audits, or checks that write shared output directories.
- For scoped Next.js lint on bracketed dynamic route files, use the project script with a quoted path such as `npm run lint -- --file 'app/api/scenarios/[id]/route.ts'`; avoid escaped direct `npx next lint --file ...\\[id\\]...` forms.
- Do not run `git push`, publish branches, enable heartbeats, or wake broad agents unless the current operator-approved command explicitly allows it.
- Do not use `paperclip_update_issue`, raw API PATCHes, hand-built guarded PATCHes, or any direct status update to set repo work to `in_review` or `done`. If guarded completion leaves the issue in review because closeout blockers remain, stop and report the blocker instead of overriding the issue status.
- If `paperclip:issue-landing` reports `committed`, `mergeNeeded: true`, or any review blocker, do not mark the issue done; record the evidence and stop for operator integration.
- Close out through `paperclip:issue-landing` and `paperclip:completion-report` with validation, commit, dirty-tree, push-status, and remaining-risk evidence.
- If Claude quota, auth, rate limits, or unsafe mutation blocks the run, record the blocker and route through the Paperclip fallback lane instead of retry-looping.
<!-- /paperclip-claude-memory:v1 -->

This file mirrors the local agent contract in `AGENTS.md` for Claude Code and Claude-backed review runs.

## Product Context

- Summary: MCP-powered Texas public-data dashboard explorer with governed dataset catalog, deterministic prompt parsing, safe bounded queries, source attribution, local saved canvases, and preview-only Miro exports.
- Goal: Build a production Texas public-data canvas for governed dashboards, safe dataset discovery, bounded queries, source attribution, MCP workflows, local persistence, and deploy-ready civic data exploration.
- Context status: paperclip-record

## Required Reading

Before editing or reviewing, read:

1. `README.md`
2. `AGENTS.md`
3. `PAPERCLIP.md`
4. `WORKFLOW.md`
5. `DESIGN.md`
6. `TASKS.md`
7. relevant docs under `docs/`

Then run:

```bash
git status --short --branch
```

## Claude Operating Rules

- Treat Paperclip as the visible company/project/issue control plane.
- Treat `WORKFLOW.md` as the automated Paperclip run contract.
- Keep work scoped to one Paperclip issue or one clearly bounded local task.
- Preserve unrelated dirty work.
- Do not print or commit secrets, `.env` values, private customer data, generated caches, or run workspaces.
- Do not wake agents, enable heartbeats, force push, or perform destructive production operations unless a later approved issue explicitly allows it.
- Use `DESIGN.md` before changing UI, brand, assets, or copy.
- For review/QA work, report findings first with file and line references when possible.
- For implementation work, validate narrowly and record evidence in the final report.

## Handoff

If Claude is blocked by quota, auth, missing local setup, or an unsafe mutation, record the blocker and route follow-up through Paperclip rather than improvising a broad workaround.

## Final Report

Report changed files, validation, Paperclip mutations, live provider calls, remaining dirty files, risks, and the next recommended task.
