---
change_id: ai-concept-compass-mvp
title: Deliver the AI Concept Compass MVP
status: implementing
created: 2026-07-31
updated: 2026-08-01
archived_at: null
---

# AI Concept Compass MVP

Deliver the smallest hosted learning loop that lets one authenticated learner
load ten authored concepts, manage a private collection, record confidence and
self-assessment, and receive a deterministic next-topic recommendation.

## Inputs

- `context/foundation/shape-notes.md`
- `context/foundation/prd.md`
- `context/foundation/business-requirements.md`
- `context/foundation/technical-requirements.md`
- `context/foundation/tech-stack.md`
- `context/foundation/infrastructure.md`
- `context/foundation/roadmap.md`
- `context/foundation/test-plan.md`

## Output contracts

- `research.md` records decisions and risks before implementation.
- `specs/` owns API, database and UI contracts.
- `plan.md` owns implementation order and progress.
- `verification.md` separates local executable evidence from hosted/manual work.
- An edit confirmation keeps the learner's context: the saved concept retains its
  list position, receives temporary focus and highlighting, and is announced to
  assistive technology.
