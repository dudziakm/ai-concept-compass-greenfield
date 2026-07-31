import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText, NoObjectGeneratedError, NoOutputGeneratedError, Output } from "ai";
import { z } from "zod";

import { ReviewInfrastructureError } from "./errors.js";
import { buildReviewPrompt, SYSTEM_PROMPT } from "./prompts.js";
import {
  canonicalizeDecision,
  MAX_REVIEW_COST_USD,
  MAX_REVIEW_DURATION_MS,
  ReviewDecisionSchema,
  ReviewInputSchema,
  ReviewResultSchema,
  type ReviewDecision,
  type ReviewInput,
  type ReviewResult,
} from "./schemas.js";

const DEFAULT_MODEL = "openai/gpt-4o-mini";
const MAX_OUTPUT_TOKENS = 1_800;
const MAX_PROMPT_PRICE_PER_MILLION = 1;
const MAX_COMPLETION_PRICE_PER_MILLION = 5;

const OpenRouterMetadataSchema = z.object({
  openrouter: z.object({
    usage: z.object({
      cost: z.number().nonnegative().optional(),
    }),
  }),
});

export interface ModelReviewResponse {
  decision: ReviewDecision;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  reportedCostUsd?: number;
}

export type GenerateDecision = (options: {
  input: ReviewInput;
  model: string;
  apiKey: string;
  signal: AbortSignal;
}) => Promise<ModelReviewResponse>;

export interface ReviewerOptions {
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
  maxCostUsd?: number;
  generateDecision?: GenerateDecision;
  now?: () => number;
}

function estimateMaximumCost(input: ReviewInput): number {
  // 1 znak = 1 token to świadomie konserwatywna granica ponad typową tokenizacją.
  // Liczymy już po JSON.stringify, aby uwzględnić znaki wymagające sekwencji escape.
  const maximumInputTokens = SYSTEM_PROMPT.length + buildReviewPrompt(input).length + 1_024;

  return (
    (maximumInputTokens * MAX_PROMPT_PRICE_PER_MILLION + MAX_OUTPUT_TOKENS * MAX_COMPLETION_PRICE_PER_MILLION) /
    1_000_000
  );
}

function estimateActualCost(inputTokens: number, outputTokens: number): number {
  return (inputTokens * MAX_PROMPT_PRICE_PER_MILLION + outputTokens * MAX_COMPLETION_PRICE_PER_MILLION) / 1_000_000;
}

export const generateOpenRouterDecision: GenerateDecision = async ({ input, model, apiKey, signal }) => {
  const openrouter = createOpenRouter({ apiKey });

  // Jedno generateText, bez tools i bez retry: dokładnie jedno wywołanie modelu.
  const result = await generateText({
    model: openrouter(model),
    system: SYSTEM_PROMPT,
    prompt: buildReviewPrompt(input),
    output: Output.object({
      schema: ReviewDecisionSchema,
      name: "code_review_decision",
      description: "Ustrukturyzowany werdykt code review według sześciu wymiarów DoD.",
    }),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    temperature: 0,
    maxRetries: 0,
    abortSignal: signal,
    providerOptions: {
      openrouter: {
        usage: { include: true },
        provider: {
          data_collection: "deny",
          zdr: true,
          require_parameters: true,
          sort: "price",
          max_price: {
            prompt: MAX_PROMPT_PRICE_PER_MILLION,
            completion: MAX_COMPLETION_PRICE_PER_MILLION,
            request: 0,
          },
        },
      },
    },
  });

  const metadata = OpenRouterMetadataSchema.safeParse(result.finalStep.providerMetadata);

  return {
    decision: result.output,
    inputTokens: result.usage.inputTokens ?? 0,
    outputTokens: result.usage.outputTokens ?? 0,
    totalTokens: result.usage.totalTokens ?? 0,
    ...(metadata.success && metadata.data.openrouter.usage.cost !== undefined
      ? { reportedCostUsd: metadata.data.openrouter.usage.cost }
      : {}),
  };
};

