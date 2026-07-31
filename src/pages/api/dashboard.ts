import type { APIRoute } from "astro";
import { errorResponse, json } from "@/lib/api";
import { getApiContext } from "@/lib/api-context";

export const prerender = false;

export const GET: APIRoute = async (context) => {
  const api = getApiContext(context);
  if (!api.ok) return api.response;

  try {
    return json(await api.service.dashboard(api.user.id, new Date()));
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Nie udało się przygotować rekomendacji");
  }
};
