import type { APIRoute } from "astro";
import { errorResponse, json, parseJson } from "@/lib/api";
import { getApiContext } from "@/lib/api-context";
import { createConceptSchema } from "@/lib/schemas";
import { isConflict } from "@/lib/services/concept-service";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const api = getApiContext(context);
  if (!api.ok) return api.response;

  try {
    return json({ concepts: await api.service.list(api.user.id) });
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Nie udało się pobrać pojęć");
  }
};

export const POST: APIRoute = async (context) => {
  const api = getApiContext(context);
  if (!api.ok) return api.response;
  const parsed = await parseJson(context.request, createConceptSchema);
  if (!parsed.ok) return parsed.response;

  try {
    return json({ concept: await api.service.create(api.user.id, parsed.data) }, 201);
  } catch (error) {
    if (isConflict(error)) return errorResponse(409, "CONFLICT", "Takie pojęcie już istnieje");
    return errorResponse(500, "INTERNAL_ERROR", "Nie udało się utworzyć pojęcia");
  }
};
