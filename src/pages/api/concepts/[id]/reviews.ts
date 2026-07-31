import type { APIRoute } from "astro";
import { errorResponse, json, parseJson } from "@/lib/api";
import { getApiContext } from "@/lib/api-context";
import { createReviewSchema } from "@/lib/schemas";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const api = getApiContext(context);
  if (!api.ok) return api.response;
  const id = context.params.id;
  if (!id) return errorResponse(404, "NOT_FOUND", "Nie znaleziono pojęcia");
  const parsed = await parseJson(context.request, createReviewSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const attempt = await api.service.createReview(api.user.id, id, parsed.data, new Date());
    return attempt ? json({ attempt }, 201) : errorResponse(404, "NOT_FOUND", "Nie znaleziono pojęcia");
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Nie udało się zapisać powtórki");
  }
};
