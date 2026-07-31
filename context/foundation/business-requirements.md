# Business requirements index

> Navigation and traceability only. The source of truth is
> `context/foundation/prd.md`; this file does not redefine requirements.

| Business outcome            | PRD contract                          | Delivery slice | Technical surface                                           | Verification/evidence                              |
| --------------------------- | ------------------------------------- | -------------- | ----------------------------------------------------------- | -------------------------------------------------- |
| Private learning account    | US-01; FR-001–FR-003; NFR-003         | S-01           | middleware, auth routes, owner-scoped API and RLS           | hosted two-user matrix; critical E2E               |
| Immediate useful content    | US-02; FR-004                         | S-02           | starter-pack endpoint, owner/template uniqueness, ten seeds | migration contract; repeat-call integration        |
| Full private item lifecycle | US-03/US-06; FR-005/FR-006/FR-012     | S-02           | concept CRUD, cascade delete, form/list UI                  | API integration; critical E2E delete               |
| Calibrated review           | US-04; FR-007–FR-009; NFR-006         | S-03           | review schema/endpoint, scoring engine, attempt history     | scoring unit suite; hosted persistence             |
| Next-topic guidance         | US-05; FR-010/FR-011; NFR-001/NFR-002 | S-04           | dashboard aggregate and recommendation UI                   | ranking unit tests; critical E2E; public smoke     |
| Safe invalid/empty behavior | US-07; NFR-004/NFR-005                | S-01–S-04      | common error envelope and UI states                         | schema tests; manual mobile/keyboard/console smoke |

Detailed contracts:

- API: `context/changes/ai-concept-compass-mvp/specs/api.md`
- Data: `context/changes/ai-concept-compass-mvp/specs/database.md`
- UI: `context/changes/ai-concept-compass-mvp/specs/ui.md`
- Plan/evidence status: `context/changes/ai-concept-compass-mvp/plan.md`
