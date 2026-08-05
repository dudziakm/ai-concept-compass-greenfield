# Verification status — AI Concept Compass MVP

Checked 2026-08-01 on the implementation worktree, a dedicated hosted Supabase
project and the public Cloudflare Worker.

## Local automated evidence

| Check                             | Status | Evidence                                                                                              |
| --------------------------------- | ------ | ----------------------------------------------------------------------------------------------------- |
| Workflow chain and traceability   | pass   | `npm run workflow:check`                                                                              |
| Lint                              | pass   | `npm run lint`                                                                                        |
| Astro typecheck                   | pass   | 0 errors                                                                                              |
| Unit/route/migration tests        | pass   | 50 local tests; 3 hosted RLS tests are run separately                                                 |
| Hosted two-user RLS               | pass   | 3/3 with two confirmed ordinary accounts                                                              |
| Protected coverage scope          | pass   | 100% statements/branches/functions/lines                                                              |
| Cloudflare Worker build           | pass   | `npm run build`                                                                                       |
| Post-edit learner context         | pass   | Critical Chromium flow preserves the edited card's order and verifies its Polish status and focus     |
| Public critical Playwright        | pass   | Fresh full public run: auth, CRUD/review/recommendation, recovery and seed — 4/4 passed; see [verification record](../../evidence/builder-public-verification-2026-08-01.md) |
| Public responsive/keyboard/console | pass  | Desktop and 360 px screenshots, keyboard focus probe, zero unexpected console or uncaught page errors |
| GitHub Actions quality            | pass   | [quality job in green merge CI](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30715121885/job/91409300678) |
| Hosted CI E2E and RLS             | pass   | [run 30715121885](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30715121885) has green `e2e` and `rls` jobs |
| GitHub Actions quality (current)  | pass   | [run 31016045921](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/31016045921) on `main`, head `9706d9b`, 2026-08-05: `quality` 2m4s, `e2e` 2m9s, `rls` 44s |

## Hosted/manual evidence

| Check                                         | Status                                                                        |
| --------------------------------------------- | ----------------------------------------------------------------------------- |
| Hosted migration, 10 templates and FK indexes | pass                                                                          |
| Supabase security advisor                     | warn: leaked-password protection disabled                                     |
| Public Worker URL                             | verified: <https://ai-concept-compass.dudziak-michal.workers.dev>; fresh public E2E passes 4/4 |
| Cloudflare deployment                         | verified: deployment `8c09f7d2-a731-497f-a8e3-4223ab652ff6`, version `8908bbab-5dfb-47e4-9edd-dc55b3fa5561`, 2026-08-01 19:20:37 UTC |
| Signup email confirmation smoke               | pending a real inbox                                                          |
| Public mobile, keyboard and console smoke     | pass; screenshots and clean probes in builder public verification record     |
| Final screenshots                             | pass; public sign-in, dashboard, mobile and review/recommendation captured   |
| Mission Log submission                        | pending; requires personal fields and explicit final submission               |

## Accepted risk: migration ledger drift (2026-08-05)

The hosted Supabase migration ledger (`supabase_migrations.schema_migrations`)
holds one row, version `20260801170540` ("add_foreign_key_indexes"). The
repository declares two migration files instead:
`supabase/migrations/20260731190000_ai_concept_compass.sql` and
`supabase/migrations/20260801162000_add_foreign_key_indexes.sql`. Neither
version matches the ledger row. The main migration
(`20260731190000_ai_concept_compass.sql`) has zero `if not exists` guards
across its 7 bare `create policy` and bare `create table`/`create index`
statements, so running `supabase db push` against a clean clone would fail on
"relation already exists".

The hosted schema **content** does match the final state of the migration
files — 10 templates, RLS enabled on all 3 tables, and the FK indexes are all
present and correct on the live database. Only the ledger's bookkeeping is out
of step with the files on disk.

Repairing the ledger is a live mutation against the hosted project and is
deliberately deferred to after the certification deadline rather than
attempted five days out. This is recorded as an accepted, dated risk, not a
silent gap: the drift does not affect the live schema or any passing gate, but
a clean-clone deploy from these migration files would not currently succeed.

## Conclusion

Local quality gates, hosted RLS, current-code E2E and the deployed public flow
are green. The canonical merge CI has green `quality`, `e2e` and `rls` jobs.
Certification delivery is **not yet complete** only because the remaining
user-owned certification actions are deliberately narrow: fresh
signup/e-mail-confirmation smoke, a recorded Leaked Password Protection
decision, trusted M3-hook observation, and the user-owned Mission Log
submission. The full immutable/public record is
[builder-public-verification-2026-08-01.md](../../evidence/builder-public-verification-2026-08-01.md).
