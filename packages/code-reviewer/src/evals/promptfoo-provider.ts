import { getEvalCase } from "./fixtures.js";
import { runOfflineOracle } from "./offline-oracle.js";
import { reviewPullRequest } from "../reviewer.js";
import { toReviewError } from "../errors.js";

interface ProviderOptions {
  id?: string;
}

interface ProviderResponse {
  output: string;
}

export default class CodeReviewerEvalProvider {
  private readonly providerId: string;

  constructor(options: ProviderOptions) {
    this.providerId = options.id ?? "code-reviewer-eval";
  }

  id(): string {
    return this.providerId;
  }

  async callApi(caseId: string): Promise<ProviderResponse> {
    const evalCase = getEvalCase(caseId.trim());

    if (process.env.PROMPTFOO_LIVE === "1") {
      try {
        return { output: JSON.stringify(await reviewPullRequest(evalCase.input)) };
      } catch (error) {
        return { output: JSON.stringify(toReviewError(error)) };
      }
    }

    return { output: JSON.stringify(runOfflineOracle(evalCase.input)) };
  }
}
