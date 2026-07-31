# Test Plan

> Phased test rollout for this project. Strategy is frozen at the top
> (§1–§5); cookbook patterns at the bottom (§6) fill in as phases ship.
> Read before writing any new test.
>
> Refresh: re-run `/10x-test-plan --refresh` when stale (see §8).
>
> Last updated: 2026-07-31

> **Planning notice:** written before scaffolding from product risks and explicit
> acceptance criteria. No separate test-strategy interview was conducted.

## 1. Strategy

Tests follow three non-negotiable principles for this project:

1. **Cost × signal.** The cheapest test that gives a real signal for the risk
   wins. Pure scoring belongs in unit tests; ownership and persistence require a
   real database boundary; only the critical cross-layer flow earns E2E.
2. **User concerns are first-class evidence.** Isolation, a five-minute first
   result and a useful next recommendation are product outcomes, not internal
   implementation details.
3. **Risks are scenarios, not code locations.** This plan documents what can
   fail and why it matters. Per-change research identifies the concrete paths.
   If plan assumptions and live research disagree, research wins.

Expected hot-spot scope: domain scoring, API boundaries, authenticated data,
dashboard state and the hosted critical flow. A new repository has no churn
history, so impact and boundary count carry more weight than commit frequency.

## 2. Risk Map

| #   | Risk (failure scenario)                                                                                   | Impact | Likelihood | Source (evidence — not anchor)                                         |
| --- | --------------------------------------------------------------------------------------------------------- | ------ | ---------- | ---------------------------------------------------------------------- |
| 1   | A review produces wrong mastery, next date or recommendation, sending the learner to the wrong topic.     | High   | High       | PRD §Business Logic; roadmap S-03/S-04; provided acceptance rules.     |
| 2   | One authenticated account can read or mutate another account's concepts or attempts.                      | High   | Medium     | PRD §Access Control and NFR-003; roadmap S-01/S-02.                    |
| 3   | The UI appears complete locally but the hosted auth → pack → review → recommendation flow fails.          | High   | High       | PRD US-01–US-05; roadmap F-01; current missing hosted evidence.        |
| 4   | Retrying the starter pack creates duplicates, or deleting a concept leaves orphaned review history.       | Medium | Medium     | PRD US-02/US-06 and FR-004/FR-012.                                     |
| 5   | Malformed confidence, outcome or concept content reaches persistent state or produces an ambiguous error. | Medium | Medium     | PRD NFR-004 and US-03/US-04 acceptance criteria.                       |
| 6   | A deployed revision or schema differs from the green revision, making rollback or evidence unreliable.    | High   | Medium     | infrastructure risk register; roadmap F-01; manual promotion decision. |

### Risk Response Guidance

| Risk | What would prove protection                                                                                    | Must challenge                                                     | Context `/10x-research` must ground                                                | Likely cheapest layer      | Anti-pattern to avoid      |
| ---- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | -------------------------- | -------------------------- |
| #1   | Mutating any documented formula or tie-break makes a test fail.                                                | Do not copy calculations from implementation into expected values. | Domain inputs, prior-attempt ordering, time injection, ranking guarantee.          | unit                       | implementation mirror      |
| #2   | Two real users cannot select, update, delete or insert across ownership.                                       | Filtering in application code alone is not authorization proof.    | Session propagation, owner predicate, database policy and error semantics.         | database integration + RLS | mocked auth only           |
| #3   | A confirmed account completes the browser flow against hosted services and sees the persisted business result. | A rendered heading does not prove API/database integration.        | Auth fixture, cleanup, endpoint boundary, persisted state and redirect URLs.       | one E2E                    | happy-path visibility only |
| #4   | Repeated load stays at ten templates and delete removes dependent attempts.                                    | A static migration substring is weaker than runtime behavior.      | Uniqueness constraint, retry semantics, relationship lifecycle and fixture source. | integration/contract       | assertion on response only |
| #5   | Boundary values pass; outside values and invalid JSON return stable 400 without writes.                        | Browser constraints do not protect direct API calls.               | Request schemas, response error contract and write boundary.                       | unit + API integration     | client-only validation     |
| #6   | Evidence maps deploy URL and run to an immutable revision; rollback steps are exercised without data loss.     | A successful local build is not a production deploy.               | Promotion mechanism, secrets boundary, schema application and version identity.    | CI + manual smoke          | unrecorded laptop deploy   |

