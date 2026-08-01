# Implementation plan — Builder certification evidence

## Scope

Correct only the local certification-evidence ledger. The current fact is that
the full GitHub Actions run for this branch is not green because hosted E2E and
RLS jobs have not received their required repository secrets. This change must
not make any external mutation or represent a future passing run as evidence.

## Phase 1: Truthful Builder evidence ledger

### Phase 1: Success criteria

- README and verification ledger do not describe failed run `30662052616` as a
  passing CI result.
- Mission Log helper no longer presents the old `ai-concept-compass` failure run
  as a green Builder proof.
- The MVP plan distinguishes a passing `quality` job from the pending full
  hosted CI gate.
- The targeted textual guard rejects the former false CI wording.
- `npm run workflow:check`, `npm run lint`, `npm run typecheck`,
  `npm run test:coverage` and `npm run build` pass on Node 22.14.0.

### Phase 1: Work

1. Replace stale positive CI claims with the observed pending state and exact
   prerequisites for a future full hosted run.
2. Keep form fields, screenshots and external human actions visibly pending.
3. Verify that the former run ID or a `Public CI quality ... pass` row is absent;
   deliberately reintroduce the false row temporarily, prove the guard fails,
   then restore the truthful document.
4. Run the local quality gate and review the final diff.

## Progress

### Phase 1: Truthful Builder evidence ledger

#### Automated

- [x] 1.1 Replace stale CI claims with verified pending state
- [x] 1.2 Preserve truthful Builder evidence and pending external steps
- [x] 1.3 Run textual guard and deliberate-break check
- [x] 1.4 Run local quality gate and inspect final diff

#### Manual

- [ ] 1.5 Add the eight GitHub Actions Secrets and obtain one all-green CI run
- [ ] 1.6 Deploy the green revision, complete public signup/email and responsive smoke
- [ ] 1.7 Capture redacted screenshots and submit the Builder Mission Log form
