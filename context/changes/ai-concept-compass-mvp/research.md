---
change_id: ai-concept-compass-mvp
status: complete
researched_at: 2026-07-31
evidence_quality: pre-implementation
---

# Pre-implementation research

## Question

How should a small authenticated Astro application preserve private learning
data, implement deterministic review logic and produce certification evidence
without making an LLM or local Docker a release dependency?

## Findings

1. The official 10x Astro Starter is the selected baseline because it already
   aligns Astro, React, TypeScript, Supabase and Cloudflare conventions. The
   scaffold must be imported only after this planning package is committed.
2. Hosted Supabase is the persistence and identity boundary. The browser and
   API runtime use only an anon/publishable key plus the user session. RLS must
   independently scope concepts and attempts to `auth.uid()`; a service-role key
   is forbidden from application runtime.
3. The domain algorithm is pure TypeScript. Every function receives `now`, so
   formulas, aging and tie-breaks can be tested without wall-clock dependence.
4. API routes authenticate first, validate every JSON write with Zod, call a
   service boundary and return one stable error envelope with
   400/401/404/409/500 semantics.
5. Starter-pack idempotency belongs in a database uniqueness constraint on
   `(user_id, template_id)` plus conflict-ignore upsert. Review-history deletion
   belongs in `ON DELETE CASCADE`.
6. RLS text checks are useful but not proof. Final evidence needs two ordinary
   hosted users attempting owner and foreign operations without `service_role`.
7. One critical Playwright scenario should cross login, pack, CRUD, review,
   recommendation and deletion against hosted services. Shared test accounts
   require serial execution and explicit cleanup.
8. Cloudflare Workers is the selected SSR target. Account login, secret entry,
   hosted migration and production promotion remain human-controlled steps.

## Content boundary

Ten concepts will be authored from the official AWS AIF-C01 v1.1 exam guide.
They explain blueprint topics and do not reproduce exam questions. Domain
weights are 20/24/28/14/14 percent.

## Risks driving the plan

- cross-account disclosure despite owner filtering in application code;
- wrong mastery or recommendation due to formula/tie-break drift;
- duplicate starter data or orphaned attempts;
- a locally green UI that fails against hosted auth/database;
- secrets exposed to browser bundles, logs or untrusted pull requests;
- certification claims made without public run URLs and screenshots.

## Decision

Proceed with the selected starter, pure scoring module, authenticated API
routes, hosted Supabase RLS, one serial hosted E2E flow and separate local versus
hosted evidence ledgers. LLM features, payments, teams, imports, notifications,
gamification and advanced SRS remain outside MVP.
