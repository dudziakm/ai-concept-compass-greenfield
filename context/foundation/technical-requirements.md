# Technical requirements index

> Navigation and traceability only. Stack decisions live in `tech-stack.md`,
> platform decisions in `infrastructure.md`, and implementation contracts in the
> change specifications.

| Technical requirement                    | Decision/contract                      | Implementation anchor                                   | Gate                                | Current evidence status       |
| ---------------------------------------- | -------------------------------------- | ------------------------------------------------------- | ----------------------------------- | ----------------------------- |
| Typed server-rendered web app            | `tech-stack.md` starter/language hints | `astro.config.mjs`, `tsconfig.json`, Astro/React source | typecheck + build                   | local pass                    |
| Hosted auth and relational ownership     | PRD Access Control; database spec      | Supabase SSR client, middleware, migration RLS          | hosted two-user RLS                 | pending                       |
| No administrative key in runtime         | database spec security model           | env schema + cookie user client                         | secret review + hosted deny tests   | source clean; hosted pending  |
| Validation at every write boundary       | API spec                               | `src/lib/schemas.ts`, common parser                     | unit/API integration                | unit + route matrix pass      |
| Stable HTTP statuses/error envelope      | API spec                               | `src/lib/api.ts`, API routes                            | integration/E2E                     | route pass; hosted pending    |
| Deterministic time-aware scoring         | PRD Business Logic                     | `src/lib/scoring.ts`                                    | unit + coverage                     | local pass, 100% scope        |
| Idempotent starter and cascade lifecycle | database/API specs                     | migration + service upsert/delete                       | contract + hosted integration       | static pass; hosted pending   |
| Cloudflare Worker runtime                | `infrastructure.md`                    | adapter + `wrangler.jsonc`                              | production build + deploy smoke     | build pass; deploy pending    |
| Blocking shared quality                  | `test-plan.md` §5                      | CI workflow                                             | quality + hosted E2E                | local pass; hosted CI pending |
| Controlled release/rollback evidence     | `infrastructure.md`, deploy plan       | manual promotion                                        | public smoke + revision/run capture | pending human action          |

Version and dependency risk is recorded in
`context/evidence/security-audit.md`; the deferred Astro 7/adapter 14 upgrade is
explicitly outside the MVP change.
