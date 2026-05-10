import { expect, test, type Page } from "@playwright/test";

const PRIMARY_JUDGE_PROMPT = "Show Dallas 311 service requests by category and ZIP code for 2024.";

async function generate(page: Page, prompt: string) {
  await page.getByLabel("Dashboard prompt").fill(prompt);
  await page.getByRole("button", { name: "Generate View" }).click();
  await expect(page.getByText("Validated CanvasSpec")).toBeVisible();
}

test("primary judge demo path generates an inspectable Dallas fallback dashboard", async ({ page }) => {
  await page.goto("/explore");
  await generate(page, PRIMARY_JUDGE_PROMPT);

  await expect(page.getByRole("heading", { name: "Dallas 311 Service Requests Explorer" })).toBeVisible();
  await expect(page.getByText("Monthly trend")).toBeVisible();
  await expect(page.getByText("ZIP-code aggregate geography")).toBeVisible();
  await expect(page.getByText("Grouped detail table")).toBeVisible();
  await expect(page.getByText("Source and method")).toBeVisible();
  await expect(page.getByText("Live unavailable, sample fallback used").first()).toBeVisible();
  await expect(page.getByText("Verified live source lacks required dashboard field(s): zip_code.").first()).toBeVisible();
  await expect(page.getByText("Choose an approved dataset")).not.toBeVisible();

  const inspector = page.locator("aside").last();
  await expect(inspector.getByText("Why this dashboard?")).toBeVisible();
  await inspector.getByText("Why this dashboard?").click();
  const reasonCodes = inspector.getByText(/Reason codes:.*geography_requested.*category_grouping_requested/);
  await expect(reasonCodes).toBeVisible();
  await expect(inspector.getByText("Dataset ID matched approved catalog.").first()).toBeVisible();
  await expect(inspector.getByText(/Row limit enforced at \d+\./).first()).toBeVisible();

  const activeQuery = inspector.getByLabel("Active BoundedQuerySpec JSON");
  await expect(activeQuery).toContainText('"datasetId": "dallas_311_requests"');
  await expect(activeQuery).toContainText('"groupBy"');
  await expect(activeQuery).toContainText('"category"');
  await expect(activeQuery).toContainText('"zip_code"');
  await expect(activeQuery).toContainText('"limit": 20');
});
