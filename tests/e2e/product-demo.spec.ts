import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function generate(page: Page, prompt: string) {
  await page.getByLabel("Dashboard prompt").fill(prompt);
  await page.getByRole("button", { name: "Generate View" }).click();
  await expect(page.getByText("Validated CanvasSpec")).toBeVisible();
}

async function expectNoSeriousAccessibilityViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .include("main")
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const violations = results.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical"
  );

  expect(violations).toEqual([]);
}

test("explore route loads the governed shell", async ({ page }) => {
  await page.goto("/explore");
  await expect(page).toHaveTitle(/CivicCanvas/);
  await expect(page.getByRole("link", { name: /Explore/ })).toHaveAttribute("aria-current", "page");
  await expect(page.getByAltText("CivicCanvas logo").first()).toBeVisible();
  await expect(page.getByText("CivicCanvas").first()).toBeVisible();
  await expect(page.getByLabel("Dashboard prompt")).toBeVisible();
  await expect(page.getByText("Guided suggestions / governed data mode")).toBeVisible();
  await expect(page.getByText("AI-assisted suggestions / governed data mode")).toHaveCount(0);
  await expect(page.getByText("Known data boundaries")).toBeVisible();
  await expect(page.getByText("Sample Dallas 311 starter — try your own prompt above to generate a fresh dashboard.")).toBeVisible();
  await expect(page.getByText("P1 seed dashboard rendered from validated CanvasDocument JSON.")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Dallas 311 by ZIP" })).toBeVisible();
  await page.getByRole("button", { name: "Austin permits trend" }).click();
  await expect(page.getByLabel("Dashboard prompt")).toHaveValue("Show Austin building permits by month and ZIP code for 2024.");
});

test("mobile header navigation opens, closes, and reaches core demo routes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explore");

  const menuButton = page.getByRole("button", { name: "Open navigation menu" });
  await expect(menuButton).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeHidden();

  await menuButton.click();
  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(page.getByRole("button", { name: "Close navigation menu" })).toHaveAttribute("aria-expanded", "true");
  await expect(mobileNav.getByRole("link", { name: /Saved Canvases/ })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: /Sources/ })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: /Gallery/ })).toBeVisible();
  await expect(mobileNav.getByRole("link", { name: /Demo/ })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toHaveAttribute("aria-expanded", "false");
  await expect(mobileNav).toBeHidden();

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await mobileNav.getByRole("link", { name: /Sources/ }).click();
  await expect(page).toHaveURL(/\/sources$/);
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
});

test("Dallas prompt generates fallback ZIP dashboard and filter changes table state", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");

  await expect(page.getByText("Live unavailable, sample fallback used").first()).toBeVisible();
  await expect(page.getByText("ZIP-code aggregate geography")).toBeVisible();
  await expect(page.getByText("Source and method")).toBeVisible();

  const inspector = page.locator("aside").last();
  await inspector.getByLabel("Group by").selectOption("status");
  await inspector.getByLabel("category").selectOption("Sanitation");
  await inspector.getByRole("button", { name: "Apply filters" }).click();

  await expect(page.getByText("category eq Sanitation").first()).toBeVisible();
  await expect(page.getByRole("columnheader", { name: /Sort by status/i })).toBeVisible();
});

