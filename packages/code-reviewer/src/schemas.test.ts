import { describe, expect, it } from "vitest";

import {
  canonicalizeDecision,
  MAX_INPUT_CHARS,
  MINIMUM_PASS_SCORE,
  REVIEW_DIMENSIONS,
  ReviewDecisionSchema,
  ReviewInputSchema,
  ReviewResultSchema,
  type ReviewScores,
} from "./schemas.js";

const passingScores: ReviewScores = {
  correctness: 8,
  idiomaticity: 8,
  complexity: 8,
  "test-risk-coverage": 8,
  documentation: 8,
  "security-safety": 8,
};

const changedLineDiff = `diff --git a/src/api.ts b/src/api.ts
--- a/src/api.ts
+++ b/src/api.ts
@@ -8,2 +8,3 @@
 export const existing = true;
+export const reviewed = true;`;

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
  it("wymaga dokładnie jednej poprawnej oceny dla każdego wymiaru", () => {
    const complete = { ...passingScores };
    const incomplete = Object.fromEntries(
      Object.entries(passingScores).filter(([dimension]) => dimension !== "documentation"),
    );

    expect(Object.keys(complete)).toEqual(REVIEW_DIMENSIONS);
    expect(
      ReviewDecisionSchema.safeParse({
        verdict: "pass",
        summary: "Komplet ocen.",
        scores: complete,
        findings: [],
      }).success,
    ).toBe(true);
    expect(
      ReviewDecisionSchema.safeParse({
        verdict: "pass",
        summary: "Brakuje oceny.",
        scores: incomplete,
        findings: [],
      }).success,
    ).toBe(false);
    expect(
      ReviewDecisionSchema.safeParse({
        verdict: "pass",
        summary: "Dodatkowa ocena.",
        scores: { ...passingScores, maintainability: 8 },
        findings: [],
      }).success,
    ).toBe(false);
  });

  it("odrzuca ocenę poza skalą 1–10 lub niecałkowitą", () => {
    for (const invalidScore of [0, 10.1, 11]) {
      expect(
        ReviewDecisionSchema.safeParse({
          verdict: "pass",
          summary: "Niedozwolona ocena.",
          scores: { ...passingScores, correctness: invalidScore },
          findings: [],
        }).success,
      ).toBe(false);
    }
  });

  it("nie pozwala, aby nieuzasadniony niski score blokował merge", () => {
    expect(
      canonicalizeDecision(
        {
          verdict: "pass",
          summary: "Ocena correctness jest za niska.",
          scores: { ...passingScores, correctness: MINIMUM_PASS_SCORE - 1 },
          findings: [],
        },
        changedLineDiff,
      ).verdict,
    ).toBe("pass");
  });

  it("pozostawia pass dla ocen dokładnie na progu i tylko low findingu", () => {
    expect(
      canonicalizeDecision(
        {
          verdict: "pass",
          summary: "Nieblokująca sugestia.",
          scores: {
            correctness: MINIMUM_PASS_SCORE,
            idiomaticity: MINIMUM_PASS_SCORE,
            complexity: MINIMUM_PASS_SCORE,
            "test-risk-coverage": MINIMUM_PASS_SCORE,
            documentation: MINIMUM_PASS_SCORE,
            "security-safety": MINIMUM_PASS_SCORE,
          },
          findings: [
            {
              severity: "low",
              dimension: "idiomaticity",
              file: "src/lib/example.ts",
              line: 5,
              evidence: "Nazwa może być krótsza.",
              recommendation: "Rozważ zwięźlejszą nazwę.",
            },
          ],
        },
        changedLineDiff,
      ).verdict,
    ).toBe("pass");
  });

  it("zmienia pass na fail przy medium findingu", () => {
    expect(
      canonicalizeDecision(
        {
          verdict: "pass",
          summary: "Model przeoczył blokujący finding.",
          scores: passingScores,
          findings: [
            {
              severity: "medium",
              dimension: "documentation",
              file: "src/api.ts",
              line: 9,
              evidence: "Brak kontraktu.",
              recommendation: "Dodaj kontrakt.",
            },
          ],
        },
        changedLineDiff,
      ).verdict,
    ).toBe("fail");
  });

  it("odrzuca blokujący finding poza diffem", () => {
    const decision = canonicalizeDecision(
      {
        verdict: "fail",
        summary: "Nieistniejący problem.",
        scores: { ...passingScores, correctness: 1 },
        findings: [
          {
            severity: "high",
            dimension: "correctness",
            file: "src/lib/scoring.ts",
            line: 42,
            evidence: "Rzekomy problem poza diffem.",
            recommendation: "Niepotrzebna zmiana.",
          },
        ],
      },
      changedLineDiff,
    );

    expect(decision).toMatchObject({ verdict: "pass", findings: [] });
  });

  it("odrzuca finding bez linii dodanej lub zmienionej w diffie", () => {
    const decision = canonicalizeDecision(
      {
        verdict: "fail",
        summary: "Problem w kontekście.",
        scores: passingScores,
        findings: [
          {
            severity: "medium",
            dimension: "correctness",
            file: "src/api.ts",
            line: 8,
            evidence: "Ta linia jest tylko kontekstem diffu.",
            recommendation: "Nie blokuj zmiany na podstawie niezmienionej linii.",
          },
        ],
      },
      changedLineDiff,
    );

    expect(decision).toMatchObject({ verdict: "pass", findings: [] });
  });

  it("schema wyniku pilnuje kosztu 0.20 USD", () => {
    const result = {
      verdict: "pass",
      summary: "OK",
      scores: passingScores,
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
