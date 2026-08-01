# Implementation plan — Builder public E2E stability

## Phase 1: Deterministic public journey

### Changes required

1. Add a small setup helper that waits for either the dashboard heading or the
   product's visible recoverable error state. If and only if that state appears,
   activate `Spróbuj ponownie`, then require the dashboard heading.
2. Scope the post-edit title assertion to the edited concept card, so the test
   accepts the legitimate same title in the review panel without losing the
   persistence, order, status and focus assertions.
3. Prove both protections: make the scoped card locator ambiguous and verify the
   test goes red; run the critical journey repeatedly against the public Worker.

### Automated success criteria

- The setup fails if the dashboard neither loads nor recovers through the
  visible retry control within the bounded expectation timeout.
- The critical journey asserts the edited title within its concept card and
  still asserts stable index, live status and focus.
- `npm run test:e2e` passes against a fresh local server on Node 22.14.0.
- `E2E_BASE_URL=https://ai-concept-compass.dudziak-michal.workers.dev npx
  playwright test e2e/concept-review.spec.ts --repeat-each=5` passes.
- `npm run lint`, `npm run typecheck`, `npm run test:coverage` and `npm run
  build` pass.
- Deliberate break: restore the global title locator and confirm the repeat
  journey fails with a strict-mode ambiguity before restoring the scoped code.

### Manual success criteria

- Capture final public desktop/mobile/keyboard/console screenshots after the
  full public journey is green.
- Complete a fresh public signup, email confirmation, signin and signout using
  a real inbox.

## Progress

### Phase 1: Deterministic public journey

#### Automated

- [x] 1.1 Make setup recovery-aware and scope the post-edit locator
- [x] 1.2 Prove the locator break and run local/public critical journeys
- [x] 1.3 Run full quality gates and commit the verified change

#### Manual

- [ ] 1.M1 Capture final public smoke evidence
- [ ] 1.M2 Capture real signup confirmation evidence
