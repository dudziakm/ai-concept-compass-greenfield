---
change_id: champion-live-evals
title: Add explicit three-model Champion evaluation and shared review skill
status: implementing
created: 2026-08-01
---

# Champion live evaluations and shared skill

Add the missing M5L3 three-model Promptfoo benchmark and M5L4 shared code-review
skill, then package the shared artifacts as an installable GitHub Packages
toolkit under the repository owner's scope. Keep paid evaluation outside CI and
fail before any provider call unless the operator explicitly opts in with a
configured OpenRouter key.

## Boundaries

- The six-case offline Promptfoo contract remains deterministic and free in CI.
- The live matrix uses one React 16 → React 19 migration diff and an explicit
  OpenRouter LLM judge; it is never a pull-request workflow step.
- No key, diff payload or provider response is committed.
- The toolkit installer is tested only in temporary consumer directories; it
  never modifies this course-managed `.claude/` directory during verification.
