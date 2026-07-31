import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://127.0.0.1:4321";
const useExternalServer = Boolean(process.env.E2E_BASE_URL);

export default defineConfig({
  testDir: "./e2e",
  // The critical flow intentionally reuses and resets one confirmed Supabase
  // account, so tests must not race each other against shared hosted state.
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "playwright/.auth/user.json" },
      dependencies: ["setup"],
      testIgnore: /auth\.setup\.ts/,
    },
  ],
  webServer: useExternalServer
    ? undefined
    : {
        command: "npm run dev -- --host 127.0.0.1",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        env: {
          SUPABASE_URL: process.env.SUPABASE_URL ?? "",
          SUPABASE_KEY: process.env.SUPABASE_KEY ?? "",
        },
      },
});
