<!-- generated-by: portfolio-foundation-fix -->
# CivicCanvas Production Roadmap

Generated from the Paperclip deep-dive audit. Keep this file aligned with `TASKS.md` and Paperclip issues.

## Product Direction

- Audience: hackathon organizers, participants, mentors, sponsors, and judges
- Current classification: production-shaped but still local/mock-backed
- Current score: 91/100
- Main blocker: Mock/demo/seed language is widespread and needs classification before production work.

## Current Product Summary

CivicCanvas Open-source, MCP-powered visual explorer for Texas public datasets. Hackathon Submission Checklist - Public repo: https://github.com/magospace/CivicCanvas - Track: Brainforge / Vicinity Texas Open Data Track.

## P0 - Repo Hygiene And Production Baseline

- Keep git/worktree state classified and commit safe groups.
- Maintain `AGENTS.md`, `PAPERCLIP.md`, `TASKS.md`, and this roadmap.
- Document validation in `docs/VALIDATION.md`.
- Mirror active repo tasks into Paperclip.

## P1 - Production Foundation Implementation

- Replace unsafe hardcoded demo/mock paths with real repository, database, storage, or provider-backed paths.
- Establish auth/session/user ownership boundaries where the product has private data.
- Prove media/provider workflows with no-key fallbacks and env-gated live smoke tests when credentials exist.
- Add tests for every schema, route, provider, or storage boundary touched.

## P2 - Optimization And Polish

- Remove or gate demo/mock/hackathon wording from normal production UX.
- Improve visual assets, copy, onboarding, and responsive/native polish.
- Add CI/deploy/release evidence once foundations are stable.
- Add observability and actionable errors for provider/backend failures.

## Validation

Use `docs/VALIDATION.md` as the current validation source of truth for /Users/eduardobrambila/AppRepos/CivicCanvas/texas-data-canvas-dev-packet.
