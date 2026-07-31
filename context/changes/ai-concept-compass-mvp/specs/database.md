# Database contract — MVP

> Pre-implementation database contract. After Phase 2, the migration under
> `supabase/migrations/` becomes the executable source of truth.

## Entities and lifecycle

| Entity              | Ownership                        | Mutability                       | Lifecycle                                                          |
| ------------------- | -------------------------------- | -------------------------------- | ------------------------------------------------------------------ |
| `concept_templates` | global                           | read-only to authenticated users | seeded by migration; stable deterministic IDs                      |
| `concepts`          | `user_id`                        | owner CRUD                       | account delete cascades; template delete only clears `template_id` |
| `review_attempts`   | `user_id` and owned `concept_id` | append/read in MVP               | concept or account delete cascades                                 |

## Invariants

1. A concept and review attempt always have an auth user owner.
2. An authenticated user reads and mutates only rows whose `user_id` equals the
   current auth identity.
3. A review can be inserted only when its concept belongs to the same identity.
4. Confidence is 1–5; outcome has three values; all computed scores are 0–100.
5. At most one copy of a template exists per user.
6. Deleting a concept removes its review history.
7. Ten starter templates use deterministic IDs and an upsert so the migration is
   repeatable.

## Query support

- `concepts_user_id_idx` supports the owner collection.
- `review_attempts_user_concept_reviewed_idx` supports latest attempt lookup.
- `review_attempts_user_due_idx` supports due-date access, although the current
  dashboard reads all owner attempts before aggregating.

## Security model

RLS is enabled for all three tables. Authenticated users have global `SELECT` on
templates. Concepts have owner-scoped `SELECT`, `INSERT`, `UPDATE`, `DELETE`.
Attempts have owner-scoped `SELECT` and guarded `INSERT`; no update/delete policy
exists, so attempts are append-only except through parent/account cascade.

The application uses an anon/publishable key plus user session. A service-role
key must never be introduced into browser or application runtime.

## Migration and rollback

The initial migration is destructive to roll back because dropping these tables
would delete user history. Before production data exists, rollback may recreate
the hosted project. After data exists, use additive forward migrations and a
verified export/restore plan; application rollback does not automatically undo
schema changes.

## Verification

`tests/migration-contract.test.ts` checks the SQL contract text.
`tests/rls.integration.test.ts` is the executable two-account harness for
read/update/delete/insert denial, owner access and cascade deletion. It uses
only the anon/publishable key and ordinary confirmed users. Its hosted run and
retained CI evidence remains pending until credentials exist; a harness on
disk will not be presented as a passing RLS proof.
