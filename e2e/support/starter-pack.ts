import type { Page } from "@playwright/test";
import { sameOriginHeaders } from "./request-headers";

interface ConceptListPayload {
  concepts: { id: string }[];
}

interface StarterPackPayload {
  concepts: { id: string }[];
  templateCount: number;
}

export async function clearE2EConcepts(page: Page) {
  const response = await page.request.get("/api/concepts");
  if (!response.ok()) {
    throw new Error(`Could not list E2E concepts (HTTP ${response.status()})`);
  }

  const { concepts } = (await response.json()) as ConceptListPayload;
  for (const concept of concepts) {
    const deleted = await page.request.delete(`/api/concepts/${concept.id}`, {
      headers: sameOriginHeaders(page),
    });
    if (!deleted.ok()) {
      throw new Error(`Could not remove E2E concept ${concept.id} (HTTP ${deleted.status()})`);
    }
  }
}

export async function resetE2EStarterPack(page: Page): Promise<StarterPackPayload> {
  await clearE2EConcepts(page);

  const response = await page.request.post("/api/starter-pack", {
    headers: sameOriginHeaders(page),
  });
  if (!response.ok()) {
    throw new Error(`Could not seed the E2E starter pack (HTTP ${response.status()})`);
  }

  return (await response.json()) as StarterPackPayload;
}