## 3. Phased Rollout

The certification sprint uses one MVP change folder. Future rollouts should use
one distinct change folder per roadmap row.

| #   | Phase name                    | Goal (one line)                                                              | Risks covered | Test types              | Status       | Change folder                             |
| --- | ----------------------------- | ---------------------------------------------------------------------------- | ------------- | ----------------------- | ------------ | ----------------------------------------- |
| 1   | Domain and boundary contracts | Make incorrect scoring and invalid writes fail cheaply.                      | #1, #5        | unit + contract         | implemented  | `context/changes/ai-concept-compass-mvp/` |
| 2   | Persistence and ownership     | Prove lifecycle and cross-account isolation at the database boundary.        | #2, #4        | integration + RLS       | implementing | `context/changes/ai-concept-compass-mvp/` |
| 3   | Hosted critical path          | Exercise the full learner flow with real auth, API and persistence.          | #3            | e2e                     | planned      | `context/changes/ai-concept-compass-mvp/` |
| 4   | Shared release gates          | Bind quality, hosted E2E and immutable deployment evidence to merge/release. | #3, #6        | CI gates + manual smoke | implementing | `context/changes/ai-concept-compass-mvp/` |

## 4. Stack

| Layer                    | Tool                                                 | Version | Notes                                                                  |
| ------------------------ | ---------------------------------------------------- | ------- | ---------------------------------------------------------------------- |
| unit + contract          | Vitest                                               | 4.1.10  | Co-located domain/schema tests and migration contract test.            |
| API integration          | Vitest route-contract suite                          | 4.1.10  | Auth, validation and 401/404/409/500 mappings without a real database. |
| database/RLS integration | Supabase JS against two ordinary hosted accounts     | 2.99.1  | Harness present; hosted execution remains pending credentials.         |
| e2e                      | Playwright                                           | 1.62.1  | Auth setup project plus one independently cleaned critical flow.       |
| accessibility            | semantic Playwright locators + manual keyboard smoke | —       | No axe-core dependency; add only through a scoped rollout.             |
| coverage                 | V8 provider                                          | 4.1.10  | 90% lines/functions/statements, 85% branches for scoring and schemas.  |

**Stack grounding tools (current session):**

- Docs: local manifests/config and course M3 references — versions and patterns
  inspected; checked: 2026-07-31.
- Search: none needed for test API recommendations — no external setup invented;
  checked: 2026-07-31.
- Runtime/browser: Playwright is configured locally but hosted execution was not
  available; checked: 2026-07-31.
- Provider/platform: repository GitHub workflow inspected; Supabase/Cloudflare
  credentials were not accessed; checked: 2026-07-31.

## 5. Quality Gates

| Gate                         | Where                | Required?                                           | Catches                                                  |
| ---------------------------- | -------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| lint + typecheck             | local + CI           | required                                            | syntax, type and accessibility lint drift                |
| unit + migration contract    | local + CI           | required                                            | scoring, schema and migration-contract regressions       |
| coverage thresholds          | local + CI           | required                                            | unexercised branches in the protected domain boundary    |
| production build             | local + CI           | required                                            | Astro/Worker integration and generated-type drift        |
| hosted critical E2E          | CI on PR             | required for release; pending credentials           | broken auth → API → DB → UI flow                         |
| two-user RLS runtime suite   | hosted test project  | required before final evidence; pending credentials | cross-account access and policy regressions              |
| public mobile/keyboard smoke | after deploy         | required before final evidence                      | environment, responsive and basic accessibility failures |
| dependency audit             | local/release review | advisory with recorded decision                     | known production dependency exposure                     |

