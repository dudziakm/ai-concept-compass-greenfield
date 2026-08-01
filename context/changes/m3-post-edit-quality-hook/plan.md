# Implementation plan — M3L3 post-edit quality hook

## Phase 1: Project-local fast feedback

### Automated success criteria

- `.codex/hooks.json` is valid JSON and defines `PostToolUse` with matcher
  `^apply_patch$` and a command handler.
- The handler invokes a repository script through `git rev-parse
  --show-toplevel`, has a finite timeout, and runs `npm run lint` followed by
  `npm run typecheck`.
- The script resolves and changes to the git root, does not reference `.env`,
  and completes successfully on Node 22.14.0.
- The static guard fails if `npm run typecheck` is deliberately removed from
  the script, then passes after the truthful script is restored.
- The existing local baseline passes: workflow check, lint, typecheck, unit
  coverage and build.

### Manual success criteria

- In Codex, the user opens `/hooks`, reviews the exact project-local hook and
  explicitly trusts it before relying on automatic execution.
- A future `apply_patch` in a trusted Codex session visibly runs the hook and
  reports its quality result.

### Work

1. Add a narrowly matched project hook and a root-resolving quality script.
2. Explain the event, checks, timeout and manual trust in the README.
3. Validate the JSON and script without reading or logging secret files.
4. Prove the static guard rejects a missing typecheck, restore the script and
   run the proportionate baseline.

## Progress

### Phase 1: Project-local fast feedback

#### Automated

- [x] 1.1 Create the project-local hook, script and documentation
- [x] 1.2 Validate the JSON and execute the root-resolving script
- [x] 1.3 Pass the deliberate-break static guard and local baseline
- [x] 1.4 Commit the verified M3L3 exercise

#### Manual

- [ ] 1.M1 Review and trust the hook in Codex with `/hooks`
- [ ] 1.M2 Confirm the trusted hook after a future `apply_patch` edit
