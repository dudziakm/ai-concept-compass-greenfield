# AI Concept Compass — contributor instructions

## Read first

- Product intent and business rules: `context/foundation/prd.md`.
- Architecture and runtime decisions: `context/foundation/tech-stack.md` and
  `context/foundation/infrastructure.md`.
- Delivery order: `context/foundation/roadmap.md`.
- Active implementation contract: `context/changes/ai-concept-compass-mvp/`.
- Testing strategy: `context/foundation/test-plan.md`.

If code and a foundation document disagree, stop and identify the drift. Do
not silently rewrite product rules to match an implementation shortcut.

## Runtime and commands

- Use Node 22.14 from `.nvmrc` and npm. Do not replace the lockfile or package
  manager.
- Install with `npm ci` when reproducing CI and `npm install` only when
  intentionally changing dependencies.
- Local quality gate:
  `npm run lint && npm run typecheck && npm run test:coverage && npm run build`.
- Real browser flow: `npm run test:e2e`; it requires the four variables listed
  in `.env.example` plus a confirmed test account.
- Never run `supabase db reset`, production migrations, `wrangler deploy`, or
  authentication commands unless that external change is explicitly in scope.

## Code map

- `src/lib/scoring.ts` — pure deterministic review and recommendation rules.
  Pass `now` as an argument; never read the clock inside domain functions.
- `src/lib/schemas.ts` — Zod contracts at every write boundary.
- `src/lib/services/concept-service.ts` — authenticated Supabase access.
- `src/pages/api/` — thin HTTP adapters; use the shared response/error helpers.
- `src/components/dashboard/` — Polish product UI and client orchestration.
- `supabase/migrations/` — schema, seed data, indexes, cascade and RLS policies.
- `e2e/` — real authenticated Playwright journey; follow `e2e/AGENTS.md` too.
- `packages/code-reviewer/` — isolated Champion tooling, not application
  runtime code.

## Product invariants

- A user may read and mutate only their own concepts and review attempts.
- The browser uses only the public Supabase key. Never introduce a
  `service_role` key into application or CI runtime.
- Starter-pack loading is idempotent per user and template.
- Deleting a concept deletes its attempts.
- Confidence is 1–5; outcome is exactly `incorrect`, `partial`, or `correct`.
- Keep the scoring formulas and review intervals aligned with the PRD. Any
  formula change requires updated unit tests and a PRD decision.
- MVP content is original and may cite the official AWS AIF-C01 guide; do not
  copy exam questions.

## Implementation rules

- Code identifiers and API contracts are English; shipped UI and product docs
  are Polish.
- Validate request bodies before persistence. Preserve the JSON error contract
  and the documented 400/401/404/409/500 semantics.
- Prefer pure functions for domain decisions and typed adapters at I/O
  boundaries.
- Keep API routes thin. Put reusable persistence behavior in services and
  reusable calculations in `src/lib/`.
- Do not add LLM calls, payments, teams/roles, imports, notifications,
  gamification or advanced SRS before the MVP change is formally expanded.
- Do not upgrade to Astro 7 during the certification sprint.

## Testing expectations

- Scoring changes require table-driven Vitest cases for boundaries, streaks,
  overdue behavior and the 0–100 clamp.
- Schema/API changes require invalid-input and authorization cases.
- Database changes require migration contract assertions plus a real hosted
  Supabase RLS verification before release.
- User-visible critical-flow changes require updating the authenticated
  Playwright journey, not only DOM visibility checks.
- A skipped or secret-gated E2E run is not evidence of a passing E2E gate.

## Security and secrets

- Commit only `.env.example`; never print or persist credential values.
- GitHub workflows use least privilege. Fork pull requests must not receive
  provider secrets.
- RLS is defense in depth and must remain enabled on all user-owned tables.
- Treat logs, screenshots and CI artifacts as potentially public; redact email
  addresses, tokens and private project identifiers.

## Change workflow

1. Open or update `context/changes/<change-id>/change.md`.
2. Ground non-trivial changes in `research.md` and resolve open decisions.
3. Implement only against an approved `plan.md`; keep its Automated Progress
   table factual.
4. Run the proportional local gate and record evidence.
5. Archive a change only when code, documentation and required verification
   agree. Manual hosted checks stay explicitly pending until someone performs
   them.
