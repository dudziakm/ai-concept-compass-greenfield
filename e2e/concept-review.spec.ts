// risk: context/testing/test-plan.md — auth → starter pack → CRUD → review → recommendation breaks across boundaries
// seed: e2e/seed.spec.ts
import { expect, test, type Page } from "@playwright/test";
import { sameOriginHeaders } from "./support/request-headers";
import { clearE2EConcepts, resetE2EStarterPack } from "./support/starter-pack";

async function findConceptCardIndex(page: Page, title: string) {
  const cards = await page.getByRole("article").all();

  for (const [index, card] of cards.entries()) {
    if (await card.getByRole("heading", { level: 3, name: title, exact: true }).count()) return index;
  }

  throw new Error(`Concept card not found: ${title}`);
}

test.describe("Główny przepływ nauki", () => {
  test("pakiet, edycja, review i rekomendacja działają przez prawdziwe API i bazę", async ({ page }) => {
    // Hosted Supabase and browser navigation can consume most of Playwright's
    // default 30 s budget. Leave enough time for deterministic cleanup, so a
    // completed user flow cannot turn red while restoring the shared test pack.
    test.setTimeout(60_000);
    const editedTitle = `Embeddings i RAG — E2E ${Date.now()}`;
    const customTitle = `Własne pojęcie E2E ${Date.now()}`;

    try {
      // Załaduj idempotentny pakiet na pustym koncie.
      await page.goto("/dashboard");
      await clearE2EConcepts(page);
      await page.reload();
      const starterResponse = page.waitForResponse(
        (response) => response.url().endsWith("/api/starter-pack") && response.request().method() === "POST",
      );
      await page.getByRole("button", { name: "Załaduj pakiet startowy" }).click();
      expect((await starterResponse).status()).toBe(200);
      await expect(page.getByText("Wszystkie pojęcia")).toBeVisible();

      // Powtórzenie pakietu jest idempotentne na prawdziwej bazie.
      const repeatedStarter = await page.request.post("/api/starter-pack", {
        headers: sameOriginHeaders(page),
      });
      expect(repeatedStarter.status()).toBe(200);
      const repeatedPayload = (await repeatedStarter.json()) as { concepts: { id: string }[]; templateCount: number };
      expect(repeatedPayload.templateCount).toBe(10);
      expect(repeatedPayload.concepts).toHaveLength(10);

      // Pełny custom CRUD przechodzi przez endpointy i hosted persistence.
      const customCreate = await page.request.post("/api/concepts", {
        headers: sameOriginHeaders(page),
        data: {
          title: customTitle,
          domain: "ai-ml-fundamentals",
          description: "Pojęcie tworzone wyłącznie na czas scenariusza E2E.",
          checkQuestion: "Czy zapis przechodzi przez API do bazy?",
          answerPattern: "Tak, a dalszy odczyt i edycja potwierdzają persistence.",
        },
      });
      expect(customCreate.status()).toBe(201);
      const customPayload = (await customCreate.json()) as { concept: { id: string } };
      const customId = customPayload.concept.id;
      const customRead = await page.request.get(`/api/concepts/${customId}`);
      expect(customRead.status()).toBe(200);
      const customUpdate = await page.request.patch(`/api/concepts/${customId}`, {
        headers: sameOriginHeaders(page),
        data: { title: `${customTitle} — zmienione` },
      });
      expect(customUpdate.status()).toBe(200);
      const customDelete = await page.request.delete(`/api/concepts/${customId}`, {
        headers: sameOriginHeaders(page),
      });
      expect(customDelete.status()).toBe(204);
      expect((await page.request.get(`/api/concepts/${customId}`)).status()).toBe(404);

      // Edytuj jedno pojęcie i sprawdź, że wynik przetrwał granicę UI/API/DB.
      const originalTitle = "Embeddings, wyszukiwanie wektorowe i RAG";
      const originalCardIndex = await findConceptCardIndex(page, originalTitle);
      await page.getByRole("button", { name: `Edytuj ${originalTitle}` }).click();
      await page.getByLabel("Nazwa pojęcia").fill(editedTitle);
      const editResponse = page.waitForResponse(
        (response) => response.url().includes("/api/concepts/") && response.request().method() === "PATCH",
      );
      await page.getByRole("button", { name: "Zapisz zmiany" }).click();
      expect((await editResponse).status()).toBe(200);

      // Zapis nie zmienia miejsca karty i wyraźnie przenosi do niej kontekst użytkownika.
      const editedConceptCard = page.getByRole("article").filter({
        has: page.getByRole("heading", { level: 3, name: editedTitle, exact: true }),
      });
      await expect(editedConceptCard.getByRole("heading", { level: 3, name: editedTitle, exact: true })).toBeVisible();
      expect(await findConceptCardIndex(page, editedTitle)).toBe(originalCardIndex);
      await expect(page.getByRole("status")).toContainText(
        `Zapisano zmiany. Pojęcie „${editedTitle}” pozostaje na swoim miejscu.`,
      );
      await expect(editedConceptCard).toHaveAttribute("aria-describedby", "concept-save-status");
      await expect(editedConceptCard.getByRole("button").first()).toBeFocused();

      // Wykonaj review i zweryfikuj biznesowy wynik mastery.
      await editedConceptCard.getByRole("button").first().click();
      const recommendationHeading = page.getByRole("heading", { level: 2 }).filter({ hasText: editedTitle });
      await expect(recommendationHeading).toBeVisible();
      await page.getByRole("button", { name: "5", exact: true }).click();
      await page.getByRole("button", { name: "Pokaż wzorzec odpowiedzi" }).click();
      const reviewResponse = page.waitForResponse(
        (response) => response.url().endsWith("/reviews") && response.request().method() === "POST",
      );
      await page.getByRole("button", { name: "Częściowo" }).click();
      expect((await reviewResponse).status()).toBe(201);
      await expect(page.getByLabel("Średnie mastery: 5%")).toBeVisible();
      await expect(recommendationHeading).not.toBeVisible();
      await expect(page.getByText("Priorytet 100")).toBeVisible();

      // Usuń pojęcie wraz z historią i potwierdź skutek widoczny dla użytkownika.
      page.once("dialog", (dialog) => dialog.accept());
      await page.getByRole("button", { name: `Usuń ${editedTitle}` }).click();
      await expect(page.getByText(editedTitle, { exact: true })).not.toBeVisible();
    } finally {
      await resetE2EStarterPack(page);
    }
  });
});
