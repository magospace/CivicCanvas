import { defineConfig, devices } from "@playwright/test";

const remoteBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const localBaseURL = "http://localhost:3002";
const baseURL = remoteBaseURL ?? localBaseURL;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: "retain-on-failure"
  },
  webServer: remoteBaseURL ? undefined : {
    command: "pnpm --dir apps/web exec next dev -p 3002",
    url: `${localBaseURL}/explore`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});
