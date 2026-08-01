import { z } from "zod";

import { getEvalCase } from "./fixtures.js";
import { runOfflineOracle } from "./offline-oracle.js";
import { reviewPullRequest } from "../reviewer.js";
import { toReviewError } from "../errors.js";
import type { ReviewResult } from "../schemas.js";

interface ProviderOptions {
  id?: string;
  config?: unknown;
}

interface ProviderResponse {
  output: string;
}

export const PromptfooProviderConfigSchema = z.object({
  mode: z.enum(["offline", "live"]).default("offline"),
  model: z.string().trim().min(1).optional(),
});

export type PromptfooProviderConfig = z.infer<typeof PromptfooProviderConfigSchema>;

type ReviewRunner = (input: unknown, options: { model: string }) => Promise<ReviewResult>;

export default class CodeReviewerEvalProvider {
  private readonly providerId: string;
  private readonly config: PromptfooProviderConfig;
  private readonly review: ReviewRunner;

  constructor(options: ProviderOptions = {}, review: ReviewRunner = reviewPullRequest) {
    this.providerId = options.id ?? "code-reviewer-eval";
    this.config = PromptfooProviderConfigSchema.parse(options.config ?? {});
    this.review = review;
  }

  id(): string {
    return this.providerId;
  }

  async callApi(caseId: string): Promise<ProviderResponse> {
    const evalCase = getEvalCase(caseId.trim());

    if (this.config.mode === "live") {
      if (process.env.PROMPTFOO_LIVE !== "1" || process.env.PROMPTFOO_LIVE_OPT_IN !== "1") {
        throw new Error("Live matrix requires the eval:matrix command and explicit PROMPTFOO_LIVE_OPT_IN=1.");
      }
      if (!this.config.model) {
        throw new Error("Live matrix provider requires an explicit OpenRouter model id.");
      }
      try {
        return { output: JSON.stringify(await this.review(evalCase.input, { model: this.config.model })) };
      } catch (error) {
        return { output: JSON.stringify(toReviewError(error)) };
      }
    }

    return { output: JSON.stringify(runOfflineOracle(evalCase.input)) };
  }
}
