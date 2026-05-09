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
  await expect(page).toHaveTitle(/Texas Data Canvas/);
  await expect(page.getByText("Texas Data Canvas").first()).toBeVisible();
  await expect(page.getByLabel("Dashboard prompt")).toBeVisible();
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

test("explicit sample data mode is visible in the dashboard flow", async ({ page }) => {
  await page.goto("/explore");
  await page.getByLabel("Data mode", { exact: true }).selectOption("sample");
  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");

  await expect(page.locator("aside").getByText("Sample fallback").first()).toBeVisible();
  await expect(page.getByText("Data mode control requested sample fallback.").first()).toBeVisible();
});

test("Austin prompt generates a governed permits dashboard", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show Austin building permits by month and ZIP code for 2024.");

  await expect(page.getByText("Austin Building Permits Explorer")).toBeVisible();
  await expect(page.getByText("City: Austin")).toBeVisible();
  await expect(page.locator("aside").getByText("Sample fallback").first()).toBeVisible();
});

test("sources route shows live verification status", async ({ page }) => {
  await page.goto("/sources");

  await expect(page.getByText("Live verification").first()).toBeVisible();
  await expect(page.getByText("live promoted").first()).toBeVisible();
  await expect(page.getByText("sample fallback required").first()).toBeVisible();
});

test("unsupported sensitive prompt returns suggestions instead of a dashboard", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show private phone numbers for bridge repairs on Mars.");

  await expect(page.getByText("Prompt not recognized. Showing approved dataset suggestions.")).toBeVisible();
  await expect(page.getByText("Choose an approved dataset")).toBeVisible();
  await expect(page.getByText(/Prompt referenced "phone"/)).toBeVisible();
});

test("saved bundle import rejects unsafe JSON", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");
  await page.getByLabel("Save canvas locally").click();

  await page.goto("/saved");
  await expect(page.getByText("Dallas 311 Service Requests Explorer")).toBeVisible();
  await page.getByRole("button", { name: "Export bundle" }).click();
  await expect(page.locator("pre")).toContainText("\"canvases\"");

  await page.getByLabel("Saved canvas JSON import").fill("{\"canvas\":{\"blocks\":[{\"type\":\"UnknownBlock\",\"props\":{\"html\":\"<script>alert(1)</script>\"}}]}}");
  await page.getByRole("button", { name: "Import" }).click();
  await expect(page.getByText("Import rejected")).toBeVisible();
});

test("Miro preview always includes Source & Method", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");
  await page.getByLabel("Generate Miro export preview").click();

  await expect(page.getByText("Miro export preview")).toBeVisible();
  await expect(page.getByText("Source & Method").first()).toBeVisible();
});

test("key public-beta flows have no serious accessibility violations", async ({ page }) => {
  await page.goto("/explore");
  await expectNoSeriousAccessibilityViolations(page);

  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");
  await expect(page.getByText("Why this dashboard?")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.getByLabel("Generate Miro export preview").click();
  await expect(page.getByText("Miro export preview")).toBeVisible();
  await expectNoSeriousAccessibilityViolations(page);

  await page.goto("/sources");
  await expect(page.getByText("Live verification").first()).toBeVisible();
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
  await generate(page, "Show Dallas 311 service requests by category and ZIP code for 2024.");

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
  expect(overflow).toBe(false);
});
