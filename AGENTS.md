# AI Concept Compass — contributor instructions

This file is the tool-neutral delivery contract. Every agent and every human
follows it. `CLAUDE.md` imports it, so Claude Code loads it automatically; other
tools must read it directly.

## Development environment

- **Claude Code is the default.** Open this repository — or the target worktree —
  as the working directory so `CLAUDE.md`, `.claude/settings.json` and `.mcp.json`
  all load. The `PostToolUse` hook in `.claude/settings.json` is the default local
  feedback path.
- The repository installs its own published `@dudziakm/ai-toolkit` to configure
  itself: `npm run toolkit:install` writes `.claude/skills/` and the rules block in
  `CLAUDE.md`. Both are committed. Do not hand-edit either — re-run the script.
- Codex remains a supported compatible path through `.codex/hooks.json`. It
  requires the owner to trust the hook definition manually in `/hooks`.
- `.mcp.json` declares the Supabase and Cloudflare MCP servers. They authenticate
  interactively over OAuth on first use; no credential is stored in the repository.

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
  intentionally changing dependencies. The reviewer package installs separately:
  `npm ci --prefix packages/code-reviewer`.
- Local quality gates: `npm run verify:fast` for ordinary edits and
  `npm run verify:full` before opening a pull request. Neither implies
  `npm run test:e2e` or `npm run test:rls`; run those deliberately when their
  hosted credentials are available.
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

## CI and workflow safety

- `quality`, `e2e` and `rls` are the three deterministic merge gates and must stay
  independently runnable. `.github/rulesets/main.json` records the intended branch
  ruleset; GitHub does not apply it from the repository, so treat it as the
  reference to reconcile against, not as enforcement.
- The AI Code Review Gate is advisory. Do not promote it to a required check
  before a real fail/pass/retry lifecycle has been demonstrated with a configured
  provider key.
- Pin action versions and document every new permission or secret in the pull
  request that introduces it.
- Do not weaken branch protection, RLS checks, artifact redaction or secret
  handling to make a pipeline pass.

## Change workflow

1. Open or update `context/changes/<change-id>/change.md`.
2. Ground non-trivial changes in `research.md` and resolve open decisions.
3. Implement only against an approved `plan.md`; keep its Automated Progress
   table factual.
4. Run the proportional local gate and record evidence.
5. Archive a change only when code, documentation and required verification
   agree. Manual hosted checks stay explicitly pending until someone performs
   them.
