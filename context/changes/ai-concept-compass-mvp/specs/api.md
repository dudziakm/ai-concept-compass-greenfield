# API contract — MVP

> Pre-implementation technical specification derived from PRD FR-001–FR-012.
> Identifiers are English; user-facing messages are Polish.

## Common boundary

- All `/api/concepts*`, `/api/starter-pack` and `/api/dashboard` routes require
  an authenticated user cookie. Missing identity returns `401`.
- JSON writes use `Content-Type: application/json` and are validated before the
  service call. Invalid JSON or fields return `400`.
- Error envelope: `{ "error": { "code": string, "message": string, "details"?: unknown } }`.
- Supported error statuses: `400`, `401`, `404`, `409`, `500`.
- A missing or non-owned concept returns `404`; no endpoint exposes whether a
  foreign identifier exists.

## Endpoints

| Method   | Path                        | Request                                 | Success                           |
| -------- | --------------------------- | --------------------------------------- | --------------------------------- |
| `GET`    | `/api/concepts`             | —                                       | `200 { concepts: Concept[] }`     |
| `POST`   | `/api/concepts`             | `CreateConceptInput`                    | `201 { concept }`                 |
| `GET`    | `/api/concepts/:id`         | —                                       | `200 { concept }`                 |
| `PATCH`  | `/api/concepts/:id`         | non-empty `Partial<CreateConceptInput>` | `200 { concept }`                 |
| `DELETE` | `/api/concepts/:id`         | —                                       | `204`, empty body                 |
| `POST`   | `/api/concepts/:id/reviews` | `{ confidence: 1..5, outcome: incorrect | partial                           | correct }` | `201 { attempt }` |
| `POST`   | `/api/starter-pack`         | —                                       | `200 { concepts, templateCount }` |
| `GET`    | `/api/dashboard`            | —                                       | `200 DashboardData`               |

Auth transport additionally provides `POST /api/auth/signup`,
`POST /api/auth/signin` and `POST /api/auth/signout`; their browser form
contract remains owned by the starter auth layer.

## Write models

`CreateConceptInput` requires trimmed `title` 2–120 characters, `description`
10–2000, `checkQuestion` 5–1000, `answerPattern` 5–2000 and one of five domain
identifiers. Patch accepts the same fields optionally but rejects an empty body.

`CreateReviewInput` requires an integer confidence from 1 through 5 and one of
the three outcomes. Computed values and timestamps are server-owned and are not
accepted from clients.

## Idempotency and concurrency

- `POST /api/starter-pack` is idempotent by owner/template uniqueness and
  conflict-ignore upsert.
- Concept create is not generally idempotent; custom concepts have no client
  idempotency key.
- Review create appends attempts. Concurrent reviews may read the same previous
  attempt; preventing that race is outside current MVP and should be revisited if
  multi-tab or offline submission becomes material.

## Verification

- Unit boundary: `src/lib/schemas.test.ts`.
- Route integration: `tests/api-contract.test.ts` covers the shared auth and
  error envelopes, invalid JSON/fields, hidden non-owner lookup, duplicate
  conflict, infrastructure failure and success statuses.
- Static contract: `tests/migration-contract.test.ts`.
- Hosted cross-layer scenario: `e2e/concept-review.spec.ts` (execution pending credentials).
- Gap: concurrent review remains outside MVP; hosted E2E execution remains
  pending account and environment configuration.
