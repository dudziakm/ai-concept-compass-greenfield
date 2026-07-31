import type { APIContext } from "astro";
import { errorResponse } from "@/lib/api";
import { ConceptService } from "@/lib/services/concept-service";
import { createClient } from "@/lib/supabase";

export function getApiContext(context: APIContext) {
  const user = context.locals.user;
  if (!user) {
    return { ok: false as const, response: errorResponse(401, "UNAUTHORIZED", "Zaloguj się, aby kontynuować") };
  }

  const supabase = createClient(context.request.headers, context.cookies);
  if (!supabase) {
    return {
      ok: false as const,
      response: errorResponse(500, "CONFIGURATION_ERROR", "Połączenie z bazą danych nie jest skonfigurowane"),
    };
  }

  return { ok: true as const, user, service: new ConceptService(supabase) };
}
