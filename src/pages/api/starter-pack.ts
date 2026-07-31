import type { APIRoute } from "astro";
import { errorResponse, json } from "@/lib/api";
import { getApiContext } from "@/lib/api-context";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const api = getApiContext(context);
  if (!api.ok) return api.response;

  try {
    return json(await api.service.loadStarterPack(api.user.id));
  } catch {
    return errorResponse(500, "INTERNAL_ERROR", "Nie udało się załadować pakietu startowego");
  }
};
