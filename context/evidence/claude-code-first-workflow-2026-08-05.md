# Claude Code-first workflow verification — 2026-08-05

## Purpose

This record makes Claude Code the default development environment for this
repository and supersedes the Cursor-first proposal that was opened as PR #9 and
not merged. It does not rewrite the historical M3 Codex hook exercise or the M5
toolkit delivery.

## Why the tool changed

The owner ran the project through Codex and then Cursor; both exhausted their
usage limits mid-sprint. Claude Code is the environment the remaining work will
run in, so the repository is configured for it once rather than re-configured per
tool. Cursor was never merged as a default and leaves no artifacts behind.

## Default and compatibility paths

- **Default:** Claude Code loads `CLAUDE.md`, which imports `AGENTS.md` and
  `e2e/AGENTS.md`; `.claude/settings.json` supplies the post-edit hook and the
  project permission policy; `.mcp.json` supplies the Supabase and Cloudflare
  servers.
- **Canonical skill:** `skills/code-review/SKILL.md` remains the Champion and CI
  source of truth. `.claude/skills/code-review/SKILL.md` is generated from it by
  `npm run toolkit:install` and CI rejects drift between the two.
- **Compatibility:** `.codex/hooks.json` remains available for Codex on the same
  `scripts/post-edit-quality.sh`. Its `/hooks` trust and one observed
  `apply_patch` run are still owner-only M3 proof and remain outstanding.
- **Dogfooding:** the repository configures itself by installing its own published
  `@dudziakm/ai-toolkit` rather than declaring the package irrelevant to its own
  setup. `npm run toolkit:install` runs the committed installer directly with
  `PROJECT_ROOT`, so no GitHub Packages token, `.npmrc` or `postinstall` is
  introduced into `npm ci` — fork pull requests are unaffected.

## Quality behavior

The Claude Code `PostToolUse` hook matches the `Write` and `Edit` tools and runs
the shared lint and typecheck script. It reports rather than reverts: a failing
gate returns output as context and the explicit gates remain
`npm run verify:fast` and `npm run verify:full`. GitHub requires `quality`, `e2e`
and `rls`; the AI Code Review Gate stays advisory.

## Reviewer changes carried over from PR #9

PR #9's diff-grounding idea is kept because hallucinated findings were the
reviewer's dominant false-positive source. Its implementation is replaced:

- Grounding uses per-file **hunk ranges** from `@@` headers, not added lines only.
  The previous version indexed `+` lines exclusively, so a finding about *removed*
  code — a deleted authorization check, RLS policy or test — could never be
  grounded and was always discarded.
- A file present in the diff grounds `line: null` findings, which the finding
  schema permits and the previous filter always dropped.
- One line of tolerance absorbs new-side counting drift across wide hunks.
- The parser no longer walks hunk bodies, which removes the defect where an added
  line beginning with `++` advanced the file-header guard without advancing the
  line counter and desynchronised the rest of the hunk.
- Grounding **fails closed**: an empty, truncated or header-less diff yields no
  ranges, and in that case no finding is dropped. Previously such input silently
  produced `pass` with zero findings.
- Withheld findings are returned as `droppedFindings`, rendered in the sticky
  comment as non-blocking, and counted in the CLI log, so suppression is
  auditable instead of silent.

Scores remain telemetry and do not gate; that part of PR #9 is deliberate and is
now consistent with `packages/code-reviewer/README.md`, which previously
documented the removed score threshold.

The system-prompt carve-outs from PR #9 are **not** carried over. They were
written to stop the reviewer flagging artifacts that PR itself introduced, and
`offline-oracle.ts` gives prompt changes no regression coverage.

## Lint and type coverage

PR #9 narrowed `baseConfig` to `src`, `tests`, `e2e` and `vitest.config.ts`,
which removed type-checked rules from every `.astro` file, `scripts/*.mjs` and the
root configuration files. That narrowing is not carried over. `packages/code-reviewer`
is excluded from the type-aware pass because the root project service cannot
resolve its separate tsconfig, and is linted without type information by a
dedicated config block instead of being excluded from lint entirely.

## Verification

Grounding was exercised directly against `canonicalizeDecision` with a `critical`
security-safety finding and diffs in real `git diff` shape. `FAIL` means the finding
was grounded and blocked; `PASS` means it was withheld into `droppedFindings`.

| Case                                          | Verdict | Kept | Dropped |
|-----------------------------------------------|---------|------|---------|
| Pure-deletion hunk (`@@ -7,3 +6,0 @@`), line 6 | FAIL    | 1    | 0       |
| Pure-deletion hunk, line 7                     | FAIL    | 1    | 0       |
| Normal hunk, exact added line                  | FAIL    | 1    | 0       |
| Normal hunk, off-by-one line                   | FAIL    | 1    | 0       |
| Normal hunk, line 30 lines away                | PASS    | 0    | 1       |
| `line: null`, file present in diff             | FAIL    | 1    | 0       |
| File absent from the diff                      | PASS    | 0    | 1       |
| Header-less diff (fail closed)                 | FAIL    | 1    | 0       |
| Unparsable diff (fail closed)                  | FAIL    | 1    | 0       |

The first two and the last three rows all returned `PASS` with zero findings under
PR #9's implementation.

Repository gates run locally on this branch:

- `npm run workflow:check` — passed, 54 required files
- `npm run lint` — passed, now including `packages/code-reviewer`, every `.astro`
  file, `scripts/*.mjs` and the root configuration files
- `npm run typecheck` — 0 errors across 65 files
- `npm run test:run` — 50 passed, 3 skipped
- `npm run build` — completed
- `npm --prefix packages/code-reviewer run eval:promptfoo` — offline contract, no
  provider call

`npm run test:e2e` and `npm run test:rls` are unchanged by this workflow migration
and remain the responsibility of the hosted CI gates.

The `PostToolUse` hook was invoked exactly as `.claude/settings.json` declares it
(`bash "$(git rev-parse --show-toplevel)/scripts/post-edit-quality.sh"`) and
correctly reported a lint failure that was present in the tree at the time.

A repository-level `.gitignore` negation was required: a global `core.excludesFile`
ignores `.claude/` wholesale, which would have silently kept the committed agent
configuration out of the repository and failed the artifact check in CI.
