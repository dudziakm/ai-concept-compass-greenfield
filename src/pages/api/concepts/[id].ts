import type { APIRoute } from "astro";
import { errorResponse, json, parseJson } from "@/lib/api";
import { getApiContext } from "@/lib/api-context";
import { updateConceptSchema } from "@/lib/schemas";

export const prerender = false;

function conceptId(context: Parameters<APIRoute>[0]) {
  return context.params.id;
}

export const GET: APIRoute = async (context) => {
  const api = getApiContext(context);
  if (!api.ok) return api.response;
  const id = conceptId(context);
  if (!id) return errorResponse(404, "NOT_FOUND", "Nie znaleziono pojęcia");

  try {
    const concept = await api.service.get(api.user.id, id);
    return concept ? json({ concept }) : errorResponse(404, "NOT_FOUND", "Nie znaleziono pojęcia");
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Nie udało się pobrać pojęcia");
  }
};

export const PATCH: APIRoute = async (context) => {
  const api = getApiContext(context);
  if (!api.ok) return api.response;
  const id = conceptId(context);
  if (!id) return errorResponse(404, "NOT_FOUND", "Nie znaleziono pojęcia");
  const parsed = await parseJson(context.request, updateConceptSchema);
  if (!parsed.ok) return parsed.response;

  try {
    const concept = await api.service.update(api.user.id, id, parsed.data);
    return concept ? json({ concept }) : errorResponse(404, "NOT_FOUND", "Nie znaleziono pojęcia");
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Nie udało się zaktualizować pojęcia");
  }
};

export const DELETE: APIRoute = async (context) => {
  const api = getApiContext(context);
  if (!api.ok) return api.response;
  const id = conceptId(context);
  if (!id) return errorResponse(404, "NOT_FOUND", "Nie znaleziono pojęcia");

  try {
    const deleted = await api.service.delete(api.user.id, id);
    return deleted ? new Response(null, { status: 204 }) : errorResponse(404, "NOT_FOUND", "Nie znaleziono pojęcia");
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Nie udało się usunąć pojęcia");
  }
};
