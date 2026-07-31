export const CONCEPT_DOMAINS = [
  "ai-ml-fundamentals",
  "generative-ai-fundamentals",
  "foundation-model-applications",
  "responsible-ai",
  "security-compliance-governance",
] as const;

export type ConceptDomain = (typeof CONCEPT_DOMAINS)[number];

export const REVIEW_OUTCOMES = ["incorrect", "partial", "correct"] as const;
export type ReviewOutcome = (typeof REVIEW_OUTCOMES)[number];

export interface Concept extends Record<string, unknown> {
  id: string;
  user_id: string;
  template_id: string | null;
  title: string;
  domain: ConceptDomain;
  description: string;
  check_question: string;
  answer_pattern: string;
  source_url: string | null;
  blueprint_version: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewAttempt extends Record<string, unknown> {
  id: string;
  concept_id: string;
  user_id: string;
  confidence: number;
  outcome: ReviewOutcome;
  mastery: number;
  calibration_gap: number;
  priority: number;
  next_review_at: string;
  reviewed_at: string;
}

export interface ConceptWithProgress extends Concept {
  latestAttempt: ReviewAttempt | null;
  currentPriority: number;
  isDue: boolean;
}

export interface DashboardData {
  recommendation: ConceptWithProgress | null;
  concepts: ConceptWithProgress[];
  domainProgress: {
    domain: ConceptDomain;
    label: string;
    mastery: number;
    conceptCount: number;
  }[];
  totalConcepts: number;
  dueCount: number;
  averageMastery: number;
}
