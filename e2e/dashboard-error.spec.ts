// risk: a temporary dashboard API failure leaves the learner without recovery guidance
// seed: e2e/seed.spec.ts
import { expect, test } from "@playwright/test";

test.describe("Odzyskiwanie dashboardu", () => {
  test("chwilowy błąd ładowania daje jasną instrukcję i pozwala ponowić", async ({ page }) => {
    let shouldFail = true;
    await page.route("**/api/dashboard", async (route) => {
      if (shouldFail) {
        shouldFail = false;
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: { code: "INTERNAL_ERROR", message: "Błąd testowy" } }),
        });
        return;
      }

      await route.continue();
    });

    await page.goto("/dashboard");

    const alert = page.getByRole("alert");
    await expect(alert).toContainText("Nie udało się wczytać Twojego planu nauki");
    await expect(alert).toContainText("Dane nie zostały zmienione");

    await page.getByRole("button", { name: "Spróbuj ponownie" }).click();
    await expect(page.getByRole("heading", { name: "Wszystkie pojęcia" })).toBeVisible();
  });
});
