# Implementation plan — Champion reviewer hardening

## Scope and decisions

The canonical review scope remains `50_000` JavaScript `String.length` units for
the sum of PR title, body and diff. The review is fail-closed: if the scope is
exceeded, it returns a structured `INPUT_TOO_LARGE` infrastructure error and exit
code `2`, does not invoke the model and does not silently truncate or partially
review the PR.

The existing Zod input schema remains the defense-in-depth contract. The composite
action may keep a separate transport safeguard, but it must not present a larger
diff as reviewable input or replace it with synthetic data.

## Phase 1: Fail-closed input scope

### Changes required

1. Add a distinct oversized-input error and an actionable Polish message without
   including diff content.
2. Preflight the complete title/body/diff input before the model call while keeping
   schema validation as a backstop.
3. Make the action's oversized-diff behavior invoke the same fail-closed contract
   and emit a JSON/markdown error result for the sticky-comment path.
4. Add boundary tests for exact limit, one-character excess, title/body budget,
   Unicode JavaScript-string semantics, zero model calls and JSON/markdown/exit
   contracts.
5. Update reviewer documentation and Champion evidence to distinguish local scope
   hardening from pending hosted proof.

### Automated success criteria

- `npm --prefix packages/code-reviewer run typecheck` passes.
- `npm --prefix packages/code-reviewer test` passes, including the scope boundaries.
- `npm --prefix packages/code-reviewer run eval:offline` passes.
- `npm --prefix packages/code-reviewer run eval:promptfoo` passes offline.
- `npm run workflow:check` passes.
- `npm run lint && npm run typecheck && npm run test:run && npm run build` passes
  on Node 22.14.0.
- Deliberate-break: changing the exact-limit comparison from `>` to `>=` makes the
  exact-limit test fail; the change is restored before commit.

### Manual success criteria

- A future same-repository PR larger than the reviewable scope shows a red,
  explicit scope ERROR rather than a synthetic/truncated review.
- After separately authorized secret and ruleset setup, a real model produces a
  finding-based fail PR and a corrected pass PR; neither proof may use exit `2`.
- A fork PR is observed to receive neither provider secret nor head-code execution.

## Progress

### Phase 1: Fail-closed input scope

#### Automated

- [x] 1.1 Implement explicit input-scope contract and tests
- [x] 1.2 Pass deliberate-break and full local quality gate
- [x] 1.3 Commit the verified P0 change

#### Manual

- [ ] 1.M1 Capture hosted oversized-input scope-error evidence
- [ ] 1.M2 Capture real model fail/pass PR evidence after external configuration
- [ ] 1.M3 Verify fork isolation and required ruleset after external configuration
