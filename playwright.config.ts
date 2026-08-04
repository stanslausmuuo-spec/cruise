import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 2 : 1,
  retries: process.env.CI ? 2 : 1,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 30000,
  use: {
    trace: "on-first-retry",
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: [
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--enable-unsafe-swiftshader",
            "--use-gl=swiftshader",
            "--disable-features=CSSBackdropFilter,BackdropFilterRect",
          ],
        },
      },
    },
  ],
});
