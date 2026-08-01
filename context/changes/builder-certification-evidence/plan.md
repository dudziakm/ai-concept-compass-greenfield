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

## Phase 2: Correct failed public Worker evidence

### Phase 2: Success criteria

- README and verification ledger state that the public critical E2E fails after
  card edit with expected position `3` and received position `9`.
- The documentation distinguishes passing local/current-code and hosted-RLS
  evidence from the failed deployed public flow.
- The textual guard rejects the former public-pass wording.
- The local quality gate remains green after the evidence-only correction.

### Phase 2: Work

1. Replace the public E2E pass claim with the exact failure and safe
   remediation: deploy a tested SHA, then rerun the public flow.
2. Preserve all external checks as pending and do not perform deployment.
3. Deliberately restore the former public-pass row, prove the guard rejects it,
   then restore the truthful document and run the local gate.

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

### Phase 2: Correct failed public Worker evidence

#### Automated

- [x] 2.1 Record exact public Worker E2E failure and safe remediation
- [x] 2.2 Run extended textual guard and deliberate-break check
- [x] 2.3 Run proportional local quality gate and inspect final diff

#### Manual

- [ ] 2.4 Deploy a tested SHA and rerun the public critical E2E before replacing the failure evidence
