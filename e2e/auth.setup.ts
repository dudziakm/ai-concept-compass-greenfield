import { expect, test as setup, type Page } from "@playwright/test";
import { resetE2EStarterPack } from "./support/starter-pack";

const authFile = "playwright/.auth/user.json";

async function expectRecoveredDashboard(page: Page) {
  const dashboardHeading = page.getByRole("heading", { name: "Co warto powtórzyć teraz?" });
  const recoverableError = page
    .getByRole("alert")
    .filter({ has: page.getByRole("button", { name: "Spróbuj ponownie" }) });

  await expect(dashboardHeading.or(recoverableError)).toBeVisible({ timeout: 15_000 });
  if (await recoverableError.isVisible()) {
    await recoverableError.getByRole("button", { name: "Spróbuj ponownie" }).click();
  }
  await expect(dashboardHeading).toBeVisible({ timeout: 15_000 });
}

setup("authenticate E2E user and seed its starter pack", async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  if (!email || !password) {
    throw new Error("Set E2E_USER_EMAIL and E2E_USER_PASSWORD to an existing confirmed Supabase test account");
  }

  await page.goto("/auth/signin");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Hasło").fill(password);
  await page.getByRole("button", { name: "Zaloguj się" }).click();
  await page.waitForURL("**/dashboard");
  await expectRecoveredDashboard(page);

  const starterPack = await resetE2EStarterPack(page);
  expect(starterPack.templateCount).toBe(10);
  expect(starterPack.concepts).toHaveLength(10);

  await page.context().storageState({ path: authFile });
});
