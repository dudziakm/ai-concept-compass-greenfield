---
change_id: supabase-keepalive
title: Keep the hosted Supabase project awake and prove the deployment still works
status: implemented
created: 2026-08-11
updated: 2026-08-11
archived_at: null
---

# Supabase keep-alive and scheduled hosted verification

Supabase warned that the hosted Free-plan project is a candidate for automatic
pausing. Free-plan projects are paused when they receive too little _user
database_ activity over a rolling seven-day window, and this project's only
sources of such activity are the `e2e` and `rls` CI jobs, which run on push and
pull request. The last push was 5 August 2026; since then activity has been
effectively zero.

Two facts make the obvious workarounds useless:

- Requesting the deployed Worker anonymously does not reach Supabase.
  `src/middleware.ts` calls `supabase.auth.getUser()`, which short-circuits with
  `AuthSessionMissingError` when the request carries no session cookie. No
  session, no network call, no activity.
- CI cannot be the heartbeat. It is triggered by repository events, and a
  submitted repository is deliberately quiet.

A paused project would take the deployment down exactly while certification
reviewers may open it. Restoring a paused project is possible for 90 days but is
manual and takes minutes, and it fails at the worst moment: when someone else is
looking.

## Scope

- `scripts/keepalive.mjs`
- `.github/workflows/keepalive.yml`
- `.github/workflows/hosted-verification.yml`
- this change and its implementation plan

## Boundaries

- Reuse the repository secrets CI already defines. Do not add secrets, and never
  use `service_role`.
- Run logs are public: print step names and status codes only, never URLs,
  tokens, account addresses or row contents.
- Keep-alive must not depend on anything that can flake. It performs plain HTTP
  requests, retries them, and shares no step with the browser test suite.
- Sign out with `scope=local`. The default global scope revokes every refresh
  token for the shared account and would invalidate a concurrent E2E session.
- Join the existing `hosted-e2e-account` and `hosted-rls-accounts` concurrency
  groups so scheduled runs queue behind CI instead of racing it for the shared
  hosted accounts.
- Do not change application code, business rules, migrations or RLS policies.
- Do not deploy, run migrations or touch the legacy `my10xCards` project. That
  project is already inactive, its anon key is exposed in public history, and
  keeping it awake is not wanted.

## Decisions

- **GitHub Actions over a Cloudflare cron trigger.** The app is already on
  Workers, but `@astrojs/cloudflare` does not expose a `scheduled` handler, so a
  cron trigger would mean wrapping the server entrypoint in a custom worker —
  application-runtime surgery to solve an operations problem. Actions costs
  nothing on a public repository and reuses the secrets already configured.
- **Twice a day, at off-peak minutes.** The Supabase guidance is "a few user
  requests to the database each day". GitHub's scheduler is best-effort and
  drops runs under load, so two attempts a day keep a wide margin under the
  seven-day threshold even after consecutive misses.
- **Keep-alive and verification are separate workflows.** If the weekly browser
  suite flakes, the heartbeat must still have happened. Merging them would put
  the project's uptime behind the least reliable job in the repository.

## Known limitation

GitHub silently disables scheduled workflows in a public repository after 60
days with no repository activity. Merging this change resets that clock to
about 10 October 2026. Beyond that date the schedule needs either a push or a
manual re-enable from the Actions tab (`gh workflow enable keepalive.yml`).
Upgrading the Supabase organisation to a paid plan removes the pausing
behaviour altogether and is the only option with no operational tail.
