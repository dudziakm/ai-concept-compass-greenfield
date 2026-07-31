# Plan brief — AI Concept Compass MVP

## Goal

Ship a Polish hosted learning loop with private data, deterministic calibration
and one next-topic recommendation by 10 August 2026.

## Non-negotiable decisions

- official 10x Astro Starter, Astro 6, React 19 and TypeScript;
- hosted Supabase Auth/PostgreSQL/RLS with no service-role runtime key;
- Cloudflare Workers deployment;
- Zod on every write boundary;
- deterministic scoring with injected time;
- blocking quality, hosted E2E and two-user RLS checks;
- no LLM call in Builder MVP.

## Delivery order

Planning contracts → starter baseline → auth/data/RLS → starter and CRUD →
review/scoring/dashboard → tests/CI → hosted deploy and evidence.

## Stop conditions

Do not claim certification readiness until the hosted migration, two-user RLS,
critical E2E, public URL and manual mobile/keyboard/console smoke all have
retained evidence.
