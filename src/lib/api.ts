import type { ZodType } from "zod";

export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export function errorResponse(status: 400 | 401 | 404 | 409 | 500, code: string, message: string, details?: unknown) {
  return json({ error: { code, message, ...(details ? { details } : {}) } }, status);
}

export async function parseJson<T>(request: Request, schema: ZodType<T>) {
  try {
    const body: unknown = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return {
        ok: false as const,
        response: errorResponse(400, "VALIDATION_ERROR", "Niepoprawne dane", result.error.issues),
      };
    }
    return { ok: true as const, data: result.data };
  } catch {
    return {
      ok: false as const,
      response: errorResponse(400, "INVALID_JSON", "Treść żądania nie jest poprawnym JSON-em"),
    };
  }
}
