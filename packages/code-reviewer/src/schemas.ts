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
  droppedFindings: z.array(ReviewFindingSchema).max(20).default([]),
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

const DIFF_FILE_HEADER = /^diff --git a\/.+ b\/(.+)$/;
const DIFF_HUNK_HEADER = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/;

/** Tolerance for a model that miscounts new-side line numbers across a wide hunk. */
const GROUNDING_TOLERANCE_LINES = 1;

const BLOCKING_SEVERITIES: readonly FindingSeverity[] = ["critical", "high", "medium"];

/** Inclusive new-side line range that one hunk covers. */
interface DiffRange {
  start: number;
  end: number;
}

/**
 * Maps a unified diff to the new-side line ranges each file's hunks cover.
 *
 * Ranges rather than added lines only. A finding about code a hunk *removes* has no added
 * line to point at, so an added-lines-only index makes the most dangerous class of change —
 * a deleted authorization check, RLS policy or test — structurally unreportable. A file that
 * appears in the diff with no parsable hunk is still registered, so file-level findings
 * (`line: null`, which the finding schema permits) stay groundable.
 *
 * @param diff Unified diff as produced by `git diff`.
 * @returns New-side hunk ranges keyed by the diff's b-side path.
 */
function diffRanges(diff: string): Map<string, DiffRange[]> {
  const ranges = new Map<string, DiffRange[]>();
  let currentFile: string | undefined;

  for (const line of diff.split("\n")) {
    const header = DIFF_FILE_HEADER.exec(line);
    const headerFile = header?.[1];
    if (headerFile !== undefined) {
      currentFile = headerFile;
      if (!ranges.has(headerFile)) ranges.set(headerFile, []);
      continue;
    }

    if (currentFile === undefined) continue;

    const hunk = DIFF_HUNK_HEADER.exec(line);
    const hunkStart = hunk?.[1];
    if (hunkStart === undefined) continue;

    const start = Number(hunkStart);
    // A pure-deletion hunk reports new-side length 0; treat it as covering the single
    // position the removed code used to occupy.
    const rawLength = hunk?.[2];
    const length = rawLength === undefined ? 1 : Math.max(Number(rawLength), 1);
    ranges.get(currentFile)?.push({ start, end: start + length - 1 });
  }

  return ranges;
}

function isGrounded(finding: ReviewFinding, ranges: Map<string, DiffRange[]>): boolean {
  const fileRanges = ranges.get(finding.file);
  if (fileRanges === undefined) return false;

  const line = finding.line;
  if (line === null) return true;

  return fileRanges.some(
    (range) => line >= range.start - GROUNDING_TOLERANCE_LINES && line <= range.end + GROUNDING_TOLERANCE_LINES,
  );
}

/** A canonicalized decision plus the findings that were withheld from it. */
export interface CanonicalDecision {
  decision: ReviewDecision;
  /** Findings the model reported for code the reviewed diff does not contain. */
  droppedFindings: ReviewFinding[];
}

/**
 * Applies the local Definition of Done to a model decision.
 *
 * Findings that cannot be located in the reviewed diff are withheld rather than allowed to
 * block a merge — that was the reviewer's dominant false-positive source. They are returned
 * separately so the suppression is auditable instead of silent. The verdict follows the
 * surviving findings alone; the six scores are telemetry and do not gate.
 *
 * @param decision Schema-valid decision as returned by the model.
 * @param diff The exact diff the model was asked to review.
 */
export function canonicalizeDecision(decision: ReviewDecision, diff: string): CanonicalDecision {
  const ranges = diffRanges(diff);

  // Fail closed. A truncated, empty or unparsable diff yields no ranges, and silently
  // erasing every finding would turn an unreviewable input into a green verdict.
  const findings: ReviewFinding[] = [];
  const droppedFindings: ReviewFinding[] = [];
  for (const finding of decision.findings) {
    if (ranges.size === 0 || isGrounded(finding, ranges)) {
      findings.push(finding);
    } else {
      droppedFindings.push(finding);
    }
  }

  const hasBlockingFinding = findings.some((finding) => BLOCKING_SEVERITIES.includes(finding.severity));

  return {
    decision: { ...decision, findings, verdict: hasBlockingFinding ? "fail" : "pass" },
    droppedFindings,
  };
}
