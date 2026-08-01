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

  it("akceptuje dokładnie 50 tys. znaków z budżetem title i body", () => {
    const input = {
      title: "t".repeat(300),
      body: "b".repeat(10_000),
      diff: "d".repeat(39_700),
    };
    expect(ReviewInputSchema.safeParse(input).success).toBe(true);
  });

  it("odrzuca 50 001 znaków po wykorzystaniu budżetu title i body", () => {
    const input = {
      title: "t".repeat(300),
      body: "b".repeat(10_000),
      diff: "d".repeat(39_701),
    };
    expect(ReviewInputSchema.safeParse(input).success).toBe(false);
  });

  it("liczy Unicode według JavaScript String.length", () => {
    const atLimit = { title: "t", body: "", diff: `${"💡".repeat(24_999)}a` };
    const overLimit = { title: "t", body: "", diff: `${"💡".repeat(24_999)}aa` };

    expect(atLimit.diff.length + atLimit.title.length).toBe(MAX_INPUT_CHARS);
    expect(ReviewInputSchema.safeParse(atLimit).success).toBe(true);
    expect(overLimit.diff.length + overLimit.title.length).toBe(MAX_INPUT_CHARS + 1);
    expect(ReviewInputSchema.safeParse(overLimit).success).toBe(false);
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
