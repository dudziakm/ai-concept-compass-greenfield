import type { Concept, ConceptDomain, ReviewAttempt } from "@/types";

export interface ConceptTemplate extends Record<string, unknown> {
  id: string;
  title: string;
  domain: ConceptDomain;
  description: string;
  check_question: string;
  answer_pattern: string;
  source_url: string;
  blueprint_version: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      concept_templates: {
        Row: ConceptTemplate;
        Insert: Omit<ConceptTemplate, "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Omit<ConceptTemplate, "id">>;
        Relationships: [];
      };
      concepts: {
        Row: Concept;
        Insert: Omit<Concept, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Concept, "id" | "user_id" | "created_at">>;
        Relationships: [];
      };
      review_attempts: {
        Row: ReviewAttempt;
        Insert: Omit<ReviewAttempt, "id" | "reviewed_at"> & { id?: string; reviewed_at?: string };
        Update: Partial<Omit<ReviewAttempt, "id" | "concept_id" | "user_id" | "reviewed_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
