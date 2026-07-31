import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  new URL("../supabase/migrations/20260731190000_ai_concept_compass.sql", import.meta.url),
  "utf8",
);

describe("database security contract", () => {
  it.each(["concept_templates", "concepts", "review_attempts"])("enables RLS for %s", (table) => {
    expect(migration).toContain(`alter table public.${table} enable row level security`);
  });

  it("scopes every mutable user table to auth.uid", () => {
    expect(migration.match(/auth\.uid\(\)/g)?.length).toBeGreaterThanOrEqual(7);
    expect(migration).toContain('create policy "users read own concepts"');
    expect(migration).toContain('create policy "users update own concepts"');
    expect(migration).toContain('create policy "users delete own concepts"');
    expect(migration).toContain('create policy "users read own attempts"');
  });

  it("cascades review deletion and makes starter pack idempotent", () => {
    expect(migration).toContain("references public.concepts(id) on delete cascade");
    expect(migration).toContain("unique (user_id, template_id)");
  });

  it("contains ten authored templates and the official AWS source", () => {
    expect(migration.match(/10000000-0000-4000-8000-0000000000\d\d/g)).toHaveLength(10);
    expect(migration).toContain("docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01");
    expect(migration).toContain("AIF-C01 v1.1");
  });
});
