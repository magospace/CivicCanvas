# CLAUDE.md - CivicCanvas (CIV)

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