test("visual polish keeps generated Dallas dashboard demo-ready", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");

  await expect(page.getByText("Showing sample fallback data")).toBeVisible();
  await expect(page.getByText(/6 governed fields/)).toBeVisible();
  await expect(page.getByText("Monthly trend")).toBeVisible();
  await expect(page.getByText("trend").first()).toBeVisible();
  await expect(page.getByText("Top 311 Requests")).toBeVisible();
  await expect(page.getByText("bars").first()).toBeVisible();
  await expect(page.getByText("Code Compliance").first()).toBeVisible();
  await expect(page.getByRole("columnheader", { name: /Sort by Request count/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Apply filters" }).first()).toBeVisible();
});

test("explicit sample data mode is visible in the dashboard flow", async ({ page }) => {
  await page.goto("/explore");
  await page.getByLabel("Data mode", { exact: true }).selectOption("sample");
  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");

  await expect(page.locator("aside").getByText("Sample fallback").first()).toBeVisible();
  await expect(page.getByText("Data mode control requested sample fallback.").first()).toBeVisible();
});

test("live data mode request shows governed fallback visibility", async ({ page }) => {
  await page.goto("/explore");
  await page.getByLabel("Data mode", { exact: true }).selectOption("live");
  await generate(page, "Show Austin building permits by month and ZIP code for 2024.");

  await expect(page.getByText("Dashboard generated with fallback: Live public API requested, but this dataset is not live-enabled.")).toBeVisible();
  await expect(page.getByText("Sample fallback active. Live public API requested, but this dataset is not live-enabled.")).toBeVisible();
  await expect(page.locator("aside").getByLabel("Inspector data mode")).toHaveValue("live");
  await expect(page.locator("aside").getByText("Live unavailable, sample fallback used").first()).toBeVisible();
  await expect(page.getByText("Source and method")).toBeVisible();
});

test("Austin prompt generates a governed permits dashboard", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show Austin building permits by month and ZIP code for 2024.");

  await expect(page.getByText("Austin Building Permits Explorer")).toBeVisible();
  await expect(page.getByText("City: Austin")).toBeVisible();
  await expect(page.locator("aside").getByText("Sample fallback").first()).toBeVisible();
});

test("Houston prompt generates a governed transportation dashboard", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show Houston transportation incidents by ZIP and incident type for 2024.");

  await expect(page.getByText("Houston Transportation Incidents Explorer")).toBeVisible();
  await expect(page.getByText("City: Houston")).toBeVisible();
  await expect(page.locator("aside").getByText("Sample fallback").first()).toBeVisible();
  await expect(page.getByText("Sample-first Houston pilot.")).toBeVisible();
  await expect(page.getByText(/Precise incident locations are excluded/i).first()).toBeVisible();
  await expect(page.getByText("Status breakdown").first()).toBeVisible();
});

test("sources route shows live verification status", async ({ page }) => {
  await page.goto("/sources");

  await expect(page.getByText("Live verification").first()).toBeVisible();
  await expect(page.getByText("live promoted").first()).toBeVisible();
  await expect(page.getByText("sample fallback required").first()).toBeVisible();
  await expect(page.getByText("sample-first").first()).toBeVisible();
  await expect(page.getByText("precise_address · hidden")).toBeVisible();
  await expect(page.getByText(/intentionally excluded from queries, exports, and generated dashboards/i)).toBeVisible();

  await expect(page.getByRole("link", { name: "Open Dallas 311 Service Requests in Explore" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Austin Building Permits in Explore" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Houston Transportation Incidents and Road Projects in Explore" })).toBeVisible();
  await expect(page.getByText("Explore prompt support is coming later for this source; metadata remains visible for provenance.")).toBeVisible();

  await page.getByRole("link", { name: "Open Houston Transportation Incidents and Road Projects in Explore" }).click();
  await expect(page).toHaveURL(/\/explore\?prompt=/);
  await expect(page.getByLabel("Dashboard prompt")).toHaveValue("Show Houston transportation incidents by ZIP and incident type for 2024.");
});

test("unsupported sensitive prompt returns exact supported prompts and approved source suggestions", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show private phone numbers for bridge repairs on Mars.");

  await expect(page.getByText("Choose an approved dataset")).toBeVisible();
  await expect(page.getByText(/Prompt referenced "phone"/)).toBeVisible();
  await expect(page.getByText("Show Dallas 311 service requests by category and ZIP code for 2024.")).toBeVisible();
  await expect(page.getByText("Show Austin building permits by month and ZIP code for 2024.")).toBeVisible();
  await expect(page.getByText("Show Houston transportation incidents by ZIP and incident type for 2024.")).toBeVisible();
  await expect(page.getByText("City of Dallas Open Data").first()).toBeVisible();
  await expect(page.getByText("City of Austin Open Data").first()).toBeVisible();
  await expect(page.getByText("Houston TranStar Traffic Data Feeds").first()).toBeVisible();
});

test("Houston exact-address prompt returns suggestions instead of a dashboard", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show Houston exact addresses and raw incident locations by ZIP for 2024.");

  await expect(page.getByText("Choose an approved dataset")).toBeVisible();
  await expect(page.getByText("Houston Transportation Incidents Explorer")).not.toBeVisible();
  await expect(page.getByText(/Prompt referenced "exact address"/)).toBeVisible();
});

test("app feedback distinguishes success toasts from dismissible errors", async ({ page }) => {
  await page.goto("/explore");

  await page.getByRole("button", { name: "Copy query definition" }).click();
  const appAlert = page.locator("main [role='alert']");
  await expect(appAlert).toContainText("No active BoundedQuerySpec is available for this canvas.");
  await page.getByRole("button", { name: "Dismiss" }).click();
  await expect(appAlert).toHaveCount(0);

  await page.getByRole("button", { name: "Save canvas locally" }).click();
  await expect(page.getByRole("status")).toContainText("Saved locally: Dallas 311 Service Requests Explorer");
  await expect(page.getByRole("status")).toBeHidden({ timeout: 7000 });
});

