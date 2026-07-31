import { describe, expect, it } from "vitest";

import { canonicalizeDecision, MAX_INPUT_CHARS, ReviewInputSchema, ReviewResultSchema } from "./schemas.js";

describe("ReviewInputSchema", () => {
  it("akceptuje prawidłowe wejście", () => {
    expect(ReviewInputSchema.parse({ title: "fix: edge case", body: "", diff: "+return value;" })).toEqual({
      title: "fix: edge case",
      body: "",
      diff: "+return value;",
    });
  });

  it("odrzuca łączny input większy niż 50 tys. znaków", () => {
    const input = { title: "x", body: "", diff: "a".repeat(MAX_INPUT_CHARS) };
    expect(ReviewInputSchema.safeParse(input).success).toBe(false);
  });
});

describe("Definition of Done", () => {
  it("zmienia pass na fail przy medium findingu", () => {
    expect(
      canonicalizeDecision({
        verdict: "pass",
        summary: "Model przeoczył blokujący finding.",
        findings: [
          {
            severity: "medium",
            dimension: "documentation",
            file: "src/api.ts",
            line: 10,
            evidence: "Brak kontraktu.",
            recommendation: "Dodaj kontrakt.",
          },
        ],
      }).verdict,
    ).toBe("fail");
  });

  it("schema wyniku pilnuje kosztu 0.20 USD", () => {
    const result = {
      verdict: "pass",
      summary: "OK",
      findings: [],
      usage: {
        provider: "openrouter",
        model: "test/model",
        inputTokens: 1,
        outputTokens: 1,
        totalTokens: 2,
        totalCostUsd: 0.2001,
      },
      durationMs: 10,
    };
    expect(ReviewResultSchema.safeParse(result).success).toBe(false);
  });
});
