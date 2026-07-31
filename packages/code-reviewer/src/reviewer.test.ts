import { describe, expect, it, vi } from "vitest";

import { ReviewInfrastructureError } from "./errors.js";
import { reviewPullRequest, type GenerateDecision } from "./reviewer.js";

const input = {
  title: "fix: safe change",
  body: "",
  diff: "+export const answer = 42;",
};

function response(overrides: Partial<Awaited<ReturnType<GenerateDecision>>> = {}) {
  return {
    decision: { verdict: "pass" as const, summary: "Zmiana jest bezpieczna.", findings: [] },
    inputTokens: 100,
    outputTokens: 20,
    totalTokens: 120,
    reportedCostUsd: 0.001,
    ...overrides,
  };
}

describe("reviewPullRequest", () => {
  it("wykonuje dokładnie jedno wywołanie i dokleja telemetrię", async () => {
    const generateDecision = vi.fn<GenerateDecision>().mockResolvedValue(response());
    const times = [1_000, 1_250];

    const result = await reviewPullRequest(input, {
      generateDecision,
      now: () => times.shift() ?? 1_250,
    });

    expect(generateDecision).toHaveBeenCalledTimes(1);
    expect(result.verdict).toBe("pass");
    expect(result.durationMs).toBe(250);
    expect(result.usage.totalCostUsd).toBe(0.001);
  });

  it("odrzuca koszt zgłoszony ponad twardy budżet", async () => {
    const generateDecision = vi.fn<GenerateDecision>().mockResolvedValue(response({ reportedCostUsd: 0.21 }));

    await expect(reviewPullRequest(input, { generateDecision })).rejects.toMatchObject({
      code: "BUDGET_EXCEEDED",
    });
  });

  it("blokuje input, którego escaped prompt przekroczyłby budżet", async () => {
    const generateDecision = vi.fn<GenerateDecision>().mockResolvedValue(response());

    await expect(
      reviewPullRequest({ ...input, diff: "\u0000".repeat(40_000) }, { generateDecision }),
    ).rejects.toMatchObject({ code: "BUDGET_EXCEEDED" });
    expect(generateDecision).not.toHaveBeenCalled();
  });

  it("mapuje błąd providera na błąd infrastruktury", async () => {
    const generateDecision = vi.fn<GenerateDecision>().mockRejectedValue(new Error("secret payload"));

    await expect(reviewPullRequest(input, { generateDecision })).rejects.toBeInstanceOf(ReviewInfrastructureError);
    await expect(reviewPullRequest(input, { generateDecision })).rejects.toMatchObject({
      code: "PROVIDER_ERROR",
      message: "OpenRouter nie zwrócił poprawnej odpowiedzi review.",
    });
  });

  it("odróżnia niezgodny output modelu od błędu wejścia", async () => {
    const generateDecision = vi.fn<GenerateDecision>().mockResolvedValue(
      response({
        decision: { verdict: "pass", summary: "", findings: [] },
      }),
    );

    await expect(reviewPullRequest(input, { generateDecision })).rejects.toMatchObject({
      code: "SCHEMA_ERROR",
      message: "Model nie zwrócił wyniku zgodnego ze schematem review.",
    });
  });
});
