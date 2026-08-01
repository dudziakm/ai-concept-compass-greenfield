import type { Page } from "@playwright/test";

export function sameOriginHeaders(page: Page) {
  const url = new URL(page.url());

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Open the application before making an authenticated mutating API request");
  }

  return { origin: url.origin };
}
