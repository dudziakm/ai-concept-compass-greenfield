# Cursor-first workflow verification — 2026-08-05

## Purpose

This record extends the repository with a Cursor-first development path. It does
not rewrite the historical M3 Codex hook exercise or the M5 toolkit delivery.

## Default and compatibility paths

- **Default:** Cursor loads `AGENTS.md`, `.cursor/rules/`,
  `.cursor/skills/code-review/SKILL.md`, and `.cursor/hooks.json` from the
  repository or a target worktree.
- **Canonical skill:** `skills/code-review/SKILL.md` remains the Champion and
  CI source of truth. CI rejects drift in its Cursor copy.
- **Compatibility:** `.codex/hooks.json` remains available for Codex. Its
  `/hooks` trust and observed `apply_patch` run are still owner-only M3 proof.
- **Separate distribution:** `@dudziakm/ai-toolkit` targets Claude Code
  consumers and manages `.claude/`; it is not used to configure this repository
  for Cursor.

## Quality behavior

The Cursor post-edit hook runs the shared lint and typecheck implementation and
fails open: it returns quality feedback without discarding a saved edit. It is
not a commit or CI replacement. `npm run verify:fast` and
`npm run verify:full` remain the explicit local gates; GitHub requires
`quality`, `e2e`, and `rls`.

## Verification

- The hook wrapper was exercised with representative JSON input for both a
  passing quality run and an unavailable-`npm` failure; both returned valid
  non-blocking hook output.
- `verify:fast`, `verify:full`, the reviewer package tests, and the offline
  Promptfoo contract are recorded in PR #9.
- The public Cloudflare Worker returned HTTP 200. The authenticated Playwright
  flow against `https://ai-concept-compass.dudziak-michal.workers.dev` passed
  4/4: auth and starter-pack reset, concept review/recommendation, dashboard
  error recovery, and ready-dashboard seed.
- The hosted two-user RLS integration verification passed 3/3 with values kept
  outside this repository and hidden from command output.
