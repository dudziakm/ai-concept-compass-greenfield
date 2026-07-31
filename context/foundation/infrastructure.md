---
project: ai-concept-compass
researched_at: 2026-07-31T22:30:00+02:00
recommended_platform: Cloudflare Workers
runner_up: Vercel
context_type: mvp
tech_stack:
  language: TypeScript
  framework: Astro 6 SSR
  runtime: Cloudflare Workers
evidence_quality: pre-implementation-decision
interview_status: not-conducted
---

# Infrastructure — AI Concept Compass

> **Decision record:** prepared before scaffolding from the signed-off product
> constraints and official platform documentation checked on 2026-07-31. No
> separate infrastructure interview was conducted; unknown account-level facts
> remain explicit.

## Recommendation

**Deploy on Cloudflare Workers.**

The selected starter includes the official Cloudflare adapter and supports SSR
on Workers, so this option avoids an adapter migration. At the expected MVP scale the
free plan's 100,000 requests/day and free static assets are ample; the main
trade-off is a 10 ms CPU limit per invocation, acceptable for this request/response
application whose durable work is delegated to hosted Supabase.

## Platform Comparison

Scoring uses the course criteria: CLI-first operation, managed/serverless
runtime, agent-readable current docs, stable deploy API and agent integration.
`Pass=2`, `Partial=1`, `Fail=0`. Cost and fit use current official documentation,
not remembered pricing.

| Platform           | CLI-first | Managed | Agent-readable docs | Stable deploy API | Integration |     Total | Fit note                                                                                                                         |
| ------------------ | --------: | ------: | ------------------: | ----------------: | ----------: | --------: | -------------------------------------------------------------------------------------------------------------------------------- |
| Cloudflare Workers |         2 |       2 |                   2 |                 2 |           2 | **10/10** | Existing adapter/config; direct `wrangler deploy`; Free = 100k dynamic requests/day.                                             |
| Vercel             |         2 |       2 |                   2 |                 2 |           1 |  **9/10** | Strong previews/rollback and $0 Hobby, but requires replacing the current adapter and Hobby is for personal, non-commercial use. |
| Netlify            |         2 |       2 |                   2 |                 2 |           1 |  **9/10** | Maintained Astro adapter and previews, but also requires adapter migration; new-account pricing is credit based.                 |

Official evidence checked:

- Cloudflare's [Astro guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/)
  documents Astro SSR on Workers and local/CI deploys; last updated 2026-04-23.
- Cloudflare's [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
  lists 100,000 requests/day and 10 ms CPU/invocation on Free; checked
  2026-07-31.
- Vercel's [pricing](https://vercel.com/pricing) lists $0 Hobby, automatic CI/CD,
  previews and rollback, with usage caps and personal/non-commercial scope;
  checked 2026-07-31.
- Netlify's [Astro guide](https://docs.netlify.com/build/frameworks/framework-setup-guides/astro/)
  recommends the maintained Astro adapter; its [credit-based plans](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)
  list Free at 300 credits/month for new accounts; checked 2026-07-31.

### Shortlisted Platforms

#### 1. Cloudflare Workers (Recommended)

It wins on migration cost and exact runtime fit. `astro.config.mjs` already uses
`@astrojs/cloudflare`, while `wrangler.jsonc` names the Worker entrypoint, static
asset binding, compatibility date and observability. Deployment does not require
a different rendering model.

#### 2. Vercel

Vercel has the smoothest repository-driven preview and rollback story of the
alternatives. It remains a credible fallback if Cloudflare account/runtime
constraints block deployment, but switching now adds adapter/configuration work
without improving the MVP user outcome.

#### 3. Netlify

Netlify explicitly supports SSR Astro through its adapter and offers non-metered
deploy previews. Its credit-based billing for new accounts and the adapter change
make it slightly less predictable for this already-configured repository.

## Anti-Bias Cross-Check: Cloudflare Workers

### Devil's Advocate — Weaknesses

1. The Free plan's 10 ms CPU ceiling can fail code that grows into CPU-heavy
   scoring, document processing or image transformations.
2. A distributed edge runtime plus a separately hosted database can add latency
   and make region mismatch visible during auth-heavy flows.
