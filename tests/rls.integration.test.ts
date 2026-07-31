import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Database } from "@/db/database.types";

const config = {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_KEY,
  userAEmail: process.env.RLS_USER_A_EMAIL,
  userAPassword: process.env.RLS_USER_A_PASSWORD,
  userBEmail: process.env.RLS_USER_B_EMAIL,
  userBPassword: process.env.RLS_USER_B_PASSWORD,
};
const configured = Object.values(config).every(Boolean);

function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing hosted RLS value: ${name}`);
  return value;
}

function ordinaryClient(url: string, key: string): SupabaseClient<Database> {
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

describe.skipIf(!configured)("hosted Supabase two-user RLS", () => {
  let userA: SupabaseClient<Database>;
  let userB: SupabaseClient<Database>;
  let userAId: string;
  let userBId: string;
  let conceptId: string;

  beforeAll(async () => {
    const url = required(config.url, "SUPABASE_URL");
    const key = required(config.key, "SUPABASE_KEY");
    const userAEmail = required(config.userAEmail, "RLS_USER_A_EMAIL");
    const userAPassword = required(config.userAPassword, "RLS_USER_A_PASSWORD");
    const userBEmail = required(config.userBEmail, "RLS_USER_B_EMAIL");
    const userBPassword = required(config.userBPassword, "RLS_USER_B_PASSWORD");
    userA = ordinaryClient(url, key);
    userB = ordinaryClient(url, key);

    const [authA, authB] = await Promise.all([
      userA.auth.signInWithPassword({ email: userAEmail, password: userAPassword }),
      userB.auth.signInWithPassword({ email: userBEmail, password: userBPassword }),
    ]);
    expect(authA.error).toBeNull();
    expect(authB.error).toBeNull();
    if (!authA.data.user || !authB.data.user) throw new Error("Both hosted RLS accounts must be confirmed");
    userAId = authA.data.user.id;
    userBId = authB.data.user.id;

    const created = await userA
      .from("concepts")
      .insert({
        user_id: userAId,
        template_id: null,
        title: `RLS proof ${Date.now()}`,
        domain: "ai-ml-fundamentals",
        description: "Temporary concept for the hosted two-user isolation proof.",
        check_question: "Can a second ordinary account access this concept?",
        answer_pattern: "No. PostgreSQL row-level security must deny that access.",
        source_url: null,
        blueprint_version: null,
      })
      .select("id")
      .single();
    expect(created.error).toBeNull();
    if (!created.data) throw new Error("User A could not create the RLS fixture");
    conceptId = created.data.id;
  });

  afterAll(async () => {
    if (conceptId) await userA.from("concepts").delete().eq("id", conceptId);
    await Promise.all([userA.auth.signOut(), userB.auth.signOut()]);
  });

  it("allows the owner but hides select, update and delete from user B", async () => {
    const ownerRead = await userA.from("concepts").select("id").eq("id", conceptId);
    expect(ownerRead.error).toBeNull();
    expect(ownerRead.data).toEqual([{ id: conceptId }]);

    const foreignRead = await userB.from("concepts").select("id").eq("id", conceptId);
    const foreignUpdate = await userB
      .from("concepts")
      .update({ title: "Forbidden update" })
      .eq("id", conceptId)
      .select("id");
    const foreignDelete = await userB.from("concepts").delete().eq("id", conceptId).select("id");

    expect(foreignRead.error).toBeNull();
    expect(foreignRead.data).toEqual([]);
    expect(foreignUpdate.error).toBeNull();
    expect(foreignUpdate.data).toEqual([]);
    expect(foreignDelete.error).toBeNull();
    expect(foreignDelete.data).toEqual([]);
  });

  it("rejects forged ownership and a review for another user's concept", async () => {
    const forgedConcept = await userB.from("concepts").insert({
      user_id: userAId,
      template_id: null,
      title: "Forged owner",
      domain: "ai-ml-fundamentals",
      description: "This insert must be denied by the owner policy.",
      check_question: "Should this row be stored?",
      answer_pattern: "No, auth.uid does not match user_id.",
      source_url: null,
      blueprint_version: null,
    });
    expect(forgedConcept.error).not.toBeNull();

    const foreignAttempt = await userB.from("review_attempts").insert({
      concept_id: conceptId,
      user_id: userBId,
      confidence: 5,
      outcome: "correct",
      mastery: 100,
      calibration_gap: 0,
      priority: 0,
      next_review_at: new Date(Date.now() + 86_400_000).toISOString(),
      reviewed_at: new Date().toISOString(),
    });
    expect(foreignAttempt.error).not.toBeNull();
  });

  it("allows an owner review and cascades it when the concept is deleted", async () => {
    const inserted = await userA
      .from("review_attempts")
      .insert({
        concept_id: conceptId,
        user_id: userAId,
        confidence: 3,
        outcome: "partial",
        mastery: 50,
        calibration_gap: 0,
        priority: 35,
        next_review_at: new Date(Date.now() + 3 * 86_400_000).toISOString(),
        reviewed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    expect(inserted.error).toBeNull();
    if (!inserted.data) throw new Error("Owner review fixture was not created");

    const deleted = await userA.from("concepts").delete().eq("id", conceptId).select("id").single();
    expect(deleted.error).toBeNull();
    const cascadeRead = await userA.from("review_attempts").select("id").eq("id", inserted.data.id);
    expect(cascadeRead.error).toBeNull();
    expect(cascadeRead.data).toEqual([]);
    conceptId = "";
  });
});
