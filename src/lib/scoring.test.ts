import { describe, expect, it } from "vitest";
import {
  calculateMastery,
  calculateNextReviewAt,
  calculateOverconfidence,
  calculatePriority,
  confidenceScore,
  OUTCOME_SCORES,
  scoreReview,
  selectRecommendedConcept,
} from "@/lib/scoring";
import type { ConceptWithProgress, ReviewAttempt, ReviewOutcome } from "@/types";

const NOW = new Date("2026-08-04T12:00:00.000Z");
const DAY_MS = 86_400_000;

describe("scoring", () => {
  it.each([
    ["incorrect", 0],
    ["partial", 50],
    ["correct", 100],
  ] satisfies [ReviewOutcome, number][])("maps %s to %i", (outcome, expected) => {
    expect(OUTCOME_SCORES[outcome]).toBe(expected);
  });

  it.each([
    [1, 0],
    [2, 25],
    [3, 50],
    [4, 75],
    [5, 100],
  ])("maps confidence %i to %i", (confidence, expected) => {
    expect(confidenceScore(confidence)).toBe(expected);
  });

  it("uses outcome as mastery for the first attempt", () => {
    expect(calculateMastery(null, "partial")).toBe(50);
  });

  it("uses the 60/40 moving mastery after the first attempt", () => {
    expect(calculateMastery(50, "correct")).toBe(70);
    expect(calculateMastery(70, "incorrect")).toBe(42);
  });

  it("counts only overconfidence, never underconfidence", () => {
    expect(calculateOverconfidence(5, "incorrect")).toBe(100);
    expect(calculateOverconfidence(1, "correct")).toBe(0);
    expect(calculateOverconfidence(4, "partial")).toBe(25);
  });

  it.each([
    ["incorrect", null, 1],
    ["partial", null, 3],
    ["correct", null, 7],
    ["correct", "partial", 7],
    ["correct", "correct", 14],
  ] satisfies [ReviewOutcome, ReviewOutcome | null, number][])(
    "schedules %s after previous %s in %i day(s)",
    (outcome, previousOutcome, expectedDays) => {
      expect(calculateNextReviewAt(outcome, previousOutcome, NOW).getTime()).toBe(
        NOW.getTime() + expectedDays * DAY_MS,
      );
    },
  );

  it("adds overdue points and caps them at 20", () => {
    const dueTenDaysAgo = new Date(NOW.getTime() - 10 * DAY_MS);
    const dueThirtyDaysAgo = new Date(NOW.getTime() - 30 * DAY_MS);
    expect(calculatePriority(50, 0, dueTenDaysAgo, NOW)).toBe(45);
    expect(calculatePriority(50, 0, dueThirtyDaysAgo, NOW)).toBe(55);
  });

  it("clamps priority to the 0-100 range", () => {
    expect(calculatePriority(0, 100, new Date(NOW.getTime() - 30 * DAY_MS), NOW)).toBe(100);
    expect(calculatePriority(100, 0, new Date(NOW.getTime() + DAY_MS), NOW)).toBe(0);
  });

  it("returns all values for a review without reading the system clock", () => {
    expect(
      scoreReview({
        confidence: 5,
        outcome: "partial",
        previousAttempt: { mastery: 50, outcome: "incorrect" },
        now: NOW,
      }),
    ).toEqual({
      mastery: 50,
      calibrationGap: 50,
      nextReviewAt: new Date(NOW.getTime() + 3 * DAY_MS),
      priority: 50,
    });
  });

  it("scores a first attempt without previous history", () => {
    expect(scoreReview({ confidence: 1, outcome: "incorrect", previousAttempt: null, now: NOW })).toEqual({
      mastery: 0,
      calibrationGap: 0,
      nextReviewAt: new Date(NOW.getTime() + DAY_MS),
      priority: 70,
    });
  });
});

describe("recommendation", () => {
  it("chooses due concepts before a higher non-due priority", () => {
    const due = concept("due", 40, true, "2026-08-02T12:00:00.000Z");
    const future = concept("future", 99, false, "2026-08-01T12:00:00.000Z");
    expect(selectRecommendedConcept([future, due])?.id).toBe("due");
    expect(selectRecommendedConcept([due, future])?.id).toBe("due");
  });

  it("uses priority and then oldest attempt as tie-breakers", () => {
    const low = concept("low", 20, true, "2026-07-01T12:00:00.000Z");
    const newest = concept("newest", 80, true, "2026-08-03T12:00:00.000Z");
    const oldest = concept("oldest", 80, true, "2026-08-01T12:00:00.000Z");
    expect(selectRecommendedConcept([low, newest, oldest])?.id).toBe("oldest");
  });

  it("returns null for an empty collection", () => {
    expect(selectRecommendedConcept([])).toBeNull();
  });

  it("treats concepts without history as the oldest tie", () => {
    const reviewed = concept("reviewed", 100, true, "2026-07-01T12:00:00.000Z");
    const fresh = { ...concept("fresh", 100, true, NOW.toISOString()), latestAttempt: null };
    expect(selectRecommendedConcept([reviewed, fresh])?.id).toBe("fresh");
    expect(selectRecommendedConcept([fresh, reviewed])?.id).toBe("fresh");
  });
});

function concept(id: string, currentPriority: number, isDue: boolean, reviewedAt: string): ConceptWithProgress {
  const attempt: ReviewAttempt = {
    id: `${id}-attempt`,
    concept_id: id,
    user_id: "user",
    confidence: 3,
    outcome: "partial",
    mastery: 50,
    calibration_gap: 0,
    priority: currentPriority,
    next_review_at: NOW.toISOString(),
    reviewed_at: reviewedAt,
  };
  return {
    id,
    user_id: "user",
    template_id: null,
    title: id,
    domain: "ai-ml-fundamentals",
    description: "Opis testowy pojęcia",
    check_question: "Pytanie testowe?",
    answer_pattern: "Odpowiedź testowa",
    source_url: null,
    blueprint_version: null,
    created_at: reviewedAt,
    updated_at: reviewedAt,
    latestAttempt: attempt,
    currentPriority,
    isDue,
  };
}
