---
tracker:
  kind: paperclip
  apiBase: http://127.0.0.1:3100/api
  dashboard: http://127.0.0.1:3100
  activeStates:
    - todo
    - in_progress
    - in_review
  terminalStates:
    - done
    - cancelled
workspace:
  strategy: git-worktree
  root: /Users/eduardobrambila/PaperclipWorkers
  branchPrefix: paperclip
hooks:
  preflight:
    - git status --short --branch
    - git diff --check
  validation:
    - git status --short --branch
    - git diff --check
    - (test -e node_modules || test -L node_modules || ln -s '/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet/node_modules' node_modules || test -e node_modules || test -L node_modules) && PATH='/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet/node_modules/.bin':$PATH pnpm typecheck
    - (test -e node_modules || test -L node_modules || ln -s '/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet/node_modules' node_modules || test -e node_modules || test -L node_modules) && PATH='/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet/node_modules/.bin':$PATH pnpm lint
    - (test -e node_modules || test -L node_modules || ln -s '/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet/node_modules' node_modules || test -e node_modules || test -L node_modules) && PATH='/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet/node_modules/.bin':$PATH pnpm test
    - (test -e node_modules || test -L node_modules || ln -s '/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet/node_modules' node_modules || test -e node_modules || test -L node_modules) && PATH='/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet/node_modules/.bin':$PATH pnpm build
    - (test -e node_modules || test -L node_modules || ln -s '/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet/node_modules' node_modules || test -e node_modules || test -L node_modules) && PATH='/Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet/node_modules/.bin':$PATH pnpm test:e2e
agent:
  lane: codex
  modelProfile: builder_high
  maxTurns: 5
  maxConcurrentPerCompany: 1
  maxConcurrentPortfolio: 2
subagents:
  enabled: true
  scope: inside-one-paperclip-issue
  maxConcurrent: 2
  maxDepth: 1
  requireExplicitInstruction: true
  parentOwnsCommit: true
  allowedUseCases:
    - read-heavy exploration
    - code review
    - test triage
    - independent implementation slices
    - asset or research inventory
  disallowedUseCases:
    - portfolio-wide fanout
    - recursive delegation
    - same-file concurrent edits
    - unclear product decisions
    - destructive production operations
goals:
  enabled: true
  mode: agent-native
  scope: one-paperclip-issue
  maxTurns: 8
  conditionTemplate: Complete Paperclip issue {{ issue.identifier }} for {{ company.name }} under WORKFLOW.md. Stop only when the scoped issue is complete, validation evidence is shown in the transcript using these checks {{ validation.commands }}, git status is clean or explicitly classified as preserved dirty work, a scoped commit exists, remote push status is recorded, TASKS.md and HERMES_PROGRESS.md are updated if present, and Paperclip has landing-state and completion-report issue documents with completion events emitted when marking done. Stop early if validation fails, credentials are missing, scope is unclear, destructive production data access is needed, a remote push would be required without explicit operator approval, or secrets or private artifacts would be exposed. Do not force push, do not push to remotes unless the operator explicitly approves that push in this run, do not commit .env values, and preserve unrelated dirty work. Stop after {{ goal.maxTurns }} turns with a blocker summary if not complete.
codex:
  command: codex app-server
  sandbox: workspace-write
  approvalPolicy: never
  posture:
    - no destructive production operations
    - no force push
    - no remote push without explicit operator approval
    - no secrets
paperclip:
  company: CivicCanvas
  issuePrefix: CIV
  repoPath: /Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet
  project: Product Engineering
  wakeAutomatically: false
---

# Paperclip Symphony Workflow

You are working on {{ issue.identifier }} for {{ company.name }}.

## Outcome

Complete the Paperclip issue with production-quality implementation, validation, durable repo updates, and a clear Paperclip handoff.

Paperclip company goals define product strategy, Paperclip issues define the work envelope, and the agent-native `/goal` command generated from this file defines the execution loop for this one issue only.

## Issue Status Gate

Automated checkout and first-run preparation are allowed only for Paperclip issues in `backlog` or `todo`. Treat `in_progress` as already active, `in_review` as closeout/review, `blocked` as blocker resolution, and `done`/`cancelled` as terminal audit. If readiness or claim dry-run returns blockers or a null patch, stop and report the gate instead of forcing status changes.

## Operator Decision Stops

When `paperclip:continuation-loop` selects `operator_decision_required`, or when an MCP continuation response reports the same gate, stop automated checkout/wake work and refresh the operator decision brief instead of improvising lifecycle changes.

Safe review:

```bash
node /Users/eduardobrambila/agent-stack/scripts/paperclip-operator-decision-brief.mjs --company CIV --json
node /Users/eduardobrambila/agent-stack/scripts/paperclip-operator-decision-brief.mjs --company CIV --apply --json
```

The MCP equivalent is `paperclip_operator_decision_brief`. The brief writes only an `operator-decision-brief` issue document when applied and includes `decisionActionGuide` with grouped decision kinds, selected stop, safe dry-run review commands, operator choices, approval-required apply templates, and forbidden shortcuts.

