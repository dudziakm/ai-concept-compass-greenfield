import { describe, expect, it } from "vitest";

import {
  canonicalizeDecision,
  MAX_INPUT_CHARS,
  MINIMUM_PASS_SCORE,
  REVIEW_DIMENSIONS,
  ReviewDecisionSchema,
  ReviewInputSchema,
  ReviewResultSchema,
  type ReviewDecision,
  type ReviewFinding,
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

// Nowy-side range dla src/api.ts to [8, 10] (start=8, length=3), rozszerzony tolerancją o 1 do [7, 11].
const changedLineDiff = `diff --git a/src/api.ts b/src/api.ts
--- a/src/api.ts
+++ b/src/api.ts
@@ -8,2 +8,3 @@
 export const existing = true;
+export const reviewed = true;`;

function buildFinding(overrides: Pick<ReviewFinding, "file" | "line"> & Partial<ReviewFinding>): ReviewFinding {
  return {
    severity: "medium",
    dimension: "correctness",
    evidence: "Opis problemu na potrzeby testu.",
    recommendation: "Rekomendacja naprawy na potrzeby testu.",
    ...overrides,
  };
}

function buildDecision(findings: ReviewFinding[], overrides: Partial<ReviewDecision> = {}): ReviewDecision {
  return {
    verdict: "pass",
    summary: "Testowa decyzja modelu.",
    scores: passingScores,
    findings,
    ...overrides,
  };
}

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
      ).decision.verdict,
    ).toBe("pass");
  });

  it("pozostawia pass dla ocen dokładnie na progu i tylko low findingu ugruntowanego w diffie", () => {
    const finding = buildFinding({
      severity: "low",
      dimension: "idiomaticity",
      file: "src/api.ts",
      line: 9,
      evidence: "Nazwa może być krótsza.",
      recommendation: "Rozważ zwięźlejszą nazwę.",
    });

    const result = canonicalizeDecision(
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
        findings: [finding],
      },
      changedLineDiff,
    );

    expect(result.decision.findings).toEqual([finding]);
    expect(result.droppedFindings).toEqual([]);
    expect(result.decision.verdict).toBe("pass");
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
      ).decision.verdict,
    ).toBe("fail");
  });

  it("odrzuca blokujący finding poza diffem i umieszcza go w droppedFindings", () => {
    const finding = buildFinding({
      severity: "high",
      file: "src/lib/scoring.ts",
      line: 42,
      evidence: "Rzekomy problem poza diffem.",
      recommendation: "Niepotrzebna zmiana.",
    });

    const result = canonicalizeDecision(
      {
        verdict: "fail",
        summary: "Nieistniejący problem.",
        scores: { ...passingScores, correctness: 1 },
        findings: [finding],
      },
      changedLineDiff,
    );

    expect(result.decision).toMatchObject({ verdict: "pass", findings: [] });
    expect(result.droppedFindings).toEqual([finding]);
  });

  it("zachowuje finding na niezmienionej linii kontekstu, jeśli mieści się w zakresie hunka (grunt po zakresie, nie po dodanej linii)", () => {
    const finding = buildFinding({
      severity: "medium",
      file: "src/api.ts",
      line: 8,
      evidence: "Ta linia jest kontekstem diffu, ale mieści się w zakresie hunka.",
      recommendation: "Nie ignoruj niezmienionej linii, jeśli hunk ją obejmuje.",
    });

    const result = canonicalizeDecision(
      {
        verdict: "fail",
        summary: "Problem w kontekście objętym zakresem hunka.",
        scores: passingScores,
        findings: [finding],
      },
      changedLineDiff,
    );

    expect(result.decision.findings).toEqual([finding]);
    expect(result.droppedFindings).toEqual([]);
    expect(result.decision.verdict).toBe("fail");
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

describe("canonicalizeDecision — grunt po zakresach diffu, nie po dodanych liniach", () => {
  const pureDeletionDiff = `diff --git a/src/service.ts b/src/service.ts
--- a/src/service.ts
+++ b/src/service.ts
@@ -7,3 +6,0 @@
-export function oldHelper() {}
-export function anotherOldHelper() {}
-export function moreOldStuff() {}`;

  const headerOnlyDiff = `diff --git a/src/renamed.ts b/src/renamed.ts
old mode 100644
new mode 100755`;

  // "+++counter;" to linia dodana o treści zaczynającej się od "++" (pre-inkrementacja), która
  // w reprezentacji diffu zaczyna się od "+++" — dokładnie tego wzorca, który stary parser mylił
  // z pseudo-nagłówkiem "+++ b/plik" i pomijał bez inkrementowania licznika linii.
  const hunkWithPlusPlusLineDiff = `diff --git a/src/util.ts b/src/util.ts
--- a/src/util.ts
+++ b/src/util.ts
@@ -1,2 +1,5 @@
 export const base = 1;
+++counter;
+export const middle = 2;
+export const target = 3;
+export const tail = 4;`;

  it("gruntuje finding na linii usuniętej przez czysto usuwający hunk i może dać fail", () => {
    const finding = buildFinding({
      severity: "high",
      file: "src/service.ts",
      line: 6,
      evidence: "Usunięto funkcję, z której wciąż korzysta inny moduł.",
      recommendation: "Zaktualizuj lub przywróć usuniętą funkcję.",
    });

    const result = canonicalizeDecision(buildDecision([finding]), pureDeletionDiff);

    expect(result.decision.findings).toEqual([finding]);
    expect(result.droppedFindings).toEqual([]);
    expect(result.decision.verdict).toBe("fail");
  });

  it.each([
    { label: "plik z sparsowanym hunkiem", diff: changedLineDiff, file: "src/api.ts" },
    { label: "plik obecny w diffie bez możliwego do sparsowania hunka", diff: headerOnlyDiff, file: "src/renamed.ts" },
  ])("gruntuje finding z line: null — $label", ({ diff, file }) => {
    const finding = buildFinding({ severity: "critical", file, line: null });

    const result = canonicalizeDecision(buildDecision([finding]), diff);

    expect(result.decision.findings).toEqual([finding]);
    expect(result.droppedFindings).toEqual([]);
    expect(result.decision.verdict).toBe("fail");
  });

  it("diff bez rozpoznawalnego nagłówka nie odrzuca żadnego findingu (fail closed)", () => {
    const findings = [
      buildFinding({ severity: "low", file: "src/anything.ts", line: 1 }),
      buildFinding({ severity: "critical", file: "src/elsewhere.ts", line: 999 }),
    ];

    const result = canonicalizeDecision(buildDecision(findings), "+export const answer = 42;");

    expect(result.decision.findings).toEqual(findings);
    expect(result.droppedFindings).toEqual([]);
    expect(result.decision.verdict).toBe("fail");
  });

  it.each([
    { line: 7, expectGrounded: true },
    { line: 11, expectGrounded: true },
    { line: 6, expectGrounded: false },
    { line: 12, expectGrounded: false },
  ])("linia $line względem zakresu 8–10 (±1) gruntuje: $expectGrounded", ({ line, expectGrounded }) => {
    const finding = buildFinding({ severity: "high", file: "src/api.ts", line });

    const result = canonicalizeDecision(buildDecision([finding]), changedLineDiff);

    if (expectGrounded) {
      expect(result.decision.findings).toEqual([finding]);
      expect(result.droppedFindings).toEqual([]);
      expect(result.decision.verdict).toBe("fail");
    } else {
      expect(result.decision.findings).toEqual([]);
      expect(result.droppedFindings).toEqual([finding]);
      expect(result.decision.verdict).toBe("pass");
    }
  });

  it("linia zaczynająca się od +++ w treści hunka nie psuje groundingu kolejnych linii w tym hunku", () => {
    const finding = buildFinding({ severity: "critical", file: "src/util.ts", line: 5 });

    const result = canonicalizeDecision(buildDecision([finding]), hunkWithPlusPlusLineDiff);

    expect(result.decision.findings).toEqual([finding]);
    expect(result.droppedFindings).toEqual([]);
    expect(result.decision.verdict).toBe("fail");
  });
});