export async function reviewPullRequest(rawInput: unknown, options: ReviewerOptions = {}): Promise<ReviewResult> {
  const input = ReviewInputSchema.parse(rawInput);
  const apiKey = options.apiKey ?? process.env.OPENROUTER_API_KEY;
  const model = options.model ?? process.env.AI_REVIEW_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = Math.min(options.timeoutMs ?? MAX_REVIEW_DURATION_MS, MAX_REVIEW_DURATION_MS);
  const maxCostUsd = Math.min(options.maxCostUsd ?? MAX_REVIEW_COST_USD, MAX_REVIEW_COST_USD);
  const generateDecision = options.generateDecision ?? generateOpenRouterDecision;
  const now = options.now ?? Date.now;

  if (!apiKey && generateDecision === generateOpenRouterDecision) {
    throw new ReviewInfrastructureError("MISSING_API_KEY", "Brakuje zmiennej OPENROUTER_API_KEY.");
  }

  const maximumCostUsd = estimateMaximumCost(input);
  if (maximumCostUsd > maxCostUsd) {
    throw new ReviewInfrastructureError(
      "BUDGET_EXCEEDED",
      `Konserwatywny koszt maksymalny ${maximumCostUsd.toFixed(4)} USD przekracza budżet ${maxCostUsd.toFixed(2)} USD.`,
    );
  }

  const startedAt = now();
  const signal = AbortSignal.timeout(timeoutMs);
  let response: ModelReviewResponse;

  try {
    response = await generateDecision({ input, model, apiKey: apiKey ?? "test-key", signal });
  } catch (error) {
    if (signal.aborted) {
      throw new ReviewInfrastructureError("TIMEOUT", `Reviewer przekroczył limit ${timeoutMs} ms.`, { cause: error });
    }
    if (
      NoOutputGeneratedError.isInstance(error) ||
      NoObjectGeneratedError.isInstance(error) ||
      error instanceof z.ZodError
    ) {
      throw new ReviewInfrastructureError("SCHEMA_ERROR", "Model nie zwrócił wyniku zgodnego ze schematem review.", {
        cause: error,
      });
    }
    throw new ReviewInfrastructureError("PROVIDER_ERROR", "OpenRouter nie zwrócił poprawnej odpowiedzi review.", {
      cause: error,
    });
  }

  const durationMs = now() - startedAt;
  if (durationMs > timeoutMs) {
    throw new ReviewInfrastructureError("TIMEOUT", `Reviewer przekroczył limit ${timeoutMs} ms.`);
  }
  const totalCostUsd = response.reportedCostUsd ?? estimateActualCost(response.inputTokens, response.outputTokens);

  if (totalCostUsd > maxCostUsd) {
    throw new ReviewInfrastructureError(
      "BUDGET_EXCEEDED",
      `Koszt review ${totalCostUsd.toFixed(4)} USD przekroczył budżet ${maxCostUsd.toFixed(2)} USD.`,
    );
  }

  const parsedDecision = ReviewDecisionSchema.safeParse(response.decision);
  if (!parsedDecision.success) {
    throw new ReviewInfrastructureError("SCHEMA_ERROR", "Model nie zwrócił wyniku zgodnego ze schematem review.", {
      cause: parsedDecision.error,
    });
  }
  const decision = canonicalizeDecision(parsedDecision.data);

  const result = ReviewResultSchema.safeParse({
    ...decision,
    usage: {
      provider: "openrouter",
      model,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      totalTokens: response.totalTokens,
      totalCostUsd,
    },
    durationMs,
  });
  if (!result.success) {
    throw new ReviewInfrastructureError("SCHEMA_ERROR", "Telemetria review nie jest zgodna ze schematem.", {
      cause: result.error,
    });
  }
  return result.data;
}
