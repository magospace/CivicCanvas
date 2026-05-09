# README FIRST - Texas Data Canvas Development Packet

This packet is designed to be handed to Codex or another coding agent to start development.

## What to give the agent first

Start with these files:

1. `AGENTS.md`
2. `docs/PRD.md`
3. `docs/MVP_BUILD_BRIEF.md`
4. `docs/AGENT_DEVELOPMENT_PLAN.md`
5. `docs/ARCHITECTURE.md`
6. `docs/MCP_SERVER_SPEC.md`
7. `docs/DATA_GOVERNANCE.md`
8. `docs/ACCEPTANCE_CRITERIA.md`
9. `.agents/skills/texas-public-data-explorer/SKILL.md`

## Recommended first Codex prompt

```text
You are building Texas Data Canvas from this repo handoff packet.

Read AGENTS.md first, then docs/PRD.md, docs/MVP_BUILD_BRIEF.md, docs/AGENT_DEVELOPMENT_PLAN.md, docs/ARCHITECTURE.md, docs/MCP_SERVER_SPEC.md, docs/DATA_GOVERNANCE.md, docs/ACCEPTANCE_CRITERIA.md, and .agents/skills/texas-public-data-explorer/SKILL.md.

Do not just plan. Implement Phase P0 and P1:
1. Create the monorepo structure.
2. Add shared TypeScript schemas.
3. Create the Next.js frontend shell with header, sidebar, prompt bar, canvas area, inspector/filter panel, and source/method placeholder.
4. Add dataset catalog and sample data files.
5. Add README setup commands.

Do not implement arbitrary AI-generated HTML or JavaScript. Dashboards must render through validated CanvasSpec JSON and an allowlisted React block registry.

Run typecheck/build if possible. Report what changed, what commands ran, and any blockers.
```

## Recommended staged approach

Do not ask the coding agent to build everything at once. Use the phase prompts in `docs/CODEX_PROMPTS.md`.

## Core product idea

Texas Data Canvas is a contained visual canvas for Texas public data. The AI discovers datasets, runs safe bounded queries through MCP, and assembles dashboards from trusted React blocks. Miro export is a stretch feature for turning dashboards into briefing/workshop boards.
