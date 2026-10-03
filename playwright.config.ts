import { defineConfig, devices } from "@playwright/test";

// Playwright's own browser download was skipped (slow network); use the
// pre-installed system Chromium. Override with env PW_CHROMIUM_PATH if needed.
const chromiumPath = process.env.PW_CHROMIUM_PATH ?? "/opt/meta-chromium/chrome";
// Newer Chromium (≥142) enforces Local Network Access checks, which block
// tests from reaching the localhost dev server. Disable for test runs.
const launchOptions = {
  executablePath: chromiumPath,
  args: ["--disable-features=LocalNetworkAccessChecks"],
};

export default defineConfig({
  testDir: "e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Base URL for `bun run dev` / `vite dev`. Start the dev server first.
  // NOTE: specs navigate via the file:// LNA trampoline (e2e/helpers.ts),
  // so baseURL is informational; DEV_ORIGIN there is the actual origin.
  use: {
    baseURL: "http://localhost:8080",
    // SSR + hydration can take a moment on a cold dev server.
    navigationTimeout: 60000,
    actionTimeout: 15000,
    trace: "on-first-retry",
  },
  timeout: 120000,
  retries: 1,
  reporter: [["list"], ["html", { outputFolder: "e2e-results/html", open: "never" }]],
  outputDir: "e2e-results/artifacts",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], launchOptions },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], launchOptions },
    },
  ],
});