test("saved bundle import rejects unsafe JSON and saved-card actions work", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");
  await page.getByLabel("Save canvas locally").click();

  await page.goto("/saved");
  await expect(page.getByText("Dallas 311 Service Requests Explorer")).toBeVisible();
  await expect(page.getByLabel(/Export Dallas 311 Service Requests Explorer table CSV/)).toBeVisible();

  await page.getByLabel("Edit saved title for Dallas 311 Service Requests Explorer").fill("Edited Dallas local demo");
  await page.getByLabel("Edit saved prompt for Dallas 311 Service Requests Explorer").fill("Edited prompt stored only in browser local storage.");
  await page.getByLabel("Save local edits for Dallas 311 Service Requests Explorer").click();
  await expect(page.getByText("Edited Dallas local demo")).toBeVisible();
  await expect(page.getByText(/Edits update this browser-local saved record/)).toBeVisible();

  await page.getByLabel("Open Edited Dallas local demo").click();
  await expect(page).toHaveURL(/\/explore/);
  await expect(page.getByRole("heading", { name: "Edited Dallas local demo" })).toBeVisible();
  await page.goto("/saved");

  await page.getByLabel("Duplicate Edited Dallas local demo").click();
  await expect(page.getByText("Edited Dallas local demo Copy")).toBeVisible();
  page.once("dialog", async (dialog) => {
    expect(dialog.message()).toContain("Delete Edited Dallas local demo Copy?");
    await dialog.accept();
  });
  await page.getByLabel("Delete Edited Dallas local demo Copy").click();
  await expect(page.getByText("Edited Dallas local demo Copy")).not.toBeVisible();

  await page.getByRole("button", { name: "Export bundle" }).click();
  await expect(page.locator("pre")).toContainText("\"canvases\"");
  await page.getByRole("button", { name: /^Copy share link$/ }).click();
  await expect(page.locator("pre")).toContainText("#canvasBundle=");

  await page.getByLabel("Saved canvas JSON import").fill("{\"canvas\":{\"blocks\":[{\"type\":\"UnknownBlock\",\"props\":{\"html\":\"<script>alert(1)</script>\"}}]}}");
  await page.getByRole("button", { name: "Import" }).click();
  await expect(page.getByText("Import rejected")).toBeVisible();
});

test("saved demo cards prefill the Explore prompt without pretending to persist", async ({ page }) => {
  await page.goto("/saved");

  await page.getByRole("link", { name: /Show Austin building permits by month and ZIP code/ }).click();

  await expect(page).toHaveURL(/\/explore\?prompt=/);
  await expect(page.getByLabel("Dashboard prompt")).toHaveValue("Show Austin building permits by month and ZIP code.");
  await expect(page.getByText("Prompt prefilled from demo link. Generate the dashboard when ready.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dallas 311 Service Requests Explorer" })).toBeVisible();
});

test("confirmed review no-op controls are rendered as status text instead of buttons", async ({ page }) => {
  await page.goto("/explore");

  await expect(page.getByText("No account mode")).toBeVisible();
  await expect(page.getByRole("button", { name: "No account mode" })).toHaveCount(0);
  await expect(page.locator("aside").first().getByRole("button")).toHaveCount(0);
});

test("saved share-link hash rejects malformed bundles without backend persistence", async ({ page }) => {
  let saveRouteCalls = 0;
  await page.route("**/api/canvas/save", async (route) => {
    saveRouteCalls += 1;
    await route.continue();
  });

  await page.goto("/saved#canvasBundle=bm90IGpzb24");

  await expect(page.getByText("Shared link rejected")).toBeVisible();
  await expect(page.getByText("Save a generated dashboard from /explore or import a validated saved-canvas bundle.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to Explore" })).toHaveAttribute("href", "/explore");
  await expect(page).toHaveURL(/\/saved#canvasBundle=/);
  expect(saveRouteCalls).toBe(0);
  expect(await page.evaluate(() => window.localStorage.getItem("tdc.savedCanvases.v1"))).toBeNull();
});

test("Miro preview always includes Source & Method", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");
  await page.getByLabel("Generate Miro export preview").click();

  await expect(page.getByText("Miro export preview")).toBeVisible();
  await expect(page.getByText("Source & Method").first()).toBeVisible();
});

