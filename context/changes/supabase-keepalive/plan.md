# Implementation plan — Supabase keep-alive

## Phase 1: Scheduled hosted activity and verification

### Automated success criteria

- `scripts/keepalive.mjs` fails with a named list when any of `SUPABASE_URL`,
  `SUPABASE_KEY`, `E2E_USER_EMAIL`, `E2E_USER_PASSWORD` is absent, and exits
  non-zero without contacting the project.
- Against the hosted project it performs a password sign-in, one authenticated
  read of each of `concept_templates`, `concepts` and `review_attempts`, and a
  `scope=local` sign-out, printing one status code per step and nothing else.
- Every request retries up to three times with linear backoff and a 15-second
  timeout; the failure message names the step and the last status or transport
  error.
- `.github/workflows/keepalive.yml` declares `permissions: {}` at workflow
  level, grants only `contents: read` to the job that checks out, pins both
  actions to the SHAs already used by `ci.yml`, and sets
  `persist-credentials: false`.
- Its `supabase` job joins concurrency group `hosted-e2e-account` with
  `cancel-in-progress: false`; `hosted-verification.yml` joins the same group
  for E2E and `hosted-rls-accounts` for RLS.
- `.github/workflows/hosted-verification.yml` runs `npm run test:e2e` with
  `E2E_BASE_URL` pointing at the deployed Worker, so `playwright.config.ts`
  skips its own dev server, plus `npm run test:rls`.
- Both new workflows expose `workflow_dispatch`, so the schedule can be proven
  on demand rather than waited for.
- `npm run workflow:check`, `npm run lint`, `npm run typecheck` and
  `npm run test:coverage` pass unchanged. No required artifact moves.
- `actionlint` reports no findings on either new workflow.

### Manual success criteria

- A `workflow_dispatch` run of Keep-alive on `main` finishes green, and its
  public log shows status codes only — no URL, token or account address.
- The Supabase project stays out of the paused state through the certification
  review window.
- A `workflow_dispatch` run of Hosted verification finishes green against the
  deployed Worker.

### Work

1. Write the dependency-free keep-alive script against the hosted project.
2. Add the twice-daily keep-alive workflow and the public-deployment probe.
3. Add the weekly hosted verification workflow reusing the existing suites.
4. Record the change, its decisions and the 60-day scheduling limitation.
5. Run the local gate, then prove both workflows by manual dispatch on `main`.

## Progress

### Phase 1: Scheduled hosted activity and verification

#### Automated

- [x] 1.1 Add `scripts/keepalive.mjs`
- [x] 1.2 Add `.github/workflows/keepalive.yml`
- [x] 1.3 Add `.github/workflows/hosted-verification.yml`
- [x] 1.4 Local gate green on the change branch
- [x] 1.5 CI green on the pull request

#### Manual

- [x] 1.6 Keep-alive dispatched on `main` and green, log free of secrets
- [x] 1.7 Hosted verification dispatched on `main` and green
- [ ] 1.8 Project confirmed unpaused after the first full week of schedules

## Verification

Recorded 11 August 2026, against `aee8bf5` on `main`.

| Check                         | Evidence                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| Local script, happy path      | Sign-in 200, three reads 200, sign-out 204 against the hosted project               |
| Local script, missing env     | Exit 1 naming all four absent variables, no request attempted                       |
| Local gate                    | `lint`, `typecheck`, `workflow:check` clean; `actionlint` and `zizmor` no findings  |
| Pull request #18              | CI run `31492571983` — `quality`, `e2e` and `rls` all pass; AI gate advisory pass   |
| Keep-alive on `main`          | Run `31492943691` green; log shows status codes only, deployment probe `GET /: 200` |
| Hosted verification on `main` | Run `31493004574` green; 4 Playwright specs against the deployed Worker, RLS pass   |

Row 1.8 stays open deliberately: it can only be answered by the project still
being unpaused after a full seven-day window of scheduled runs, so the earliest
honest date is 18 August 2026.

Pre-existing and out of scope: the pinned `actions/checkout` and
`actions/setup-node` releases target Node 20, so every workflow in the
repository carries a deprecation annotation. Bumping those pins is a separate
change that touches `ci.yml` and the release pipeline too.
