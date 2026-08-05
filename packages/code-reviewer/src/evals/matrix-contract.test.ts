import { describe, expect, it, vi } from "vitest";

import { MAX_INPUT_CHARS, ReviewDecisionSchema, type ReviewResult } from "../schemas.js";
import CodeReviewerEvalProvider from "./promptfoo-provider.js";
import { LIVE_REACT_MIGRATION_CASE } from "./fixtures.js";

const passingResult: ReviewResult = {
  verdict: "pass",
  summary: "Test harness result.",
  scores: {
    correctness: 8,
    idiomaticity: 8,
    complexity: 8,
    "test-risk-coverage": 8,
    documentation: 8,
    "security-safety": 8,
  },
  findings: [],
  droppedFindings: [],
  usage: {
    provider: "openrouter",
    model: "test/model",
    inputTokens: 1,
    outputTokens: 1,
    totalTokens: 2,
    totalCostUsd: 0,
  },
  durationMs: 1,
};

describe("M5L3 live matrix contract", () => {
  it("contains exactly three named React 19 migration flaws below the reviewer budget", () => {
    const fixture = LIVE_REACT_MIGRATION_CASE;
    const inputSize = fixture.input.title.length + fixture.input.body.length + fixture.input.diff.length;

    expect(fixture.expectedFlawIds).toEqual(["reactdom-render", "string-ref-this-refs", "legacy-context"]);
    expect([...new Set(fixture.expectedFlawIds)]).toHaveLength(3);
    expect(inputSize).toBeLessThanOrEqual(MAX_INPUT_CHARS);
    expect(fixture.input.diff).toContain("ReactDOM.render");
    expect(fixture.input.diff).toContain('ref="editor"');
    expect(fixture.input.diff).toContain("childContextTypes");
  });

  it("keeps offline evaluation independent from a model call", async () => {
    const review = vi.fn();
    const provider = new CodeReviewerEvalProvider({ config: { mode: "offline" } }, review);

    const response = await provider.callApi("clean");

    expect(review).not.toHaveBeenCalled();
    expect(ReviewDecisionSchema.parse(JSON.parse(response.output)).verdict).toBe("pass");
  });

  it("refuses a live provider before the explicit command opt-in", async () => {
    const review = vi.fn();
    const provider = new CodeReviewerEvalProvider({ config: { mode: "live", model: "z-ai/glm-5.1" } }, review);

    await expect(provider.callApi("clean")).rejects.toThrow("Live matrix requires");
    expect(review).not.toHaveBeenCalled();
  });

  it("passes the model declared in the live provider configuration", async () => {
    const previousLive = process.env.PROMPTFOO_LIVE;
    const previousOptIn = process.env.PROMPTFOO_LIVE_OPT_IN;
    process.env.PROMPTFOO_LIVE = "1";
    process.env.PROMPTFOO_LIVE_OPT_IN = "1";
    const review = vi.fn().mockResolvedValue(passingResult);
    const provider = new CodeReviewerEvalProvider(
      { config: { mode: "live", model: "deepseek/deepseek-v4-flash" } },
      review,
    );

    try {
      await provider.callApi(LIVE_REACT_MIGRATION_CASE.id);
      expect(review).toHaveBeenCalledWith(LIVE_REACT_MIGRATION_CASE.input, {
        model: "deepseek/deepseek-v4-flash",
      });
    } finally {
      if (previousLive === undefined) delete process.env.PROMPTFOO_LIVE;
      else process.env.PROMPTFOO_LIVE = previousLive;
      if (previousOptIn === undefined) delete process.env.PROMPTFOO_LIVE_OPT_IN;
      else process.env.PROMPTFOO_LIVE_OPT_IN = previousOptIn;
    }
  });
});
