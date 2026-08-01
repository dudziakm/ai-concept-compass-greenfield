# Builder — public verification record (2026-08-01)

## Immutable CI evidence

- Merged Builder PR: [#1](https://github.com/dudziakm/ai-concept-compass-greenfield/pull/1),
  merge commit [`28bc365`](https://github.com/dudziakm/ai-concept-compass-greenfield/commit/28bc365a51c3d156706b95ae9eb05e5d107d334b).
- Full CI for that merge commit: [run 30715121885](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30715121885)
  — `quality`, `e2e`, and `rls` all passed.
- The preceding branch CI is independently green:
  [run 30714854957](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30714854957)
  for [`cc3d367`](https://github.com/dudziakm/ai-concept-compass-greenfield/commit/cc3d3671630d8c9c8563a9c17cd5c1fff4c25eee).

## Current public deployment

- URL: <https://ai-concept-compass.dudziak-michal.workers.dev>
- Cloudflare deployment: `8c09f7d2-a731-497f-a8e3-4223ab652ff6`.
- Worker version: `8908bbab-5dfb-47e4-9edd-dc55b3fa5561`.
- UTC timestamp: `2026-08-01T19:20:37.668729Z`.
- Release message: `Release 1950631 rebuilt: stable concept ordering`.

The release was rebuilt from the verified hardening revision. Subsequent
Builder changes in the merged PR affect E2E evidence only, not Worker runtime
behaviour; the fresh public flow below is therefore the functional proof.

## Fresh browser proof

With the confirmed dedicated E2E account, this command passed against the
public Worker on 2026-08-01:

```bash
E2E_BASE_URL=https://ai-concept-compass.dudziak-michal.workers.dev npm run test:e2e
# 4 passed: auth + starter pack; CRUD/review/recommendation; recovery; seed
```

The captured browser probes also found zero unexpected console errors and zero
uncaught page errors:

- `screenshots/builder/public-signin.png`
- `screenshots/builder/public-desktop-dashboard.png`
- `screenshots/builder/public-mobile-dashboard.png` (360 × 800)
- `screenshots/builder/public-review-recommendation.png`

The review screenshot uses only the resettable E2E account and the script ran
the full resettable E2E suite after capture.

## Still manual

This record is not evidence of a fresh user email-confirmation journey, the
Supabase Leaked Password Protection decision, a trusted local M3 hook run, or
form submission. Those actions remain explicitly pending.
