// risk: context/testing/test-plan.md — rendered navigation stays accessible
// seed: adapted from 10x-e2e/references/seed-test-pattern.md
import { expect, test } from "@playwright/test";

test.describe("E2E seed", () => {
  test("authenticated user can reach an empty learning dashboard", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "Co warto powtórzyć teraz?" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Załaduj pakiet startowy" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Dodaj pojęcie" })).toBeVisible();
  });
});