## 6. Cookbook Patterns

### 6.1 Adding a unit test

- **Location:** next to the pure module under `src/lib/`.
- **Naming:** `<module>.test.ts`.
- **Reference test:** `src/lib/scoring.test.ts`.
- **Oracle policy:** expected values come from PRD formulas/examples, never from
  reimplementing the production helper inside the test.
- **Run locally:** `npm run test:run -- src/lib/scoring.test.ts`.

### 6.2 Adding a schema or migration contract test

- **Location:** schema tests next to `src/lib/schemas.ts`; repository-level SQL
  contract checks in `tests/`.
- **Reference tests:** `src/lib/schemas.test.ts` and
  `tests/migration-contract.test.ts`.
- **Run locally:** `npm run test:run`.
- **Limit:** text-level SQL checks are fast regression signals, not proof that
  hosted policy execution works.

### 6.3 Adding a database/RLS integration test

- **Location:** `tests/rls.integration.test.ts`.
- **Accounts:** two confirmed ordinary Supabase users; never a service-role client.
- **Configuration:** `SUPABASE_URL`, `SUPABASE_KEY` and the four
  `RLS_USER_A_*`/`RLS_USER_B_*` credential fields documented in `.env.example`.
- **Run locally:** `npm run test:rls`. A missing variable is a hard failure, not
  a skipped proof. The regular unit suite may skip this hosted-only file.
- **Protected cases:** foreign select/update/delete, forged owner insert,
  foreign review insert, owner access and cascade deletion.
- It must use two ordinary authenticated users and must not put a service-role key
  in application code or browser context.

### 6.4 Adding an e2e test

- **Rules:** `e2e/AGENTS.md` is binding.
- **Seed:** `e2e/seed.spec.ts`; critical reference:
  `e2e/concept-review.spec.ts`.
- **Fixture:** authenticate once through the setup project and use stored state.
- **Independence:** create unique data, wait on observable state and clean up in
  `finally`; never use timeout sleeps or structure selectors.
- **Run locally:** `npm run test:e2e` with the four documented environment values.

### 6.5 Adding a new API endpoint test

- Start from its risk and decide whether Zod/unit, hosted integration or E2E is
  the cheapest boundary that can observe the failure.
- Assert both response shape/status and persistent side effect when persistence
  is the risk.
- Reuse the common error contract documented in the change's API specification.

### 6.6 Per-rollout-phase notes

- Phase 1: injecting `now` is the determinism seam for scoring and ranking.
- Phase 3: an E2E file existing on disk is not completion; the run must target a
  configured hosted environment and preserve its result.

## 7. What We Deliberately Don't Test

These exclusions derive from PRD non-goals, not a fabricated test-plan interview.

- **LLM quality/safety** — no model call exists in MVP. Re-evaluate if generated
  content or automatic grading is introduced.
- **Payments, team roles and admin UI** — outside the product surface.
- **Large-scale performance and multi-region failover** — beyond the stated small
  scale; replace with observability when scale assumption changes.
- **Every browser/viewport combination in E2E** — one stable Chromium critical
  path plus manual mainstream-browser/mobile smoke balances signal and cost.
- **Visual pixel snapshots for the whole app** — no stable design-regression need
  has been established; semantic behavior has priority.

## 8. Freshness Ledger

- Strategy (§1–§5) last reviewed: 2026-07-31
- Stack versions last verified: 2026-07-31
- AI-native tool references last verified: 2026-07-31 (none selected)

Refresh (`/10x-test-plan --refresh`) when:

- a new top-three risk surfaces from the roadmap or an incident;
- a recommended tool's checked date is older than three months;
- the stack changes, especially Astro/adapter, auth provider or test runner;
- hosted RLS/E2E lands and the cookbook can replace its TBD entry;
- §7 negative space no longer matches the product scope.
