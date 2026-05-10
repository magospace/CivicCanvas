# Visual UI/UX Audit For Loom Readiness

Date: May 10, 2026

Scope: README-guided local demo path for CivicCanvas / Texas Data Canvas. Reviewed `README.md`, `docs/HACKATHON_SUBMISSION_GUIDE.md`, repo state docs, and the documented local quick start. Ran the web app locally on `PORT=3015` because another local process was already listening on port 3000. Walked the Loom path: `/sources` -> `/explore` primary Dallas prompt -> secondary prompt options -> save/local handoff surfaces on `/saved`. Captured desktop, tablet, and mobile screenshots to ignored `demo-artifacts/ui-audit/`.

Screenshots captured, intentionally uncommitted because `demo-artifacts/` is ignored:

- `demo-artifacts/ui-audit/sources-desktop.png`
- `demo-artifacts/ui-audit/explore-initial-desktop.png`
- `demo-artifacts/ui-audit/explore-mobile.png`
- `demo-artifacts/ui-audit/explore-tablet.png`
- `demo-artifacts/ui-audit/saved-empty-mobile.png`

## Executive Summary

The app looks credible and honest. The strongest visual trust signals are the governed source catalog, clear browser-local saved-canvas copy, visible sample/live boundaries, and source/method cards. The main Loom risk is not correctness; it is first-15-second clarity. The app opens in a dense seeded-dashboard workspace with many controls, status chips, export buttons, technical labels, and repeated fallback messaging. Judges can understand it with narration, but the screen asks them to parse too much at once.

Highest-impact fixes before recording:

1. Make generated chart blocks look intentional, not blank or placeholder-like.
2. Add a concise dashboard status strip near the generated canvas title so sample/live mode is readable before the viewer scans the inspector.
3. Simplify duplicated/technical button labels where possible, especially filter application copy.
4. Preserve and emphasize honest boundaries: sample fallback, browser-local saves, no backend persistence, preview-only Miro, no generated HTML/scripts.

## P0 Must Fix Before Recording

### P0-1: Generated charts look blank or placeholder-like

- Route/screen: `/explore`, primary Dallas prompt dashboard.
- What looks wrong: The monthly trend and category chart regions contain large blank areas, tiny/truncated axis labels, and weak visible marks. In desktop/tablet screenshots this can look like a broken chart rather than an intentionally governed visualization.
- Why it matters for judging: The core demo promise is visual public-data exploration. If the first generated dashboard looks visually empty, judges may undervalue the working table/source/governance paths.
- Recommended fix: Render line charts with visible line/points/value labels and render bar charts as readable horizontal bars with labels and counts. Add empty/sparse copy only when there are no rows.
- Estimated effort: Small to medium; localized to the chart block renderer.

### P0-2: First generated state needs a concise sample/live explanation near the title

- Route/screen: `/explore`, generated dashboard title area.
- What looks wrong: Sample fallback is truthful but scattered across status cards, the inspector, and source/method sections. The generated canvas title says `Validated CanvasSpec` but does not immediately say what data mode is being shown.
- Why it matters for judging: The Loom path asks the presenter to explain that Dallas ZIP uses sample fallback because the verified live source lacks ZIP. Judges should see that in one place without waiting for the inspector scroll/narration.
- Recommended fix: Add a compact status strip under the dashboard title: showing data mode, source count/fields, and a user-facing sample fallback statement. Keep technical detail in existing inspector/source sections.
- Estimated effort: Small; localized to canvas renderer.

## P1 High-Impact Polish

### P1-1: The initial `/explore` screen is powerful but visually dense

- Route/screen: `/explore`, desktop/tablet/mobile first viewport.
- What looks wrong: Dataset sidebar, prompt form, Canvas tools, Known data boundaries, seeded dashboard, filters, inspector, exports, and source/method all appear in one long workspace. On mobile, users scroll through source discovery before reaching the prompt.
- Why it matters for judging: The core loop should be obvious in the first 15 seconds: ask a question, generate a cited canvas, see sample/live boundary.
- Recommended fix: For the immediate low-risk pass, improve hierarchy in generated output and labels. Larger future fix: make the seeded state explicitly a `sample starter canvas` or add a true empty/start state before dashboard output.
- Estimated effort: Small for labels/status; medium for a true empty-state redesign.

