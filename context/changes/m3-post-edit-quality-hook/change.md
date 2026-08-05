---
change_id: m3-post-edit-quality-hook
title: Add a project-local post-edit quality hook for M3L3
status: implemented
created: 2026-08-01
updated: 2026-08-05
archived_at: null
---

# M3L3 post-edit quality hook

Add one repository-local post-edit hook for the Module 3 Lesson 3 exercise. After
a successful agent edit it runs the existing fast quality checks: lint and
TypeScript validation. The hook is a local feedback signal, not a replacement for
tests, CI, hosted checks or code review.

Claude Code is the primary surface (`PostToolUse` on `Write|Edit`); Codex remains
a compatibility surface (`PostToolUse` on `apply_patch`) driving the same script.

## Scope

- `.claude/settings.json`
- `.codex/hooks.json`
- one minimal executable script under `scripts/`
- `README.md`
- this change, its implementation plan and its observation record

## Boundaries

- Resolve the repository root before running npm commands so the hook works
  from a subdirectory.
- Bound hook execution with a handler timeout on both surfaces.
- Do not read, print or persist `.env` values.
- Exit `2` on any failure so the agent receives the output as context. No other
  non-zero status may escape the script, because the tool logs those without
  surfacing them.
- Do not change global agent configuration, install packages, push, deploy or
  run hosted checks.
