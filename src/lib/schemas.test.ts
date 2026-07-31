import { describe, expect, it } from "vitest";
import { createConceptSchema, createReviewSchema, updateConceptSchema } from "@/lib/schemas";

const validConcept = {
  title: "Embeddings",
  domain: "foundation-model-applications",
  description: "Wektorowa reprezentacja znaczenia tekstu.",
  checkQuestion: "Do czego służy embedding?",
  answerPattern: "Do reprezentowania znaczenia w przestrzeni wektorowej.",
};

describe("concept schemas", () => {
  it("accepts a complete concept and trims strings", () => {
    const result = createConceptSchema.parse({ ...validConcept, title: "  Embeddings  " });
    expect(result.title).toBe("Embeddings");
  });

  it("rejects unsupported domains and short content", () => {
    expect(createConceptSchema.safeParse({ ...validConcept, domain: "unknown" }).success).toBe(false);
    expect(createConceptSchema.safeParse({ ...validConcept, description: "za krótko" }).success).toBe(false);
  });

  it("requires at least one field in a patch", () => {
    expect(updateConceptSchema.safeParse({}).success).toBe(false);
    expect(updateConceptSchema.safeParse({ title: "Nowy tytuł" }).success).toBe(true);
  });
});

describe("review schema", () => {
  it.each([1, 2, 3, 4, 5])("accepts confidence %i", (confidence) => {
    expect(createReviewSchema.safeParse({ confidence, outcome: "correct" }).success).toBe(true);
  });

  it.each([0, 1.5, 6])("rejects invalid confidence %s", (confidence) => {
    expect(createReviewSchema.safeParse({ confidence, outcome: "correct" }).success).toBe(false);
  });

  it("rejects an unknown outcome", () => {
    expect(createReviewSchema.safeParse({ confidence: 3, outcome: "almost" }).success).toBe(false);
  });
});