### P1-2: `/sources` is credible but badge-heavy and documentation-dense

- Route/screen: `/sources` desktop.
- What looks wrong: Source cards are thorough but visually dense, with many similarly weighted badges and verification paragraphs. The Dallas live-enabled source is not visually elevated as the demo anchor.
- Why it matters for judging: The demo starts here. Reviewers need to immediately understand `approved sources`, `1 live-enabled`, and `sample fallback is intentionally labeled`.
- Recommended fix: Add a future summary row/legend for live/sample taxonomy and consider visually elevating Dallas as the live-enabled source. Keep current detailed verification copy because it is honest and useful.
- Estimated effort: Medium; design/content pass.

### P1-3: Some UI labels sound internal rather than user-facing

- Route/screen: `/explore`, canvas tools, filter blocks, export controls, dataset sidebar.
- What looks wrong: Labels such as `Apply filter state`, `BoundedQuerySpec`, `CanvasDocument JSON`, adapter names, and `Validated CanvasSpec` are accurate but can feel like an internal QA tool. The duplicated `Apply filters` and `Apply filter state` labels are especially distracting.
- Why it matters for judging: Production polish improves perceived completeness even when technical boundaries remain honest.
- Recommended fix: Rename `Apply filter state` to `Apply filters`. Consider future advanced/debug grouping for `CanvasDocument JSON` and `BoundedQuerySpec` while keeping those tools available for MCP/technical demo proof.
- Estimated effort: Small for filter label; medium for advanced grouping.

### P1-4: Mobile `/explore` puts discovery/sidebar before the prompt

- Route/screen: `/explore` mobile.
- What looks wrong: On 390px width, users see brand/no-account, Cities, Topics, and Datasets before the prompt card. The core prompt loop is below the fold.
- Why it matters for judging: Mobile responsiveness is otherwise good, but if a judge opens mobile first, the primary action is delayed.
- Recommended fix: Future layout change: place the prompt before the dataset sidebar on small screens or collapse the sidebar into a `Browse sources` disclosure.
- Estimated effort: Medium; layout ordering change and e2e screenshot review.

## P2 Nice To Have

### P2-1: Active nav state is subtle

- Route/screen: Header navigation on desktop/tablet.
- What looks wrong: Current nav item is not strongly distinguished.
- Why it matters for judging: Stronger navigation state helps viewers orient during a fast Loom.
- Recommended fix: Add path-aware active pill/underline in a client nav component.
- Estimated effort: Small to medium.

### P2-2: `/saved` mobile empty/import state is solid but could use a clearer primary CTA

- Route/screen: `/saved` mobile.
- What looks wrong: The browser-local persistence boundary is very clear and production-grade. The page could still add a stronger `Go to Explore` CTA near the empty/import state.
- Why it matters for judging: The demo includes saving locally then opening `/saved`; a CTA helps if there are no saved canvases in a fresh browser.
- Recommended fix: Add a primary link back to `/explore` in the empty state.
- Estimated effort: Small.

### P2-3: `/sources` lower card whitespace

- Route/screen: `/sources` desktop.
- What looks wrong: Shorter cards can leave blank space next to longer verification-heavy cards.
- Why it matters for judging: Minor visual rhythm issue.
- Recommended fix: Masonry-like layout or more compact card details.
- Estimated effort: Medium.

## Preserved Boundaries

- No live provider/API calls were made during this audit.
- No Fal/media generation was run.
- No schema, migration, persistence, auth, billing, deployment, or production data changes were made.
- Screenshots were stored under ignored `demo-artifacts/` and should not be committed.
- Recommendations preserve current honest boundaries: sample fallback, browser-local saved canvases, preview-only Miro export specs, no backend persistence, no generated HTML/scripts, and no app media-generation path.
