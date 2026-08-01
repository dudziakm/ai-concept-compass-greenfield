# Deploy plan — AI Concept Compass MVP

> Status: **deployed and verified; remaining human certification actions**
> Target: Cloudflare Workers + hosted Supabase  
> Decision record: `context/foundation/infrastructure.md`

## Authority boundary

The human performs Supabase/Cloudflare authentication, project creation/linking,
secret entry, first production promotion and any destructive database action.
An agent may inspect config, run local gates, propose commands, read non-secret
logs and verify public behavior after the user grants the required authenticated
session. Secrets must never be printed or committed.

## Preconditions

- [x] Hosted Supabase and an allowed Cloudflare account are configured.
- [x] Confirmed E2E account and CI secrets exist only in approved secret stores.
- [x] Local and full remote quality gates pass; exact immutable evidence is in
      `context/evidence/builder-public-verification-2026-08-01.md`.

## Database preparation

1. Link the intended hosted project with `npx supabase link --project-ref <ref>`.
2. Review the pending migration with a read-only diff command supported by the
   current CLI/project workflow.
3. Apply `supabase/migrations/20260731190000_ai_concept_compass.sql` using
   `npx supabase db push` after human confirmation.
4. Review the hosted security advisor and verify RLS is enabled on all three tables.
5. Create/confirm two ordinary accounts for isolation testing; do not use
   service-role credentials in application or browser tests.

## Worker preparation

1. Add `SUPABASE_URL` and `SUPABASE_KEY` with
   `npx wrangler secret put <NAME>`; use the public anon/publishable key only.
2. Run `npm run lint`, `npm run typecheck`, `npm run test:coverage` and
   `npm run build` on the chosen revision.
3. Deploy with `npx wrangler deploy` after the human approves the target account.
4. Record Worker URL, UTC timestamp, git SHA and deploy identifier.
5. Add the public callback/redirect URL to hosted auth configuration.

## Post-deploy verification

### Automated

- [x] Hosted two-user RLS matrix passes.
- [x] `npm run test:e2e` passes against the public Worker (4/4).
- [x] Repository CI `quality`, `e2e` and `rls` pass for merge commit `28bc365`.

### Manual

- [ ] Fresh user completes signup/confirmation/signin.
- [x] Empty state loads the pack once and does not duplicate on retry.
- [x] User edits a concept, records a review and sees a new recommendation.
- [x] Delete removes the item and history.
- [x] Second account cannot see first account data.
- [x] 360 px and keyboard smoke pass; browser console/page errors are clean.

## Rollback

1. Stop promotion if any quality, RLS or critical-flow check fails.
2. For application-only failure, select the previous known-good Worker deployment
   in the Cloudflare dashboard or use the supported deployment rollback command
   after verifying the target version.
3. Do not assume app rollback reverses the database. The initial migration should
   not be dropped after real data exists; prepare a forward fix or restore plan.
4. Re-run auth, dashboard and isolation smoke after rollback and record the result.

## Evidence package

- [x] Public URL, Worker version, release revision and timestamp.
- [x] Green CI quality/E2E/RLS run URL.
- [x] Screenshot: public sign-in.
- [x] Screenshot: loaded dashboard and recommendation.
- [x] Screenshot: 360 px mobile view.
- [x] Recorded test result: two-account isolation.
- [ ] Dependency-risk decision and rollback note.

No checkbox above may be flipped solely because code/config exists locally.
