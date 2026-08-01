# Implementation plan — Champion M5L3 score contract

## Scope and decisions

Every valid reviewer decision must contain exactly one integer score in the
inclusive `1..10` range for each M5L3 dimension: `correctness`,
`idiomaticity`, `complexity`, `test-risk-coverage`, `documentation` and
`security-safety`.

The canonical local Definition of Done is deterministic: a result can be
`pass` only when all six scores are at least `7` and no finding has severity
`critical`, `high` or `medium`. An incoming model `fail` stays `fail`. A
structured infrastructure error remains exit `2` and must not acquire scores
or masquerade as a code finding.

## Phase 1: Scored six-dimension decision

### Changes required

1. Make the six dimension keys, integer score range and passing threshold shared
   schema constants; reject missing, extra and out-of-range scores.
2. Require the score object in structured output, prompt and deterministic
   offline oracle; canonically enforce score and severity DoD rules.
3. Include scores and finding evidence in the sticky comment while keeping
   reviewer input, diff and secrets out of the output.
4. Update offline tests, promptfoo assertions and operational documentation to
   describe the executable local contract without claiming live validation.

### Automated success criteria

- The schema rejects incomplete, extra and out-of-range score objects.
- Every successful fixture has each dimension exactly once and scores in `1..10`.
- A score below `7`, a blocking severity or model `fail` canonicalizes to fail;
  scores at threshold with only low/no findings pass.
- Markdown contains the marker, six scores and finding evidence, but no review
  input/diff or secret value; `ERROR` stays separate.
- `npm --prefix packages/code-reviewer run typecheck`, `test`, `eval:offline`
  and offline `eval:promptfoo` pass.
- `npm run workflow:check`, `npm run astro -- sync`, `npm run lint`,
  `npm run typecheck`, `npm run test:run` and `npm run build` pass on Node
  22.14.0.
- Deliberate-break: changing the score comparison from `< 7` to `<= 7` makes
  the threshold test fail, then is restored before commit.

### Manual success criteria

- Run a live reviewer and preserve redacted evidence that a real provider emits
  all six scores and respects the declared budget/time limits.
- Run the separately budgeted live multi-model/LLM-rubric evaluation required by
  the course and preserve its results.
- After externally authorized secret and ruleset setup, capture real finding
  fail and corrected pass PRs, retry behavior, a required gate and fork isolation.

## Progress

### Phase 1: Scored six-dimension decision

#### Automated

- [x] 1.1 Implement schema, canonical DoD and structured prompt contract
- [x] 1.2 Align formatter, offline fixtures/evals and documentation
- [x] 1.3 Prove deliberate break and pass the full local quality gate
- [x] 1.4 Inspect the final diff and commit the verified local change

#### Manual

- [ ] 1.M1 Capture redacted live provider evidence with all six scores
- [ ] 1.M2 Run and retain the course-required multi-model/LLM-rubric evaluation
- [ ] 1.M3 Configure the secret/ruleset and retain real fail/pass/retry/fork PR evidence
