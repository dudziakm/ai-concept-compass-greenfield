import { expect, test as setup } from "@playwright/test";
import { resetE2EStarterPack } from "./support/starter-pack";

const authFile = "playwright/.auth/user.json";

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
  await expect(page.getByRole("heading", { name: "Co warto powtórzyć teraz?" })).toBeVisible();

  const starterPack = await resetE2EStarterPack(page);
  expect(starterPack.templateCount).toBe(10);
  expect(starterPack.concepts).toHaveLength(10);

  await page.context().storageState({ path: authFile });
});
