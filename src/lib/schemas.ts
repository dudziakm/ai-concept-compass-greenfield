import { z } from "zod";
import { CONCEPT_DOMAINS, REVIEW_OUTCOMES } from "@/types";

const title = z.string().trim().min(2).max(120);
const description = z.string().trim().min(10).max(2_000);
const checkQuestion = z.string().trim().min(5).max(1_000);
const answerPattern = z.string().trim().min(5).max(2_000);

export const createConceptSchema = z.object({
  title,
  domain: z.enum(CONCEPT_DOMAINS),
  description,
  checkQuestion,
  answerPattern,
});

export const updateConceptSchema = createConceptSchema.partial().refine((input) => Object.keys(input).length > 0, {
  message: "Przekaż co najmniej jedno pole do zmiany",
});

export const createReviewSchema = z.object({
  confidence: z.number().int().min(1).max(5),
  outcome: z.enum(REVIEW_OUTCOMES),
});

export type CreateConceptInput = z.infer<typeof createConceptSchema>;
export type UpdateConceptInput = z.infer<typeof updateConceptSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