test("gallery route renders checked-in validated canvases", async ({ page }) => {
  await page.goto("/gallery");

  await expect(page.getByAltText("CivicCanvas logo").first()).toBeVisible();
  await expect(page.getByText("Validated sample canvases")).toBeVisible();
  await expect(page.getByText("Dallas 311 Sample Dashboard")).toBeVisible();
  await expect(page.getByText("Austin Permits Sample Dashboard")).toBeVisible();
  await expect(page.getByText("Houston Transportation Sample Dashboard")).toBeVisible();
  await expect(page.getByText("Unsupported Sensitive Prompt Example")).toBeVisible();
  await expect(page.getByText(/Safety proof: gallery dashboards are checked-in CanvasDocument JSON/i)).toBeVisible();
  await expect(page.getByLabel(/Open .* in explore/)).toHaveCount(4);
  await page.getByLabel("Open Dallas 311 Sample Dashboard in explore").click();
  await expect(page).toHaveURL(/\/explore/);
  await expect(page.getByRole("heading", { name: "Dallas 311 Sample Dashboard" })).toBeVisible();
  await page.goto("/gallery");
  await expect(page.getByLabel("Download Dallas 311 Sample Dashboard table CSV")).toBeVisible();
  await expect(page.getByLabel("Download Austin Permits Sample Dashboard CanvasDocument JSON")).toBeVisible();
});

test("demo readiness route shows public release boundaries", async ({ page }) => {
  await page.goto("/demo-readiness");

  await expect(page.getByRole("heading", { name: "Demo readiness" })).toBeVisible();
  await expect(page.getByText("Known sample/live boundaries")).toBeVisible();
  await expect(page.getByText("Dataset readiness")).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy demo checklist" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy release gates" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy hosted handoff" })).toBeVisible();
  await expect(page.getByText("Release proof")).toBeVisible();
  await expect(page.getByText("v1.3.0-hosted-launch-readiness").first()).toBeVisible();
  await expect(page.getByText(/Historical release evidence/i)).toBeVisible();
  await expect(page.getByText(/Do not cite checked-in release evidence as current proof/i)).toBeVisible();
  await expect(page.getByText("Sample data quality")).toBeVisible();
  await expect(page.getByText("Hosted blocker", { exact: true })).toBeVisible();
  await expect(page.getByText(/normal dashboard generation does not call Fal or create image\/video artifacts/i)).toBeVisible();
  await expect(page.getByText(/OpenAI proof is optional, server-side, live-gated/i)).toBeVisible();
  await expect(page.getByText("pnpm provider:openai:smoke:json").first()).toBeVisible();
  await expect(page.getByText("RUN_LIVE_OPENAI_SMOKE=1 pnpm provider:openai:smoke:json")).toBeVisible();
  await expect(page.getByText(/cannot generate dashboard code, SQL, or hidden-field output/i)).toBeVisible();
  await expect(page.getByText("Houston live verification")).toBeVisible();
  await expect(page.getByText(/Houston TranStar publishes sample JSON feeds/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Houston Transportation/ })).toBeVisible();
});

test("key public-beta flows have no serious accessibility violations", async ({ page }) => {
  await page.goto("/explore");
  await expectNoSeriousAccessibilityViolations(page);

  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");
  await expect(page.getByText("Why this dashboard?")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await generate(page, "Show Houston transportation incidents by ZIP and incident type for 2024.");
  await expect(page.getByText("Houston Transportation Incidents Explorer")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.getByLabel("Generate Miro export preview").click();
  await expect(page.getByText("Miro export preview")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.goto("/sources");
  await expect(page.getByText("Live verification").first()).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.goto("/gallery");
  await expect(page.getByText("Validated sample canvases")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.goto("/demo-readiness");
  await expect(page.getByRole("heading", { name: "Demo readiness" })).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.goto("/saved");
  await page.getByLabel("Saved canvas JSON import").fill("{\"canvas\":{\"blocks\":[{\"type\":\"UnknownBlock\",\"props\":{\"html\":\"<script>alert(1)</script>\"}}]}}");
  await page.getByRole("button", { name: "Import" }).click();
  await expect(page.getByText("Import rejected")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);
});

test("mobile viewport has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explore");

  const promptBox = await page.getByLabel("Dashboard prompt").boundingBox();
  const citiesBox = await page.getByText("CITIES").boundingBox();
  expect(promptBox).not.toBeNull();
  expect(citiesBox).not.toBeNull();
  expect(promptBox!.y).toBeLessThan(citiesBox!.y);

  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  expect(overflow).toBe(false);
});
