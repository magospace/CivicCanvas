# Security Policy

Texas Data Canvas is a no-auth, no-database public-data demo, but it still treats data governance and generated-dashboard safety as security boundaries.

## Supported Versions

Security fixes target the active branch and the latest verified hosted release. Hosted release tags remain blocked until a public URL passes the release gates documented in `PLAN.md`.

## Reporting a Vulnerability

Until the GitHub remote is configured, report issues directly to the project maintainer. After the remote exists, use GitHub private vulnerability reporting if enabled, or email the maintainer address listed in the repository profile.

Please include:

- affected route, MCP tool, script, or dataset
- reproduction steps
- expected and actual behavior
- whether hidden/sensitive fields, arbitrary HTML/JS, arbitrary SQL/SoQL, or external map URLs are involved

## Security Boundaries

- Dashboard rendering must use validated `CanvasDocument` JSON and the allowlisted React block registry.
- Queries must use approved catalog metadata and `BoundedQuerySpec`.
- Hidden fields must stay out of API results, saved bundles, gallery fixtures, CSV exports, JSON exports, and Miro specs.
- Miro export is preview/spec-only; no board writes are supported.
- The in-repo request throttle is defense in depth only. Public deployments must enable platform-level firewall/rate limiting before broad sharing.
