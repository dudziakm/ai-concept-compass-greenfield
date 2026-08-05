---
project: "AI Concept Compass"
version: 1
status: active
created: 2026-07-31
updated: 2026-08-05
prd_version: 1
main_goal: speed
top_blocker: external
evidence_quality: planned-before-implementation
---

# Roadmap: AI Concept Compass

> Derived from `context/foundation/prd.md` (v1) before scaffolding. Status tracks
> delivery evidence, not the mere presence of source files.

## Vision recap

The product helps a Polish-speaking exam learner detect when confidence exceeds
knowledge and choose the next concept to review. Its distinguishing mechanism is
a deterministic calibration score, not content generation.

## North star

**S-04: the learner completes a review and receives the next recommendation** —
this is the north star, meaning the smallest end-to-end slice whose successful
delivery proves the core product hypothesis. CRUD and auth matter only when they
support that learning outcome.

## At a glance

| ID   | Change ID                         | Outcome (user can …)                                                            | Prerequisites         | PRD refs                                                     | Status |
| ---- | --------------------------------- | ------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ | ------ |
| F-01 | hosted-mvp-evidence               | (foundation) run the product against hosted services and retain public evidence | Human account access  | NFR-002, NFR-003, NFR-005; Open Question 3                   | done   |
| S-01 | private-learning-shell            | register, sign in and reach a private empty learning area                       | F-01 for hosted proof | US-01, FR-001, FR-002, FR-003, NFR-003                       | done   |
| S-02 | starter-pack-concept-crud         | load ten concepts and manage a private collection without duplicates            | S-01                  | US-02, US-03, US-06, FR-004, FR-005, FR-006, FR-012, NFR-004 | done   |
| S-03 | calibrated-concept-review         | declare confidence and persist a scored review                                  | S-02                  | US-04, FR-007, FR-008, FR-009, NFR-006                       | done   |
| S-04 | learning-recommendation-dashboard | see the next concept and five-domain progress                                   | S-03                  | US-05, FR-010, FR-011, NFR-001, NFR-002, NFR-005             | done   |

## Baseline

Updated after the green CI run on `main` (run id 31016045921, head SHA 9706d9b, 2026-08-05).

- **Frontend/backend/data/auth:** implemented with Astro/React, API routes and Supabase contracts.
- **Starter:** imported after planning in commit `3397461`.
- **Deploy/observability:** hosted Supabase accounts exist and the public URL is live at
  https://ai-concept-compass.dudziak-michal.workers.dev.

## Foundations

### F-01: Hosted MVP evidence

- **Outcome:** (foundation) hosted database/auth and Worker environment exist, with public URL, revision, smoke result and screenshots retained.
- **Change ID:** hosted-mvp-evidence
- **PRD refs:** NFR-002, NFR-003, NFR-005; Open Question 3
- **Unlocks:** hosted verification for S-01, S-02, S-03 and S-04
- **Prerequisites:** Human Supabase and Cloudflare account access
- **Parallel with:** —
- **Blockers (resolved):** human authentication, hosted project creation and secret entry
- **Unknowns (resolved):** the Worker URL is
  https://ai-concept-compass.dudziak-michal.workers.dev and the database region is
  `eu-central-1`.
- **Risk:** claiming completion from local code would hide the only environment boundary not yet exercised.
- **Evidence:** CI run 31016045921 — `quality`, `e2e` and `rls` all green; public URL live.
- **Status:** done

## Slices

### S-01: Private learning shell

- **Outcome:** user can register, sign in, sign out and reach an empty private dashboard.
- **Change ID:** private-learning-shell
- **PRD refs:** US-01, FR-001, FR-002, FR-003, NFR-003
- **Prerequisites:** F-01 for hosted proof
- **Parallel with:** —
- **Blockers (resolved):** hosted environment for final proof
- **Unknowns (resolved):**
  - Does signup/login and route protection work in the hosted environment? — yes; `e2e/auth.setup.ts` and `e2e/seed.spec.ts` are green against hosted Supabase.
- **Risk:** all later data is unsafe if identity and ownership are treated as UI-only checks.
- **Evidence:** CI run 31016045921.
- **Status:** done

### S-02: Starter pack and concept CRUD

- **Outcome:** user can idempotently load ten concepts and create, read, edit or delete only their own items and history.
- **Change ID:** starter-pack-concept-crud
- **PRD refs:** US-02, US-03, US-06, FR-004, FR-005, FR-006, FR-012, NFR-004
- **Prerequisites:** S-01
- **Parallel with:** —
- **Blockers (resolved):** hosted environment for cross-account proof
- **Unknowns (resolved):**
  - Does the hosted two-user and retry/lifecycle matrix pass? — yes; the `rls` job runs 3 tests across two real accounts.
