---
change_id: builder-public-e2e-stability
title: Make the hosted critical E2E journey deterministic and recovery-aware
status: implementing
created: 2026-08-01
updated: 2026-08-01
archived_at: null
---

# Builder public E2E stability

The authenticated public journey must identify the edited concept inside the
concept collection, not by a global text match that becomes ambiguous when the
review panel renders the same title. During initial dashboard loading, the test
must use the product's visible retry action if the deliberately supported
recoverable error state appears, then require a successful dashboard.

## Boundaries

- Touch only the authenticated Playwright setup and critical-flow test plus this
  change package.
- Do not change application business logic, suppress API failures, use fixed
  sleeps, weaken assertions or modify hosted data beyond the test account's
  existing reset/cleanup behaviour.
- A public retry remains observable evidence; it never converts a persistent
  error into a pass.
