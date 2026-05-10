import { expect, test, type Page } from "@playwright/test";

const PRIMARY_JUDGE_PROMPT = "Show Dallas 311 service requests by category and ZIP code for 2024.";

async function generate(page: Page, prompt: string) {
  await page.getByLabel("Dashboard prompt").fill(prompt);
  await page.getByRole("button", { name: "Generate View" }).click();
  await expect(page.getByText("Validated CanvasSpec")).toBeVisible();
}

test("sources, saved canvases, and Miro preview stay governed", async ({ page }) => {
  let saveRouteCalls = 0;
  await page.route("**/api/canvas/save", async (route) => {
    saveRouteCalls += 1;
    await route.continue();
  });

  await page.goto("/sources");
  await expect(page.getByText("precise_address · hidden")).toBeVisible();
  await expect(page.getByText(/intentionally excluded from queries, exports, and generated dashboards/i)).toBeVisible();

  await page.goto("/explore");
  await generate(page, PRIMARY_JUDGE_PROMPT);
  await page.getByLabel("Save canvas locally").click();
  await expect(page.getByText("Saved locally: Dallas 311 Service Requests Explorer")).toBeVisible();

  await page.goto("/saved");
  await expect(page.getByText(/Saved canvases stay browser-local/i)).toBeVisible();
  await expect(page.getByText(/without adding accounts or a hosted database/i)).toBeVisible();
  await expect(page.getByText(/Share links\s+place the validated bundle in the URL hash/i)).toBeVisible();
  await expect(page.getByText("Dallas 311 Service Requests Explorer")).toBeVisible();
  expect(saveRouteCalls).toBe(0);
  await page.getByLabel("Open Dallas 311 Service Requests Explorer").click();
  await expect(page).toHaveURL(/\/explore/);
  await expect(page.getByRole("heading", { name: "Dallas 311 Service Requests Explorer" })).toBeVisible();

  const miroResponsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/export/miro-spec") && response.request().method() === "POST"
  );
  await page.getByLabel("Generate Miro export preview").click();
  const miroResponse = await miroResponsePromise;
  expect(miroResponse.ok()).toBe(true);

  const miroPayload = await miroResponse.json();
  expect(miroPayload.note).toContain("Preview-only MiroExportSpec");
  expect(miroPayload.note).toContain("No Miro board write");
  expect(JSON.stringify(miroPayload)).not.toMatch(/oauth|accessToken|boardId|write_to_board/i);

  await expect(page.getByText(/Miro export spec generated with \d+ frames\. Preview-only\./)).toBeVisible();
  await expect(page.getByText("Miro export preview")).toBeVisible();
  await expect(page.getByText("Source & Method").first()).toBeVisible();
});
