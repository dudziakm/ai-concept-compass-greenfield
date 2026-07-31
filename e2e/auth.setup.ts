import { expect, test as setup } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate E2E user and reset its concepts", async ({ page }) => {
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

  const response = await page.request.get("/api/concepts");
  expect(response.ok()).toBe(true);
  const payload = (await response.json()) as { concepts: { id: string }[] };
  for (const concept of payload.concepts) {
    const deleted = await page.request.delete(`/api/concepts/${concept.id}`);
    expect(deleted.ok()).toBe(true);
  }

  await page.context().storageState({ path: authFile });
});