- **Risk:** loading and ownership must be enforced at persistence time or retries and crafted requests corrupt the collection.
- **Evidence:** CI run 31016045921.
- **Status:** done

### S-03: Calibrated concept review

- **Outcome:** user can declare confidence, self-assess and persist deterministic mastery, calibration, priority and next-review values.
- **Change ID:** calibrated-concept-review
- **PRD refs:** US-04, FR-007, FR-008, FR-009, NFR-006
- **Prerequisites:** S-02
- **Parallel with:** —
- **Blockers (resolved):** hosted environment for end-to-end proof
- **Unknowns (resolved):**
  - Does the hosted review persist the same result protected by unit tests? — yes; `e2e/concept-review.spec.ts` asserts the scored outcome against the hosted database.
- **Risk:** an implementation-derived test oracle could preserve an incorrect scoring formula, so examples trace to the PRD rule.
- **Evidence:** CI run 31016045921.
- **Status:** done

### S-04: Learning recommendation dashboard

- **Outcome:** user can see one next concept, due count, average mastery and progress in five domains after review.
- **Change ID:** learning-recommendation-dashboard
- **PRD refs:** US-05, FR-010, FR-011, NFR-001, NFR-002, NFR-005
- **Prerequisites:** S-03
- **Parallel with:** —
- **Blockers (resolved):** public environment, mobile smoke and hosted critical-path E2E
- **Unknowns (resolved):**
  - Does the public critical path pass E2E and mobile smoke without console errors? — yes; 4 authenticated Playwright tests pass and the public screenshots record the mobile viewport.
- **Risk:** aggregate UI can appear correct while ordering or cross-layer refresh is broken; the final check must cross UI, API and database.
- **Evidence:** CI run 31016045921.
- **Status:** done

## Backlog Handoff

| Roadmap ID | Change ID                         | Suggested issue title                   | Ready for `/10x-plan` | Notes                                 |
| ---------- | --------------------------------- | --------------------------------------- | --------------------- | ------------------------------------- |
| F-01       | hosted-mvp-evidence               | Deploy and retain hosted MVP evidence   | no                    | Requires human account access.        |
| S-01       | private-learning-shell            | Deliver private auth-to-dashboard slice | yes                   | Implement after the starter baseline. |
| S-02       | starter-pack-concept-crud         | Deliver private starter pack and CRUD   | yes                   | Requires S-01 ownership boundary.     |
| S-03       | calibrated-concept-review         | Deliver deterministic calibrated review | yes                   | Requires S-02 persistence.            |
| S-04       | learning-recommendation-dashboard | Deliver recommendation dashboard        | yes                   | Requires S-03 scoring.                |

The first delivery change `ai-concept-compass-mvp` groups the slices to fit the
short certification sprint. Later work should open one change ID per roadmap row.

## Open Roadmap Questions

1. **What is the public production URL and Supabase region?** — Owner: user. Block: F-01 and final proof for S-01–S-04.
2. **Does real usage exceed the `small` scale assumption?** — Owner: product owner. Block: no MVP slice; revisit after initial telemetry.
3. **Do learners understand the self-assessment flow?** — Owner: product owner. Block: post-MVP optimization, not technical completion.

## Parked

- **LLM conversation and generated content** — parked because deterministic calibration is the MVP value.
- **Automatic answer grading** — parked until self-assessment usability is validated.
- **Payments, teams and admin roles** — parked because the primary persona is a single learner.
- **PDF/CSV import, notifications, gamification, advanced SRS and charts** — parked as scope not needed for the north-star flow.
- **Native/offline app and production-scale HA** — parked beyond MVP quality targets.

## Done

- **F-01: Hosted MVP evidence** — hosted Supabase accounts and the public Worker URL exist
  (https://ai-concept-compass.dudziak-michal.workers.dev). Proven by CI run 31016045921
  (head SHA 9706d9b, 2026-08-05): quality, e2e and rls all green.
- **S-01: Private learning shell** — proven by CI run 31016045921.
- **S-02: Starter pack and concept CRUD** — proven by CI run 31016045921.
- **S-03: Calibrated concept review** — proven by CI run 31016045921.
- **S-04: Learning recommendation dashboard** — proven by CI run 31016045921.
