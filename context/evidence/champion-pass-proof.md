# Controlled accepted-PR fixture

This documentation-only change records the acceptance criteria for the
Champion reviewer lifecycle. It does not alter application or reviewer
runtime behavior.

Verification:

- the code-reviewer contract suite covers exit codes `0`, `1`, and `2`;
- the matrix contract suite verifies the dedicated React migration fixture;
- CI runs lint, typecheck, unit tests, build, E2E, and hosted RLS checks;
- no credentials or customer data are included in this evidence file.
