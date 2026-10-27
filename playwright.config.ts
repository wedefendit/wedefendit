import { defineConfig } from "@playwright/test";

const port = 3005;
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:" + port;
const RETAIN_ON_FAILURE = "retain-on-failure";
const NEVER_OPEN_REPORT = "never";

enum BrowserName {
  Chromium = "chromium",
  Firefox = "firefox",
  WebKit = "webkit",
}

enum ReporterName {
  List = "list",
  Html = "html",
}

export default defineConfig({
  testDir: "./tests/playwright",
  testMatch: "*.e2e.spec.ts",
  fullyParallel: true,
  workers: "100%",
  retries: 1,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      threshold: 0.25,
    },
  },
  reporter: [[ReporterName.List], [ReporterName.Html, { open: NEVER_OPEN_REPORT }]],
  outputDir: "test-results/playwright",
  use: {
    baseURL,
    headless: true,
    colorScheme: "dark",
    trace: RETAIN_ON_FAILURE,
    screenshot: "only-on-failure",
    video: RETAIN_ON_FAILURE,
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run start -- --hostname 127.0.0.1",
        url: baseURL + "/awareness/digital-house",
        reuseExistingServer: true,
        timeout: 180_000,
      },
  projects: [
    {
      name: BrowserName.Chromium,
      use: { browserName: BrowserName.Chromium },
    },
    {
      name: BrowserName.Firefox,
      use: { browserName: BrowserName.Firefox },
    },
    {
      name: BrowserName.WebKit,
      use: { browserName: BrowserName.WebKit },
    },
  ],
});
