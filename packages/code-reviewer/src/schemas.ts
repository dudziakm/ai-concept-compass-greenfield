import { z } from "zod";

export const MAX_INPUT_CHARS = 50_000;
export const MAX_REVIEW_COST_USD = 0.2;
export const MAX_REVIEW_DURATION_MS = 60_000;
export const MINIMUM_PASS_SCORE = 7;

export const REVIEW_DIMENSIONS = [
  "correctness",
  "idiomaticity",
  "complexity",
  "test-risk-coverage",
  "documentation",
  "security-safety",
] as const;

export const ReviewDimensionSchema = z.enum(REVIEW_DIMENSIONS);
export const ReviewScoreSchema = z.number().int().min(1).max(10);
export const ReviewScoresSchema = z
  .object({
    correctness: ReviewScoreSchema,
    idiomaticity: ReviewScoreSchema,
    complexity: ReviewScoreSchema,
    "test-risk-coverage": ReviewScoreSchema,
    documentation: ReviewScoreSchema,
    "security-safety": ReviewScoreSchema,
  })
  .strict();

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
  scores: ReviewScoresSchema,
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
      "INPUT_TOO_LARGE",
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
export type ReviewScores = z.infer<typeof ReviewScoresSchema>;
export type FindingSeverity = z.infer<typeof FindingSeveritySchema>;
export type ReviewFinding = z.infer<typeof ReviewFindingSchema>;
export type ReviewDecision = z.infer<typeof ReviewDecisionSchema>;
export type ReviewInput = z.infer<typeof ReviewInputSchema>;
export type ReviewUsage = z.infer<typeof ReviewUsageSchema>;
export type ReviewResult = z.infer<typeof ReviewResultSchema>;
export type ReviewError = z.infer<typeof ReviewErrorSchema>;

interface ChangedDiffLine {
  file: string;
  line: number;
}

function changedLines(diff: string): ChangedDiffLine[] {
  const locations: ChangedDiffLine[] = [];
  let currentFile: string | undefined;
  let currentNewLine: number | undefined;

  for (const line of diff.split("\n")) {
    const file = line.match(/^diff --git a\/.+ b\/(.+)$/);
    if (file) {
      currentFile = file[1];
      currentNewLine = undefined;
      continue;
    }

    const hunk = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
    if (hunk && currentFile) {
      currentNewLine = Number(hunk[1]);
      continue;
    }

    if (!currentFile || currentNewLine === undefined) continue;
    if (line.startsWith("+") && !line.startsWith("+++")) {
      locations.push({ file: currentFile, line: currentNewLine });
      currentNewLine += 1;
    } else if (line.startsWith(" ")) {
      currentNewLine += 1;
    }
  }

  return locations;
}

function isGroundedInDiff(finding: ReviewFinding, locations: ChangedDiffLine[]): boolean {
  return finding.line !== null && locations.some((location) => location.file === finding.file && finding.line === location.line);
}

export function canonicalizeDecision(decision: ReviewDecision, diff: string): ReviewDecision {
  const findings = decision.findings.filter((finding) => isGroundedInDiff(finding, changedLines(diff)));
  const hasBlockingFinding = findings.some((finding) =>
    ["critical", "high", "medium"].includes(finding.severity),
  );

  return {
    ...decision,
    findings,
    verdict: hasBlockingFinding ? "fail" : "pass",
  };
}
