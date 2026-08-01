---
change_id: champion-m5-score-contract
title: Make the M5L3 six-dimension review score contract explicit
status: implemented
created: 2026-08-01
updated: 2026-08-01
archived_at: null
---

# Champion M5L3 score contract

Make every successful AI code-review decision report an integer score from 1 to
10 for each of the six required M5L3 Definition-of-Done dimensions. A `pass`
requires every score to meet the explicit threshold and no blocking severity;
infrastructure `ERROR` remains a separate exit-2 outcome, not a code finding.

## Inputs

- `packages/code-reviewer/src/schemas.ts`
- `packages/code-reviewer/src/prompts.ts`
- `packages/code-reviewer/src/format-comment.ts`
- `packages/code-reviewer/src/evals/`
- `packages/code-reviewer/README.md`
- `context/team/reviewer-runbook.md`
- `context/team/champion-evidence-checklist.md`

## Boundaries

- Local code, tests and documentation only.
- No provider keys, model calls, GitHub secrets, rulesets, push, deployment,
  hosted run or form submission.
- No live multi-model matrix, LLM rubric, dependency or budget change.
- Existing `0`/`1`/`2` process and explicit `ERROR` contract remain intact.
- Live evaluation, external merge-gate proof and fork isolation stay manual.
