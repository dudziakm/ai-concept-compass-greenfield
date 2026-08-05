# Implementation plan — AI Concept Compass MVP

Prepared before scaffolding on 2026-07-31. Progress changes only when the
matching code or retained evidence exists.

## Scope

Implement registration/login, private concepts, an idempotent ten-concept
starter pack, calibrated reviews, a deterministic recommendation dashboard,
tests, blocking CI and a Cloudflare Worker deployment. Do not add LLM calls,
payments, teams, admin, imports, general notifications, gamification or advanced
SRS. A temporary, accessible confirmation after editing a concept is in scope
because it preserves CRUD context.

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
- Editing preserves the card's position and confirms the saved card with visible
  focus and screen-reader feedback.
- Collection ordering is stable for equal creation timestamps by using the
  concept identifier as a secondary key.

### Phase 3: Work

1. Add API response/parser helpers and authenticated service context.
2. Implement owner-scoped ConceptService methods.
3. Implement `/api/concepts*` and `/api/starter-pack`.
4. Implement accessible dashboard forms and busy-state protection.
5. Add route-contract tests for 400/401/404/409/500.
6. Keep post-edit learner context with a temporary saved-card status, highlight
   and focus, covered by the critical browser journey.
7. Add a deterministic secondary sort key so bulk-created concepts do not move
   between dashboard refreshes.

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
- Public Worker URL has desktop/mobile/keyboard/console smoke and a fresh
  public critical E2E result; the record must retain exact version, run and
  screenshot evidence.
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
- [x] 2.3 Hosted two-user RLS matrix passes — 3/3 on 2026-08-01

#### Manual

- [x] 2.4 Migration and auth settings reviewed in hosted Supabase

### Phase 3: Starter pack and private CRUD

#### Automated

- [x] 3.1 API contracts, starter idempotency and private CRUD implemented
- [x] 3.2 Route-contract tests pass
- [x] 3.4 Post-edit saved-card context is announced, focused and stays in list order

#### Manual

- [x] 3.3 Desktop/mobile CRUD and busy/error states pass

### Phase 4: Review engine and recommendation

#### Automated

- [x] 4.1 Scoring and ranking suite passes
- [x] 4.2 Critical Playwright against hosted Supabase and the public Worker
      passes — public critical flow repeated 5/5, then fresh full public suite
      4/4 on 2026-08-01; exact record in
      `context/evidence/builder-public-verification-2026-08-01.md`

#### Manual

- [ ] 4.3 Learner understands review and recommendation sequence

### Phase 5: Shared gates, deploy and evidence

#### Automated

- [x] 5.1 Local gates and full GitHub CI pass — `quality`, hosted `e2e` and
      `rls` are green for merge commit `28bc365` in run `30715121885`.
      Current: green for head SHA `9706d9b` on `main` in run `31016045921`
      (2026-08-05) — quality 2m4s, e2e 2m9s, rls 44s.
- [x] 5.2 Hosted RLS and E2E gates pass locally against hosted Supabase

#### Manual

- [x] 5.3 Deploy the tested revision, rerun the public critical flow, and
      capture public smoke/screenshots
- [ ] 5.4 Mission Log evidence package submitted

## Pause checkpoint — 2026-07-31

- Publiczny draft PR z utwardzeniem dowodów i workflow reviewera:
  <https://github.com/dudziakm/ai-concept-compass-greenfield/pull/1>
  (`agent/harden-workflow-evidence`, `c0e803c`).
- Lokalnie przechodzą workflow check, lint, typecheck, 50 testów/100% coverage
  chronionej logiki, build, reviewer 18/18 i promptfoo offline 6/6.
- Retry reviewera bez sekretu potwierdził sticky comment i `ai-cr:failed`; nie
  zastępuje to wymaganego później PR-a z rzeczywistym findingiem oraz PR-a pass.
- Nie oznaczać 2.3, 2.4, 4.2, 5.2–5.4 jako gotowych: Supabase MCP wymaga
  restartu sesji, nie ma sekretów/kont hosted, a Cloudflare CLI nie jest
  zalogowane. Pełny handoff workspace: `../HANDOFF-2026-07-31.md`.

## Continuation checkpoint — 2026-08-01

- Powstał osobny hosted projekt Supabase z zastosowaną migracją, 10 szablonami,
  włączonym RLS i dwoma potwierdzonymi zwykłymi kontami testowymi.
- Hosted RLS przechodzi 3/3; krytyczny Playwright przechodzi cały przepływ
  auth → pakiet → custom CRUD → review → rekomendacja → delete i pięć kolejnych
  powtórzeń bez niestabilności.
- Mobile CRUD na 360 px, kolejność fokusu klawiatury i konsola bez błędów
  przeszły lokalny smoke. Lokalne zrzuty kandydackie są w
  `context/evidence/screenshots/builder/`.
- Dwa uzupełniające indeksy FK są przygotowane w osobnej migracji. Bieżące
  połączenie MCP zachowało tryb read-only mimo odświeżenia OAuth, więc zdalne
  zastosowanie tej nieblokującej optymalizacji pozostaje do nowej sesji.
- Nadal nieukończone: publiczny signup/e-mail smoke, decyzja o Leaked Password
  Protection, zaufanie lokalnemu hookowi M3 i wysłanie formularzy. Worker,
  publiczny E2E i screenshoty są udokumentowane w
  `context/evidence/builder-public-verification-2026-08-01.md`.
