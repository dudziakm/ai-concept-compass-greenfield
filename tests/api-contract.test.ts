import { beforeEach, describe, expect, it, vi } from "vitest";
import { errorResponse } from "@/lib/api";

const getApiContextMock = vi.hoisted(() => vi.fn());
const createClientMock = vi.hoisted(() => vi.fn());

vi.mock("@/lib/api-context", () => ({ getApiContext: getApiContextMock }));
vi.mock("@/lib/supabase", () => ({ createClient: createClientMock }));

import { POST as SIGN_UP } from "@/pages/api/auth/signup";
import { GET as GET_DASHBOARD } from "@/pages/api/dashboard";
import { GET as GET_CONCEPT, PATCH as PATCH_CONCEPT } from "@/pages/api/concepts/[id]";
import { POST as CREATE_REVIEW } from "@/pages/api/concepts/[id]/reviews";
import { GET as LIST_CONCEPTS, POST as CREATE_CONCEPT } from "@/pages/api/concepts/index";
import { POST as LOAD_STARTER_PACK } from "@/pages/api/starter-pack";

const validConcept = {
  title: "Testowe pojęcie",
  domain: "ai-ml-fundamentals",
  description: "Opis dłuższy niż dziesięć znaków.",
  checkQuestion: "Jak działa to pojęcie?",
  answerPattern: "Przykładowy poprawny wzorzec odpowiedzi.",
};

function routeContext({ body, params = {} }: { body?: string; params?: Record<string, string | undefined> } = {}) {
  return {
    locals: {},
    params,
    cookies: {},
    request: new Request("http://localhost/api/test", {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body,
    }),
  } as never;
}

async function payload(response: Response) {
  return (await response.json()) as { error?: { code?: string }; [key: string]: unknown };
}

function authenticated(service: Record<string, ReturnType<typeof vi.fn>>) {
  getApiContextMock.mockReturnValue({ ok: true, user: { id: "user-a" }, service });
}

describe("API route contract", () => {
  const service = {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    createReview: vi.fn(),
    loadStarterPack: vi.fn(),
    dashboard: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    authenticated(service);
  });

  it("returns the shared 401 envelope before touching a service", async () => {
    getApiContextMock.mockReturnValue({
      ok: false,
      response: errorResponse(401, "UNAUTHORIZED", "Zaloguj się, aby kontynuować"),
    });

    const response = await LIST_CONCEPTS(routeContext());

    expect(response.status).toBe(401);
    expect(await payload(response)).toMatchObject({ error: { code: "UNAUTHORIZED" } });
    expect(service.list).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON and invalid write fields with 400", async () => {
    const invalidJson = await CREATE_CONCEPT(routeContext({ body: "{" }));
    const invalidFields = await CREATE_REVIEW(
      routeContext({ body: JSON.stringify({ confidence: 6, outcome: "correct" }), params: { id: "concept-a" } }),
    );

    expect(invalidJson.status).toBe(400);
    expect(await payload(invalidJson)).toMatchObject({ error: { code: "INVALID_JSON" } });
    expect(invalidFields.status).toBe(400);
    expect(await payload(invalidFields)).toMatchObject({ error: { code: "VALIDATION_ERROR" } });
    expect(service.create).not.toHaveBeenCalled();
    expect(service.createReview).not.toHaveBeenCalled();
  });

  it("maps a duplicate concept to 409", async () => {
    service.create.mockRejectedValue(Object.assign(new Error("duplicate"), { code: "23505" }));

    const response = await CREATE_CONCEPT(routeContext({ body: JSON.stringify(validConcept) }));

    expect(response.status).toBe(409);
    expect(await payload(response)).toMatchObject({ error: { code: "CONFLICT" } });
  });

  it("hides a missing or non-owned concept behind 404", async () => {
    service.get.mockResolvedValue(null);

    const response = await GET_CONCEPT(routeContext({ params: { id: "foreign-id" } }));

    expect(response.status).toBe(404);
    expect(await payload(response)).toMatchObject({ error: { code: "NOT_FOUND" } });
    expect(service.get).toHaveBeenCalledWith("user-a", "foreign-id");
  });

  it("rejects an empty patch before persistence", async () => {
    const response = await PATCH_CONCEPT(routeContext({ body: "{}", params: { id: "concept-a" } }));

    expect(response.status).toBe(400);
    expect(await payload(response)).toMatchObject({ error: { code: "VALIDATION_ERROR" } });
    expect(service.update).not.toHaveBeenCalled();
  });

  it("returns 500 without leaking an infrastructure error", async () => {
    service.dashboard.mockRejectedValue(new Error("database host and internal detail"));

    const response = await GET_DASHBOARD(routeContext());
    const body = await response.text();

    expect(response.status).toBe(500);
    expect(body).toContain("INTERNAL_ERROR");
    expect(body).not.toContain("database host");
  });

  it("preserves success statuses for create, starter pack and review", async () => {
    service.create.mockResolvedValue({ id: "concept-a" });
    service.loadStarterPack.mockResolvedValue({ concepts: [], templateCount: 10 });
    service.createReview.mockResolvedValue({ id: "attempt-a" });

    const created = await CREATE_CONCEPT(routeContext({ body: JSON.stringify(validConcept) }));
    const starter = await LOAD_STARTER_PACK(routeContext());
    const reviewed = await CREATE_REVIEW(
      routeContext({ body: JSON.stringify({ confidence: 3, outcome: "partial" }), params: { id: "concept-a" } }),
    );

    expect(created.status).toBe(201);
    expect(starter.status).toBe(200);
    expect(reviewed.status).toBe(201);
  });
});

describe("signup boundary", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates an account and redirects to the confirmation instructions", async () => {
    const signUp = vi.fn().mockResolvedValue({ error: null });
    createClientMock.mockReturnValue({ auth: { signUp } });
    const form = new FormData();
    form.set("email", "learner@example.com");
    form.set("password", "correct-horse-battery-staple");
    const request = new Request("http://localhost/api/auth/signup", { method: "POST", body: form });
    const redirect = vi.fn((location: string) =>
      Promise.resolve(new Response(null, { status: 302, headers: { location } })),
    );

    const response = await SIGN_UP({ request, cookies: {}, redirect } as never);

    expect(signUp).toHaveBeenCalledWith({
      email: "learner@example.com",
      password: "correct-horse-battery-staple",
    });
    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("/auth/confirm-email");
  });
});
