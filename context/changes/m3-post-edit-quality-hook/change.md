---
change_id: m3-post-edit-quality-hook
title: Add a project-local post-edit quality hook for M3L3
status: implementing
created: 2026-08-01
updated: 2026-08-01
archived_at: null
---

# M3L3 post-edit quality hook

Add one repository-local Codex hook for the Module 3 Lesson 3 exercise. After a
successful `apply_patch` tool use, it runs the existing fast quality checks:
lint and TypeScript validation. The hook is a local feedback signal, not a
replacement for tests, CI, hosted checks or code review.

## Scope

- `.codex/hooks.json`
- one minimal executable script under `scripts/`
- `README.md`
- this change and its implementation plan

## Boundaries

- Resolve the repository root before running npm commands so the hook works
  from a subdirectory.
- Bound hook execution with a Codex handler timeout.
- Do not read, print or persist `.env` values.
- The hook is untrusted until the user reviews and trusts its exact definition
  in Codex with `/hooks`; this change must not perform that trust action.
- Do not change global Codex configuration, install packages, push, deploy or
  run hosted checks.
