import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";
import { DOMAIN_LABELS } from "@/lib/domain-labels";
import { calculatePriority, scoreReview, selectRecommendedConcept } from "@/lib/scoring";
import type { CreateConceptInput, CreateReviewInput, UpdateConceptInput } from "@/lib/schemas";
import { CONCEPT_DOMAINS, type ConceptWithProgress, type DashboardData } from "@/types";

export class ConceptService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async list(userId: string) {
    const { data, error } = await this.supabase
      .from("concepts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  }

  async get(userId: string, conceptId: string) {
    const { data, error } = await this.supabase
      .from("concepts")
      .select("*")
      .eq("id", conceptId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async create(userId: string, input: CreateConceptInput) {
    const { data, error } = await this.supabase
      .from("concepts")
      .insert({
        user_id: userId,
        template_id: null,
        title: input.title,
        domain: input.domain,
        description: input.description,
        check_question: input.checkQuestion,
        answer_pattern: input.answerPattern,
        source_url: null,
        blueprint_version: null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  async update(userId: string, conceptId: string, input: UpdateConceptInput) {
    const patch = {
      ...(input.title === undefined ? {} : { title: input.title }),
      ...(input.domain === undefined ? {} : { domain: input.domain }),
      ...(input.description === undefined ? {} : { description: input.description }),
      ...(input.checkQuestion === undefined ? {} : { check_question: input.checkQuestion }),
      ...(input.answerPattern === undefined ? {} : { answer_pattern: input.answerPattern }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.supabase
      .from("concepts")
      .update(patch)
      .eq("id", conceptId)
      .eq("user_id", userId)
      .select("*")
      .maybeSingle();
    if (error) throw error;
    return data;
  }

  async delete(userId: string, conceptId: string) {
    const { data, error } = await this.supabase
      .from("concepts")
      .delete()
      .eq("id", conceptId)
      .eq("user_id", userId)
      .select("id")
      .maybeSingle();
    if (error) throw error;
    return data !== null;
  }

  async createReview(userId: string, conceptId: string, input: CreateReviewInput, now: Date) {
    const concept = await this.get(userId, conceptId);
    if (!concept) return null;

    const { data: previousAttempts, error: previousError } = await this.supabase
      .from("review_attempts")
      .select("mastery,outcome")
      .eq("concept_id", conceptId)
      .eq("user_id", userId)
      .order("reviewed_at", { ascending: false })
      .limit(1);
    if (previousError) throw previousError;

    const previousAttempt = previousAttempts[0] ?? null;
    const scored = scoreReview({ ...input, previousAttempt, now });
    const { data, error } = await this.supabase
      .from("review_attempts")
      .insert({
        concept_id: conceptId,
        user_id: userId,
        confidence: input.confidence,
        outcome: input.outcome,
        mastery: scored.mastery,
        calibration_gap: scored.calibrationGap,
        priority: scored.priority,
        next_review_at: scored.nextReviewAt.toISOString(),
        reviewed_at: now.toISOString(),
      })
      .select("*")
      .single();
    if (error) throw error;
    return data;
  }

  async loadStarterPack(userId: string) {
    const { data: templates, error: templatesError } = await this.supabase
      .from("concept_templates")
      .select("*")
      .order("created_at", { ascending: true });
    if (templatesError) throw templatesError;

    if (templates.length > 0) {
      const { error } = await this.supabase.from("concepts").upsert(
        templates.map((template) => ({
          user_id: userId,
          template_id: template.id,
          title: template.title,
          domain: template.domain,
          description: template.description,
          check_question: template.check_question,
          answer_pattern: template.answer_pattern,
          source_url: template.source_url,
          blueprint_version: template.blueprint_version,
        })),
        { onConflict: "user_id,template_id", ignoreDuplicates: true },
      );
      if (error) throw error;
    }

    const concepts = await this.list(userId);
    return { concepts, templateCount: templates.length };
  }

  async dashboard(userId: string, now: Date): Promise<DashboardData> {
    const [{ data: concepts, error: conceptsError }, { data: attempts, error: attemptsError }] = await Promise.all([
      this.supabase.from("concepts").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
      this.supabase
        .from("review_attempts")
        .select("*")
        .eq("user_id", userId)
        .order("reviewed_at", { ascending: false }),
    ]);
    if (conceptsError) throw conceptsError;
    if (attemptsError) throw attemptsError;

    const latestByConcept = new Map<string, (typeof attempts)[number]>();
    for (const attempt of attempts) {
      if (!latestByConcept.has(attempt.concept_id)) latestByConcept.set(attempt.concept_id, attempt);
    }

    const withProgress: ConceptWithProgress[] = concepts.map((concept) => {
      const latestAttempt = latestByConcept.get(concept.id) ?? null;
      const nextReviewAt = latestAttempt ? new Date(latestAttempt.next_review_at) : null;
      const currentPriority =
        latestAttempt && nextReviewAt
          ? calculatePriority(latestAttempt.mastery, latestAttempt.calibration_gap, nextReviewAt, now)
          : 100;
      return {
        ...concept,
        latestAttempt,
        currentPriority,
        isDue: nextReviewAt === null || nextReviewAt.getTime() <= now.getTime(),
      };
    });

    const domainProgress = CONCEPT_DOMAINS.map((domain) => {
      const domainConcepts = withProgress.filter((concept) => concept.domain === domain);
      const mastery = average(domainConcepts.map((concept) => concept.latestAttempt?.mastery ?? 0));
      return { domain, label: DOMAIN_LABELS[domain], mastery, conceptCount: domainConcepts.length };
    });

    return {
      recommendation: selectRecommendedConcept(withProgress),
      concepts: withProgress,
      domainProgress,
      totalConcepts: withProgress.length,
      dueCount: withProgress.filter((concept) => concept.isDue).length,
      averageMastery: average(withProgress.map((concept) => concept.latestAttempt?.mastery ?? 0)),
    };
  }
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}

export function isConflict(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}
