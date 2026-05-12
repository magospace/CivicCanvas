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
  root: /Users/eduardobrambila/agent-stack/workers/paperclip
  branchPrefix: paperclip
hooks:
  preflight:
    - git status --short --branch
    - git diff --check
  validation:
    - git status --short --branch
    - git diff --check
    - pnpm typecheck
    - pnpm lint
    - pnpm test
    - pnpm build
    - pnpm test:e2e
agent:
  lane: codex
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
  conditionTemplate: Complete Paperclip issue {{ issue.identifier }} for {{ company.name }} under WORKFLOW.md. Stop only when the scoped issue is complete, validation evidence is shown in the transcript using these checks {{ validation.commands }}, git status is clean or explicitly classified as preserved dirty work, a scoped commit exists, push is done when safe, TASKS.md and HERMES_PROGRESS.md are updated if present, and Paperclip has a completion comment. Stop early if validation fails, credentials are missing, scope is unclear, destructive production data access is needed, or secrets or private artifacts would be exposed. Do not force push, do not commit .env values, and preserve unrelated dirty work. Stop after {{ goal.maxTurns }} turns with a blocker summary if not complete.
codex:
  command: codex app-server
  sandbox: workspace-write
  approvalPolicy: never
  posture:
    - no destructive production operations
    - no force push
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

Issue:
{{ issue.title }}

Description:
{{ issue.description }}

Repository:
{{ repo.path }}

Branch:
{{ repo.branch }}

## Required Reading

Read `AGENTS.md`, `PAPERCLIP.md`, `TASKS.md`, `HERMES_PROGRESS.md` if present, `QA_FINDINGS.md` if present, and the files relevant to this issue before editing.

## Operating Rules

- Treat Paperclip as the visible issue tracker and this `WORKFLOW.md` as the active automated run contract.
- Use `/goal` only for this Paperclip issue or a bounded phase of it; never use it as a "keep working forever" backlog.
- Use subagents only as bounded helpers inside this issue. The parent agent owns integration, validation, commit, push, and Paperclip reporting.
- Do not spawn more than 2 subagents, do not recurse, and do not use subagents for portfolio-wide fanout or ambiguous product decisions.
- Prefer subagents for read-heavy exploration, review, test triage, asset inventory, or disjoint implementation slices with explicit file ownership.
- Use the Paperclip issue as the work envelope and keep repo memory synchronized.
- Use scoped git worktrees for automated issue work.
- Respect local capacity: default maximum is 1 active agent per company and 2 active Paperclip/Symphony agents across the 24 GB Mac.
- Preserve unrelated dirty work from the user or other agents.
- Do not print or commit secrets, `.env` values, generated caches, or raw private artifacts.
- Do not force push.
- Do not perform destructive production operations.
- Use live providers only when the issue explicitly allows them.
- Update `TASKS.md`, `HERMES_PROGRESS.md`, and the Paperclip issue/comment when the task changes durable state.

## Validation

Run the most relevant checks for the changed area, starting from:
{{ validation.commands }}

## Final Report

Report:

1. Paperclip issue identifier and status.
2. Commit hash and push status.
3. Validation commands and results.
4. Changed files.
5. Live provider/API calls and produced artifacts, if any.
6. Remaining dirty/untracked files.
7. Remaining risks.
8. Next recommended Paperclip issue or repo task.
