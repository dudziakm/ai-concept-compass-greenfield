import { describe, expect, it } from "vitest";

import { formatErrorComment, formatReviewComment, REVIEW_COMMENT_MARKER } from "./format-comment.js";
import type { ReviewError, ReviewResult } from "./schemas.js";

const result: ReviewResult = {
  verdict: "fail",
  summary: "Brak walidacji wejścia w publicznym endpointcie.",
  scores: {
    correctness: 6,
    idiomaticity: 8,
    complexity: 8,
    "test-risk-coverage": 7,
    documentation: 7,
    "security-safety": 5,
  },
  findings: [
    {
      severity: "high",
      dimension: "security-safety",
      file: "src/pages/api/export.ts",
      line: 42,
      evidence: "Endpoint przyjmuje dane bez walidacji schematem.",
      recommendation: "Zweryfikuj body przez Zod przed użyciem.",
    },
  ],
  usage: {
    provider: "openrouter",
    model: "test/model",
    inputTokens: 12,
    outputTokens: 8,
    totalTokens: 20,
    totalCostUsd: 0.001,
  },
  durationMs: 120,
};

describe("formatReviewComment", () => {
  it("publikuje marker, sześć ocen i dowód findingu bez wejściowego diffu ani sekretu", () => {
    const comment = formatReviewComment(result);

    expect(comment).toContain(REVIEW_COMMENT_MARKER);
    expect(comment).toContain("correctness`: 6/10");
    expect(comment).toContain("security-safety`: 5/10");
    expect(comment).toContain("Dowód: Endpoint przyjmuje dane bez walidacji schematem.");
  });

  it("redaguje surowy diff i sekret z tekstu modelu", () => {
    const comment = formatReviewComment({
      ...result,
      summary: "diff --git a/src/lib/private.ts b/src/lib/private.ts\nnie publikuj tego wejścia",
      findings: [
        {
          severity: "high",
          dimension: "security-safety",
          file: "src/pages/api/export.ts",
          line: 42,
          evidence: "OPENROUTER_API_KEY=nie-publikuj-wartosci",
          recommendation: "Zweryfikuj body przez Zod przed użyciem.",
        },
      ],
    });

    expect(comment).not.toContain("diff --git");
    expect(comment).not.toContain("OPENROUTER_API_KEY=");
    expect(comment).toContain("[zredagowano surowy diff]");
    expect(comment).toContain("Dowód: [zredagowano sekret]");
  });

  it("zachowuje ERROR poza kontraktem findingów i ocen", () => {
    const error: ReviewError = {
      error: { code: "PROVIDER_ERROR", message: "Provider nie odpowiedział." },
    };
    const comment = formatErrorComment(error);

    expect(comment).toContain(REVIEW_COMMENT_MARKER);
    expect(comment).toContain("⚠️ ERROR");
    expect(comment).not.toContain("Oceny DoD");
    expect(comment).not.toContain("Findings");
  });
});
