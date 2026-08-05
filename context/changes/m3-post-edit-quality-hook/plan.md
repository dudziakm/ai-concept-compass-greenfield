# Implementation plan — M3L3 post-edit quality hook

## Phase 1: Project-local fast feedback

### Automated success criteria

- `.claude/settings.json` is valid JSON and defines `PostToolUse` with matcher
  `Write|Edit` and a command handler with a finite timeout.
- `.codex/hooks.json` is valid JSON and defines `PostToolUse` with matcher
  `^apply_patch$` and a command handler, pointing at the same script.
- Both handlers invoke the same repository script through `git rev-parse
  --show-toplevel`, and that script runs `npm run lint` and `npm run typecheck`.
- The script resolves and changes to the git root, does not reference `.env`,
  and completes successfully on Node 22.14.0.
- The script exits `0` when both checks pass and `2` when either fails, and no
  other status can escape it. Failure text goes to stderr so the agent receives
  it as context. Both checks run on every invocation, so one failing gate still
  reports the other's findings.
- The static guard fails if `npm run typecheck` is deliberately removed from
  the script, then passes after the truthful script is restored.
- The existing local baseline passes: workflow check, lint, typecheck, unit
  coverage and build.

### Manual success criteria

- A real agent edit in a Claude Code session rooted in this repository visibly
  runs the hook.
- A deliberately failing edit produces exit `2` and the agent reports the
  specific lint and typecheck errors back, without having run either command
  itself.

### Optional, not required by the course

- Trusting the Codex hook definition in `/hooks`. `LEKCJE/MODUL3/3-hooki-i-triggery-agent-ktory-sam-reaguje-na-bledy.md`
  says "Wybierz swoje narzędzie" and lists Claude Code with `.claude/settings.json`
  as a first-class option, so the Codex surface is a compatibility path rather
  than an outstanding obligation.

### Work

1. Add a narrowly matched project hook and a root-resolving quality script.
2. Explain the event, checks, timeout and manual trust in the README.
3. Validate the JSON and script without reading or logging secret files.
4. Prove the static guard rejects a missing typecheck, restore the script and
   run the proportionate baseline.
5. Add the Claude Code `PostToolUse` surface and map every failure to exit `2`.
6. Observe the hook on a real agent edit and record the transcript evidence.

## Progress

### Phase 1: Project-local fast feedback

#### Automated

- [x] 1.1 Create the project-local hook, script and documentation
- [x] 1.2 Validate the JSON and execute the root-resolving script
- [x] 1.3 Pass the deliberate-break static guard and local baseline
- [x] 1.4 Commit the verified M3L3 exercise
- [x] 1.5 Add the Claude Code `PostToolUse` surface — merged in #10, squash `9706d9b`
- [x] 1.6 Map every failure path to exit `2` and report both checks — see
  `context/evidence/m3-hook-observation-2026-08-05.md` verifications 1 and 2

#### Manual

- [x] 1.M1 Observe the hook firing on a real agent edit — marker
  `hook ran at 2026-08-05T14:43:24Z` from a session whose only tool use was
  `Write`; `context/evidence/m3-hook-observation-2026-08-05.md` probe A
- [x] 1.M2 Observe exit `2` feedback reaching the agent — the session quoted the
  `ts(2322)` and `no-unused-vars` errors verbatim without running either command;
  probe B in the same record

#### Optional

- [ ] 1.O1 Trust the Codex hook definition in `/hooks` (compatibility path only)
