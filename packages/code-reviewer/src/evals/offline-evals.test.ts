import { describe, expect, it } from "vitest";

import { ReviewDecisionSchema, ReviewErrorSchema } from "../schemas.js";
import { EVAL_CASES } from "./fixtures.js";
import { runOfflineOracle } from "./offline-oracle.js";

describe("stały offline eval baseline", () => {
  it.each(EVAL_CASES)("$id — $description", (evalCase) => {
    const output = runOfflineOracle(evalCase.input);

    if (evalCase.expectedErrorCode) {
      const error = ReviewErrorSchema.parse(output);
      expect(error.error.code).toBe(evalCase.expectedErrorCode);
      return;
    }

    const decision = ReviewDecisionSchema.parse(output);
    expect(decision.verdict).toBe(evalCase.expectedVerdict);
    if (evalCase.expectedDimension) {
      expect(decision.findings.some((finding) => finding.dimension === evalCase.expectedDimension)).toBe(true);
    }
  });
});
