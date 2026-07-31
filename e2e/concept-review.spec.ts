// risk: context/testing/test-plan.md — auth → starter pack → CRUD → review → recommendation breaks across boundaries
// seed: e2e/seed.spec.ts
import { expect, test } from "@playwright/test";

test.describe("Główny przepływ nauki", () => {
  test("pakiet, edycja, review i rekomendacja działają przez prawdziwe API i bazę", async ({ page }) => {
    const editedTitle = `Embeddings i RAG — E2E ${Date.now()}`;

    try {
      // Załaduj idempotentny pakiet na pustym koncie.
      await page.goto("/dashboard");
      const starterResponse = page.waitForResponse(
        (response) => response.url().endsWith("/api/starter-pack") && response.request().method() === "POST",
      );
      await page.getByRole("button", { name: "Załaduj pakiet startowy" }).click();
      expect((await starterResponse).status()).toBe(200);
      await expect(page.getByText("Wszystkie pojęcia")).toBeVisible();

      // Powtórzenie pakietu jest idempotentne na prawdziwej bazie.
      const repeatedStarter = await page.request.post("/api/starter-pack");
      expect(repeatedStarter.status()).toBe(200);
      const repeatedPayload = (await repeatedStarter.json()) as { concepts: { id: string }[]; templateCount: number };
      expect(repeatedPayload.templateCount).toBe(10);
      expect(repeatedPayload.concepts).toHaveLength(10);

      // Pełny custom CRUD przechodzi przez endpointy i hosted persistence.
      const customCreate = await page.request.post("/api/concepts", {
        data: {
          title: "Własne pojęcie E2E",
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
        data: { title: "Własne pojęcie E2E — zmienione" },
      });
      expect(customUpdate.status()).toBe(200);
      const customDelete = await page.request.delete(`/api/concepts/${customId}`);
      expect(customDelete.status()).toBe(204);
      expect((await page.request.get(`/api/concepts/${customId}`)).status()).toBe(404);

      // Edytuj jedno pojęcie i sprawdź, że wynik przetrwał granicę UI/API/DB.
      const originalTitle = "Embeddings, wyszukiwanie wektorowe i RAG";
      await page.getByRole("button", { name: `Edytuj ${originalTitle}` }).click();
      await page.getByLabel("Nazwa pojęcia").fill(editedTitle);
      const editResponse = page.waitForResponse(
        (response) => response.url().includes("/api/concepts/") && response.request().method() === "PATCH",
      );
      await page.getByRole("button", { name: "Zapisz zmiany" }).click();
      expect((await editResponse).status()).toBe(200);
      await expect(page.getByText(editedTitle, { exact: true })).toBeVisible();

      // Wykonaj review i zweryfikuj biznesowy wynik mastery.
      await page.getByRole("button", { name: new RegExp(editedTitle) }).click();
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
      const response = await page.request.get("/api/concepts");
      if (response.ok()) {
        const payload = (await response.json()) as { concepts: { id: string }[] };
        await Promise.all(payload.concepts.map((concept) => page.request.delete(`/api/concepts/${concept.id}`)));
      }
    }
  });
});
