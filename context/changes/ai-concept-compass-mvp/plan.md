# Implementation plan — AI Concept Compass MVP

Prepared before scaffolding on 2026-07-31. Progress changes only when the
matching code or retained evidence exists.

## Scope

Implement registration/login, private concepts, an idempotent ten-concept
starter pack, calibrated reviews, a deterministic recommendation dashboard,
tests, blocking CI and a Cloudflare Worker deployment. Do not add LLM calls,
payments, teams, admin, imports, notifications, gamification or advanced SRS.

## Phase 1: Planning and verified starter baseline

### Phase 1: Success criteria

- Shape, PRD, business and technical requirements are traceable.
- Stack, infrastructure, roadmap, specs and test plan are approved.
- Official starter is imported after the planning commit.
- Node 22.14 installation, lint, typecheck and build establish the baseline.

### Phase 1: Work

1. Commit the planning-only repository state.
2. Import the official 10x Astro Starter without its Git history.
3. Record exact scaffold provenance and dependency audit.
4. Configure Astro 6 SSR for Cloudflare Workers without upgrading to Astro 7.

## Phase 2: Identity, schema and ownership

### Phase 2: Success criteria

- Signup, signin, signout and dashboard protection exist.
- Migration creates templates, concepts and review attempts.
- Ten authored AIF-C01 v1.1 templates are seeded idempotently.
- RLS scopes all mutable data through `auth.uid()`.
- Deleting a concept cascades its attempts.

### Phase 2: Work

1. Add cookie-aware Supabase SSR client and middleware.
2. Add browser auth pages and form endpoints.
3. Create typed migration, constraints, indexes, policies and templates.
4. Add static migration tests and a hosted two-user RLS harness using ordinary accounts.

## Phase 3: Starter pack and private CRUD

### Phase 3: Success criteria

- Authenticated list/create/get/update/delete routes use stable statuses.
- Every JSON write is validated by Zod.
- Starter pack remains exactly ten template copies after retry.
- The Polish dashboard supports empty/loading/error/create/edit/delete states.

### Phase 3: Work

1. Add API response/parser helpers and authenticated service context.
2. Implement owner-scoped ConceptService methods.
3. Implement `/api/concepts*` and `/api/starter-pack`.
4. Implement accessible dashboard forms and busy-state protection.
5. Add route-contract tests for 400/401/404/409/500.

## Phase 4: Review engine and recommendation

### Phase 4: Success criteria

- All documented formulas and intervals have deterministic tests.
- Review submission persists server-computed values only.
- Dashboard chooses due concepts, priority and oldest attempt in that order.
- UI refreshes mastery, domain progress and recommendation after a review.

### Phase 4: Work

1. Implement pure scoring and recommendation helpers with injected `now`.
2. Add outcome, overconfidence, repeated-correct, overdue, clamp and tie-break tests.
3. Implement append-only review endpoint and dashboard aggregate.
4. Implement confidence → reveal → self-assessment UI.

## Phase 5: Shared gates, deploy and evidence

### Phase 5: Success criteria

- Workflow structure, lint, typecheck, coverage and build pass locally and in CI.
- Hosted RLS proves isolation for two users.
- Serial Playwright covers login, retry-safe pack, custom CRUD, review,
  recommendation and deletion against hosted persistence.
- Public Worker URL passes desktop/mobile/keyboard/console smoke.
- URLs and screenshots are mapped to Mission Log fields before submission.

### Phase 5: Work

1. Add blocking GitHub Actions quality, RLS and E2E jobs.
2. Configure hosted Supabase and two confirmed test accounts.
3. Apply the reviewed migration and run RLS/E2E.
4. Deploy the exact green revision to Cloudflare Workers.
5. Capture public URL, revision, runs, screenshots and final form evidence.

## Verification commands

```bash
npm ci
npm run workflow:check
npm run astro -- sync
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:rls
npm run test:e2e
```

## Progress

### Phase 1: Planning and verified starter baseline

#### Automated

- [x] 1.1 Planning-only repository state committed
- [x] 1.2 Official starter imported after planning — 3397461
- [x] 1.3 Starter provenance and final local quality baseline recorded

#### Manual

- [ ] 1.4 Product owner accepts scope and open questions

### Phase 2: Identity, schema and ownership

#### Automated

- [x] 2.1 Auth and protected route implemented
- [x] 2.2 Schema, RLS, templates and migration contract tests implemented
- [ ] 2.3 Hosted two-user RLS matrix passes

#### Manual

- [ ] 2.4 Migration and auth settings reviewed in hosted Supabase

### Phase 3: Starter pack and private CRUD

#### Automated

- [x] 3.1 API contracts, starter idempotency and private CRUD implemented
- [x] 3.2 Route-contract tests pass

#### Manual

- [ ] 3.3 Desktop/mobile CRUD and busy/error states pass

### Phase 4: Review engine and recommendation

#### Automated

- [x] 4.1 Scoring and ranking suite passes
- [ ] 4.2 Hosted critical Playwright scenario passes

#### Manual

- [ ] 4.3 Learner understands review and recommendation sequence

### Phase 5: Shared gates, deploy and evidence

#### Automated

- [x] 5.1 Local and CI quality gates pass — [run 30662052616](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30662052616)
- [ ] 5.2 Hosted RLS and E2E gates pass

#### Manual

- [ ] 5.3 Public deploy smoke and screenshots complete
- [ ] 5.4 Mission Log evidence package submitted
