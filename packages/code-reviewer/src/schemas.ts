import { z } from "zod";

export const MAX_INPUT_CHARS = 50_000;
export const MAX_REVIEW_COST_USD = 0.2;
export const MAX_REVIEW_DURATION_MS = 60_000;

export const ReviewDimensionSchema = z.enum([
  "correctness",
  "idiomaticity",
  "complexity",
  "test-risk-coverage",
  "documentation",
  "security-safety",
]);

export const FindingSeveritySchema = z.enum(["critical", "high", "medium", "low"]);

export const ReviewFindingSchema = z.object({
  severity: FindingSeveritySchema,
  dimension: ReviewDimensionSchema,
  file: z.string().trim().min(1).max(500),
  line: z.number().int().positive().nullable(),
  evidence: z.string().trim().min(1).max(1_500),
  recommendation: z.string().trim().min(1).max(1_500),
});

export const ReviewDecisionSchema = z.object({
  verdict: z.enum(["pass", "fail"]),
  summary: z.string().trim().min(1).max(2_000),
  findings: z.array(ReviewFindingSchema).max(20),
});

const RawReviewInputSchema = z.object({
  title: z.string().trim().min(1).max(300),
  body: z.string().max(10_000).default(""),
  diff: z.string().min(1).max(MAX_INPUT_CHARS),
});

export const ReviewInputSchema = RawReviewInputSchema.superRefine((value, context) => {
  const totalChars = value.title.length + value.body.length + value.diff.length;
  if (totalChars > MAX_INPUT_CHARS) {
    context.addIssue({
      code: "custom",
      message: `Łączny rozmiar title + body + diff nie może przekraczać ${MAX_INPUT_CHARS} znaków.`,
      path: ["diff"],
    });
  }
});

export const ReviewUsageSchema = z.object({
  provider: z.literal("openrouter"),
  model: z.string().min(1),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  totalTokens: z.number().int().nonnegative(),
  totalCostUsd: z.number().nonnegative().max(MAX_REVIEW_COST_USD),
});

export const ReviewResultSchema = ReviewDecisionSchema.extend({
  usage: ReviewUsageSchema,
  durationMs: z.number().int().nonnegative().max(MAX_REVIEW_DURATION_MS),
});

export const ReviewErrorSchema = z.object({
  error: z.object({
    code: z.enum([
      "INVALID_INPUT",
      "MISSING_API_KEY",
      "BUDGET_EXCEEDED",
      "TIMEOUT",
      "PROVIDER_ERROR",
      "SCHEMA_ERROR",
      "IO_ERROR",
    ]),
    message: z.string().min(1).max(500),
  }),
});

export type ReviewDimension = z.infer<typeof ReviewDimensionSchema>;
export type FindingSeverity = z.infer<typeof FindingSeveritySchema>;
export type ReviewFinding = z.infer<typeof ReviewFindingSchema>;
export type ReviewDecision = z.infer<typeof ReviewDecisionSchema>;
export type ReviewInput = z.infer<typeof ReviewInputSchema>;
export type ReviewUsage = z.infer<typeof ReviewUsageSchema>;
export type ReviewResult = z.infer<typeof ReviewResultSchema>;
export type ReviewError = z.infer<typeof ReviewErrorSchema>;

export function canonicalizeDecision(decision: ReviewDecision): ReviewDecision {
  const hasBlockingFinding = decision.findings.some((finding) =>
    ["critical", "high", "medium"].includes(finding.severity),
  );

  return {
    ...decision,
    verdict: decision.verdict === "fail" || hasBlockingFinding ? "fail" : "pass",
  };
}