Treat the guide as report-only evidence. Safe dry-run review commands may be copied for inspection; approval-required apply templates are not permission to mutate. Do not wake agents, check out work, change issue lifecycle status, clean dirty trees, bind native workspaces, or edit `WORKFLOW.md` unless the operator explicitly approves that exact action.

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

Issue:
{{ issue.title }}

Description:
{{ issue.description }}

Repository:
{{ repo.path }}

Branch:
{{ repo.branch }}

## Required Reading

Read `AGENTS.md`, `CLAUDE.md` when running Claude Code, `PAPERCLIP.md`, `DESIGN.md` if this touches UI/brand/components, `TASKS.md`, `HERMES_PROGRESS.md` if present, `QA_FINDINGS.md` if present, and the files relevant to this issue before editing.

## Operating Rules

- Treat Paperclip as the visible issue tracker and this `WORKFLOW.md` as the active automated run contract.
- Use `/goal` only for this Paperclip issue or a bounded phase of it; never use it as a "keep working forever" backlog.
- Use subagents only as bounded helpers inside this issue. The parent agent owns integration, validation, local commit, push handoff, and Paperclip reporting.
- Do not spawn more than 2 subagents, do not recurse, and do not use subagents for portfolio-wide fanout or ambiguous product decisions.
- Prefer subagents for read-heavy exploration, review, test triage, asset inventory, or disjoint implementation slices with explicit file ownership.
- Use the Paperclip issue as the work envelope and keep repo memory synchronized.
- Use scoped git worktrees for automated issue work.
- Automated Paperclip issue worktrees live under `/Users/eduardobrambila/PaperclipWorkers` by default. Override with `PAPERCLIP_WORKER_ROOT` only for intentional local testing.
- When `PAPERCLIP_WORKSPACE_CWD` is set, it is the execution workspace. Source repo paths in Paperclip documents are read-only references unless they exactly match `pwd`; use relative paths from the execution workspace for edits.
- Respect local capacity: default maximum is 1 active agent per company and 2 active Paperclip/Symphony agents across the 24 GB Mac.
- Preserve unrelated dirty work from the user or other agents.
- Do not print, grep, echo, log, or commit secrets, `.env` values, generated caches, or raw private artifacts. Do not run broad environment dumps or raw provider/local-dev status commands that print keys, including `printenv`, `env`, `rg '^PAPERCLIP_'`, `supabase status`, or `pnpm supabase:status`; if context must be confirmed, print only non-secret IDs, paths, ports, URLs, and statuses with token/key/cookie values redacted.
- Do not force push.
- Do not run `git push` or publish remote branches unless the operator explicitly approves that exact push in the current run. If a push is needed, record the local branch, commit, validation, and "not pushed - operator approval required" in `landing-state` and the final report.
- Do not perform destructive production operations.
- Use live providers only when the issue explicitly allows them.
- Preserve the repo's own `DESIGN.md` visual identity when UI is touched; if it changes, validate it with `npm --prefix /Users/eduardobrambila/agent-stack run design:lint -- DESIGN.md`.
- Update `TASKS.md`, `HERMES_PROGRESS.md`, and Paperclip issue documents when the task changes durable state; native comments are opt-in because they can trigger resume automation.
- Close out completed work through the guarded helpers, not raw issue lifecycle PATCHes: first `npm --prefix /Users/eduardobrambila/agent-stack run paperclip:issue-landing -- --issue {{ issue.identifier }} --workspace-path "$PWD" --apply`. Write ad hoc final reports outside the repo, for example `/tmp/paperclip-{{ issue.identifier }}-final-report.md`, and record document-only completion before terminal status changes. Only add `--mark-done --emit-event` to `npm --prefix /Users/eduardobrambila/agent-stack run paperclip:completion-report -- --issue {{ issue.identifier }} --workspace-path "$PWD" --report-file /tmp/paperclip-{{ issue.identifier }}-final-report.md --apply --document-only` when landing is merged/no-merge-needed and validation, commit, dirty-tree, provider, and risk evidence are recorded. If landing is `committed`, `mergeNeeded: true`, or the helper leaves the issue in review or reports closeout blockers, record evidence without `--mark-done`, then stop and report that state; do not raw PATCH `status=in_review` or `status=done`.

## Validation

Run the most relevant checks for the changed area, starting from:
{{ validation.commands }}

Run these validation commands serially unless this repo's own workflow explicitly permits parallel execution. Do not overlap E2E/dev-server checks with lint, typecheck, build, docs audits, or checks that write shared report/output directories. Use an ignored `node_modules` symlink to source dependencies for isolated worktree validation when needed; do not run dependency install commands in the worker without explicit operator approval.

## Final Report

Report:

1. Paperclip issue identifier and status.
2. Commit hash and remote push status.
3. Validation commands and results.
4. Changed files.
5. Live provider/API calls and produced artifacts, if any.
6. Remaining dirty/untracked files.
7. Remaining risks.
8. Next recommended Paperclip issue or repo task.
