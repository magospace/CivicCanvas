import { expect, test } from "@playwright/test";

test("sources catalog exposes governed source confidence and filtering", async ({ page }) => {
  await page.goto("/sources");

  await expect(page.getByText("Dallas 311 Service Requests")).toBeVisible();
  await expect(page.getByText("Austin Building Permits")).toBeVisible();
  await expect(page.getByText("Houston Transportation Incidents and Road Projects")).toBeVisible();
  await expect(page.getByText("Live verification").first()).toBeVisible();
  await expect(page.getByText("Live-capable fields:").first()).toBeVisible();
  await expect(page.getByText("Sample-only fields:").first()).toBeVisible();
  await expect(page.getByText("precise_address · hidden")).toBeVisible();
  await expect(page.getByText(/Hidden fields such as precise_address/i)).toBeVisible();
  await expect(page.getByText(/intentionally excluded from queries, exports, and generated dashboards/i)).toBeVisible();
  await expect(page.getByText("123 Main")).not.toBeVisible();

  await page.getByLabel("City").selectOption("Houston");
  await expect(page.getByText("Houston Transportation Incidents and Road Projects")).toBeVisible();
  await expect(page.getByText("Dallas 311 Service Requests")).not.toBeVisible();
  await expect(page.getByText("Austin Building Permits")).not.toBeVisible();
  await expect(page.getByText("sample-first").first()).toBeVisible();
});
