import type { ConceptWithProgress, ReviewAttempt, ReviewOutcome } from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;

export const OUTCOME_SCORES: Record<ReviewOutcome, number> = {
  incorrect: 0,
  partial: 50,
  correct: 100,
};

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function confidenceScore(confidence: number) {
  return clamp((confidence - 1) * 25);
}

export function calculateMastery(previousMastery: number | null, outcome: ReviewOutcome) {
  const outcomeScore = OUTCOME_SCORES[outcome];
  if (previousMastery === null) return outcomeScore;
  return Math.round(clamp(0.6 * previousMastery + 0.4 * outcomeScore) * 100) / 100;
}

export function calculateOverconfidence(confidence: number, outcome: ReviewOutcome) {
  return Math.max(0, confidenceScore(confidence) - OUTCOME_SCORES[outcome]);
}

export function calculateNextReviewAt(outcome: ReviewOutcome, previousOutcome: ReviewOutcome | null, now: Date) {
  const days = outcome === "incorrect" ? 1 : outcome === "partial" ? 3 : previousOutcome === "correct" ? 14 : 7;
  return new Date(now.getTime() + days * DAY_MS);
}

export function calculatePriority(mastery: number, overconfidence: number, nextReviewAt: Date, now: Date) {
  const overdueDays = Math.max(0, Math.floor((now.getTime() - nextReviewAt.getTime()) / DAY_MS));
  const overduePoints = Math.min(20, overdueDays);
  return Math.round(clamp((100 - mastery) * 0.7 + overconfidence * 0.3 + overduePoints) * 100) / 100;
}

export function scoreReview(input: {
  confidence: number;
  outcome: ReviewOutcome;
  previousAttempt: Pick<ReviewAttempt, "mastery" | "outcome"> | null;
  now: Date;
}) {
  const mastery = calculateMastery(input.previousAttempt?.mastery ?? null, input.outcome);
  const calibrationGap = calculateOverconfidence(input.confidence, input.outcome);
  const nextReviewAt = calculateNextReviewAt(input.outcome, input.previousAttempt?.outcome ?? null, input.now);
  const priority = calculatePriority(mastery, calibrationGap, nextReviewAt, input.now);

  return { mastery, calibrationGap, nextReviewAt, priority };
}

export function selectRecommendedConcept(concepts: ConceptWithProgress[]): ConceptWithProgress | null {
  return (
    [...concepts].sort((left, right) => {
      if (left.isDue !== right.isDue) return left.isDue ? -1 : 1;
      if (left.currentPriority !== right.currentPriority) return right.currentPriority - left.currentPriority;

      const leftTime = left.latestAttempt ? Date.parse(left.latestAttempt.reviewed_at) : 0;
      const rightTime = right.latestAttempt ? Date.parse(right.latestAttempt.reviewed_at) : 0;
      return leftTime - rightTime;
    })[0] ?? null
  );
}
