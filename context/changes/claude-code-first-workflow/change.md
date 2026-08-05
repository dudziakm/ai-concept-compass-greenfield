---
change_id: claude-code-first-workflow
title: Move the repository to a Claude Code-first workflow and close the certification gaps
status: implemented
created: 2026-08-05
updated: 2026-08-05
archived_at: null
---

# Claude Code-first workflow

## Why this record exists and why it is dated after the work

`AGENTS.md` step 3 of the change workflow requires implementing only against an
approved `plan.md`. This arc did not do that: it began as a review of the open
pull request #9 and grew into seven merged pull requests once that review found
the proposal was both strategically wrong and technically regressive.

This folder is therefore written **after** the implementation, and says so rather
than back-dating a plan it never had. The Progress rows below cite real merge
SHAs, so the record is verifiable even though the order was not the documented
one. Future changes open the folder first.

## Problem

The owner ran the project through Codex and then Cursor; both exhausted their
usage limits mid-sprint. Pull request #9 proposed making Cursor the default. That
would have been the third tool switch, and its diff also narrowed lint coverage
and made a class of findings structurally unreportable.

Separately, an independent audit found that the repository's own documents
contradicted the repository in eleven places, that the Builder submission was
missing required screenshot evidence, and that the Module 3 hook exercise was
described as outstanding when the course does not require the tool it named.

## Scope

- Agent configuration: `.claude/settings.json`, `.mcp.json`, `CLAUDE.md`,
  `.claude/skills/`, `scripts/post-edit-quality.sh`
- Reviewer package: diff grounding, scope classification, contract tests
- CI: action pinning, credential persistence, install-time scripts
- Evidence: Builder screenshots, Champion merge-block screenshots, the hook
  observation record, the screenshot inventory
- Plan-of-record documents that disagreed with the repository

## Boundaries

- No product rule, scoring formula or database schema changes.
- No Astro 7 upgrade, no action major-version bumps during the sprint.
- No live mutation of the hosted Supabase project. The migration ledger drift is
  recorded as a dated accepted risk in
  `context/changes/ai-concept-compass-mvp/verification.md` rather than repaired.
- The AI Code Review Gate stays advisory; the three deterministic gates stay
  required.
- Screenshots are redacted, never retouched. Historical evidence is not edited to
  look more consistent than it was.