3. Direct `wrangler deploy` from a developer machine creates a weaker audit trail
   than repository-driven promotion until a deploy workflow is added.
4. Runtime compatibility is not full Node.js compatibility; future libraries may
   assume unavailable APIs despite the compatibility flag.

### Pre-Mortem — How This Could Fail

The team assumes the adapter makes every Node dependency Worker-safe, then adds
CPU-heavy or filesystem-dependent code. Local build remains green, but production
requests hit CPU/runtime constraints. At the same time the hosted database lives
far from common Worker execution, making an otherwise small dashboard feel slow.
If production were deployed from one laptop without an immutable CI run, no
evidence would identify which revision is live. A rushed database migration is
applied independently of the Worker and cannot be rolled back with the
application. The release plan therefore requires revision/run capture and a
reviewed forward migration strategy.

### Unknown Unknowns

- The actual Supabase project region has not been recorded; region-to-edge
  latency is therefore unmeasured.
- The first Cloudflare account may have policy, subdomain or custom-domain limits
  not visible from repository configuration.
- Preview deploy behavior for fork pull requests is not defined because no deploy
  workflow exists yet.
- The exact production redirect URL must be registered in the auth provider after
  the first Worker URL exists.

## Operational Story

- **Preview deploys:** not configured. Pull requests run CI only. Until a deploy
  workflow is approved, previews are a manual non-production Worker or local run;
  fork PRs receive no credentials.
- **Secrets:** `SUPABASE_URL` and public anon/publishable key are stored as Worker
  secrets and GitHub Secrets. E2E credentials exist only in GitHub Secrets. A
  human account owner rotates them; agents may verify variable names, never read
  or print values.
- **Rollback:** a human selects the previous deployment in the Cloudflare
  dashboard or uses the platform's deployment rollback command after confirming
  the target version. Application rollback should take minutes; database
  migrations require a separate forward-fix or explicitly prepared down plan.
- **Approval:** account login, first production deploy, secret rotation, database
  link/push and destructive database actions require the human. Read-only logs,
  builds and local quality checks may be run by an agent.
- **Logs:** CI via `gh run view <run-id> --log-failed`; Worker runtime via
  `npx wrangler tail ai-concept-compass` after human authentication; database via
  the hosted project logs with read-only access.

## Risk Register

| Risk                                     | Source           | Likelihood | Impact | Mitigation                                                                                  |
| ---------------------------------------- | ---------------- | ---------- | ------ | ------------------------------------------------------------------------------------------- |
| CPU/runtime limit exceeded               | Devil's advocate | L          | H      | Keep MVP request-bound and deterministic; performance-test before CPU-heavy features.       |
| Edge/database region latency             | Pre-mortem       | M          | M      | Record DB region, measure dashboard p95, move region or reduce round trips if target fails. |
| App rollback incompatible with schema    | Pre-mortem       | M          | H      | Review migrations separately; prefer additive changes and forward fixes.                    |
| Secrets exposed to forks or logs         | Unknown unknown  | L          | H      | Minimal workflow permissions; no secrets for forks; redact outputs.                         |
| Manual deploy lacks evidence             | Research finding | H          | M      | Save deploy URL/run, revision and screenshots; add a reviewed promotion workflow later.     |
| Current production dependency advisories | Repository audit | M          | H      | Track Astro 7/adapter 14 upgrade separately; do not force a major upgrade inside MVP.       |

## Getting Started

1. Human creates/chooses hosted Supabase and Cloudflare projects and completes
   `npx supabase login` plus `npx wrangler login`.
2. Link the database project and apply
   `supabase/migrations/20260731190000_ai_concept_compass.sql` with
   `npx supabase db push`; run the hosted security checks.
3. Add `SUPABASE_URL` and `SUPABASE_KEY` through `npx wrangler secret put`.
4. Run the repository quality gates, then `npx wrangler deploy`; record the
   Worker URL and Git revision.
5. Add the public redirect URL to auth configuration and execute the manual plus
   hosted E2E checklist from `context/deployment/deploy-plan.md`.

## Out of Scope

- Docker image configuration.
- Automatic production promotion pipeline.
- Production-scale multi-region, HA and disaster recovery design.
- Migration to a different hosting provider or a new Astro major version.
- Claiming the public deploy is complete before URL and smoke-test evidence exist.
