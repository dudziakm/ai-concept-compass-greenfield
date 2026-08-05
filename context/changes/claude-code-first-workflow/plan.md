# Implementation plan — Claude Code-first workflow

Recorded after implementation. See `change.md` for why, and treat the Progress
rows as the verifiable part of this record: every one cites a merge SHA that
exists on `main`.

## Phase 1: Make Claude Code the default environment

### Automated success criteria

- `.claude/settings.json`, `.mcp.json` and the generated
  `.claude/skills/code-review/SKILL.md` exist on the default branch and are
  asserted by `scripts/verify-workflow-artifacts.mjs`.
- `.mcp.json` carries no token, project reference, API key or account id.
- The generated skill is byte-identical to the canonical `skills/code-review/SKILL.md`.
- `.gitignore` re-includes `.claude/`, because a global `core.excludesFile` would
  otherwise keep the whole agent configuration out of the repository.
- Reviewer findings are grounded in per-file diff hunk ranges, so a finding about
  removed code stays reportable; grounding fails closed on an unparsable diff and
  withheld findings are returned as `droppedFindings`.

## Phase 2: Close the Module 3 hook exercise

### Automated success criteria

- The hook exits `2` on any failure and reports both checks.
- `scripts/verify-workflow-artifacts.mjs` rejects a script without `exit 2`, a
  stderr redirect, or with a bare `npm run` that would propagate its own status.
- `tests/post-edit-hook.test.ts` covers the mapping against an `npm` shim.
- `.dev.vars` and `.dev.vars.*` are ignored.

### Manual success criteria

- The `PostToolUse` event is observed firing on a real agent edit, and the exit-2
  text is observed arriving in an agent's context.

## Phase 3: Complete the submission evidence

### Automated success criteria

- Every required Builder form field has a file, and the mapping is written down.
- No screenshot in `context/evidence/screenshots/` shows an account address.
- The Champion merge-block screenshots exist on a remote branch.

## Phase 4: Make the documents agree with the repository

### Automated success criteria

- No document claims the ruleset is unenforced, that the published toolkit
  package is installed, that 53 tests pass, or that Module 3 is outstanding.
- `roadmap.md` statuses match delivery evidence and pass the status vocabulary
  check.
- The migration ledger drift is recorded as a dated accepted risk.

## Phase 5: Harden CI and the reviewer

### Automated success criteria

- No `uses:` reference in any workflow is a moving tag.
- Every checkout sets `persist-credentials: false`.
- Every `npm ci` runs with `--ignore-scripts`, with any native rebuild named
  explicitly.
- A pull request containing only prose and screenshots classifies as
  `documentation-only`.

## Progress

### Phase 1

#### Automated

- [x] 1.1 Claude Code default environment, MCP config, generated skill, artifact
  guards — PR #10, squash `9706d9b`
- [x] 1.2 Diff-hunk grounding with fail-closed behaviour and `droppedFindings` —
  PR #10, squash `9706d9b`

### Phase 2

#### Automated

- [x] 2.1 Exit-2 contract, static guard, `.dev.vars` ignore, deny-list widening —
  PR #11, squash `6c034b5`
- [x] 2.2 Behavioural contract test against an `npm` shim — PR #11, squash `6c034b5`

#### Manual

- [x] 2.M1 `PostToolUse` observed firing on a real agent edit —
  `context/evidence/m3-hook-observation-2026-08-05.md`, probe A
- [x] 2.M2 Exit-2 text observed reaching an agent's context — same record, probe B

### Phase 3

#### Automated

- [x] 3.1 Four required Builder screenshots, the optional login screen, the
  Champion merge-block pair, and the inventory — PR #12, squash `cabc23f`
- [x] 3.2 Account addresses redacted in every screenshot that showed one —
  PR #12, squash `cabc23f`

### Phase 4

#### Automated

- [x] 4.1 Eleven contradicted statements corrected; roadmap statuses, PRD open
  question, MVP status and the accepted migration risk — PR #13, squash `4881e10`

### Phase 5

#### Automated

- [x] 5.1 Action SHAs, `persist-credentials: false`, `--ignore-scripts` with an
  explicit `better-sqlite3` rebuild — PR #14
- [x] 5.2 Screenshots classified as non-executable in the reviewer scope — PR #15

## Verification

The `quality`, `e2e` and `rls` gates are green on `main` for every squash above.
The AI Code Review Gate produced a real fail then pass across PR #11
(`verdict=fail findings=3 dropped=0 cost_usd=0.0012`, then `pass` after the
contract test landed), which is a fresh instance of the Module 5 Lesson 3
lifecycle on current code.

## Known deviation

This folder was opened after the work, not before it. `AGENTS.md` step 3 requires
the opposite order. The deviation is recorded rather than concealed; the arc began
as a review of pull request #9 and expanded once that review found the proposal
regressive.
