# Deploy plan — AI Concept Compass MVP

> Status: **blocked on human account access**  
> Target: Cloudflare Workers + hosted Supabase  
> Decision record: `context/foundation/infrastructure.md`

## Authority boundary

The human performs Supabase/Cloudflare authentication, project creation/linking,
secret entry, first production promotion and any destructive database action.
An agent may inspect config, run local gates, propose commands, read non-secret
logs and verify public behavior after the user grants the required authenticated
session. Secrets must never be printed or committed.

## Preconditions

- [ ] Human has a hosted Supabase project and records its region privately.
- [ ] Human has a Cloudflare account allowed to deploy Workers.
- [ ] `npx supabase login` and `npx wrangler login` succeed in the repo.
- [ ] Confirmed E2E account exists; credentials are stored only in approved secret stores.
- [ ] Local quality gates pass on the exact revision intended for deploy.

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

- [ ] Hosted two-user RLS matrix passes.
- [ ] `npm run test:e2e` passes against `E2E_BASE_URL=<public-or-preview-url>`.
- [ ] Repository CI `quality` and `e2e` jobs pass for the deployed revision.

### Manual

- [ ] Fresh user completes signup/confirmation/signin.
- [ ] Empty state loads the pack once and does not duplicate on retry.
- [ ] User edits a concept, records a review and sees a new recommendation.
- [ ] Delete removes the item and history.
- [ ] Second account cannot see first account data.
- [ ] 360 px and keyboard smoke pass; browser console/network show no unexpected errors.

## Rollback

1. Stop promotion if any quality, RLS or critical-flow check fails.
2. For application-only failure, select the previous known-good Worker deployment
   in the Cloudflare dashboard or use the supported deployment rollback command
   after verifying the target version.
3. Do not assume app rollback reverses the database. The initial migration should
   not be dropped after real data exists; prepare a forward fix or restore plan.
4. Re-run auth, dashboard and isolation smoke after rollback and record the result.

## Evidence package

- [ ] Public URL and exact git revision.
- [ ] Green CI quality and E2E run URLs.
- [ ] Deploy run/identifier and timestamp.
- [ ] Screenshot: signup/signin.
- [ ] Screenshot: loaded dashboard and recommendation.
- [ ] Screenshot: mobile view.
- [ ] Screenshot or recorded test result: two-account isolation.
- [ ] Dependency-risk decision and rollback note.

No checkbox above may be flipped solely because code/config exists locally.
