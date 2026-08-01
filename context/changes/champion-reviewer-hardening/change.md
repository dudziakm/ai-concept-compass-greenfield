---
change_id: champion-reviewer-hardening
title: Fail closed when AI review input exceeds its declared scope
status: implemented
created: 2026-08-01
updated: 2026-08-01
archived_at: null
---

# Champion reviewer hardening

Align the GitHub PR review action with the reviewer's 50,000 JavaScript-character
input contract. An oversized title, body or diff must produce an explicit
infrastructure scope error before any model call. It must never silently truncate
the reviewable input or return a partial/pass verdict.

## Inputs

- `packages/code-reviewer/src/schemas.ts`
- `packages/code-reviewer/src/errors.ts`
- `packages/code-reviewer/src/index.ts`
- `.github/actions/ai-code-review/action.yml`
- `context/team/reviewer-runbook.md`
- `context/team/champion-evidence-checklist.md`

## Boundaries

- Local code, tests and documentation only.
- No provider keys, GitHub secrets, rulesets, push, deployment, hosted run or form.
- The existing 0/1/2 exit-code contract remains intact.
- The following hosted evidence remains manual: live provider/evals, fork proof,
  fail/pass PR lifecycle and required branch protection.
