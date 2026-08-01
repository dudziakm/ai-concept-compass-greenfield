---
name: code-review
description: Review code changes against team engineering conventions, testing standards and security expectations.
---

# Code Review

Use this skill for `review code`, `check this PR`, `review my changes`, and
`code review`. Review only the supplied diff, files and stated context. Do not
invent standards beyond the conventions below or claim to have run code that was
not run.

## Review workflow

1. Identify changed files and their likely responsibility; request the diff or
   file list when neither is supplied.
2. Inspect every category below and report only actionable deviations.
3. Prioritize correctness and safety over style. Tie each finding to `file:line`
   when the evidence contains a line; otherwise say why no precise line exists.
4. Organize findings from Critical to Warning to Suggestion, then finish with
   exactly one recommendation.

## Categories

### Naming

- Require descriptive camelCase for variables/functions; permit only `url`,
  `id`, `api`, and `config` as abbreviations.
- Require boolean prefixes `is`, `has`, `should`, or `can`, verb-first function
  names, files matching their primary export, and UPPER_SNAKE_CASE constants.

### Error handling

- Require async operations to handle failures, actionable HTTP status/message
  pairs, no empty catches, and `finally` cleanup when resources are opened.
- Require errors to name the failed operation and relevant non-sensitive input.

### TypeScript

- Flag `any` without a justification comment; prefer `interface` for object
  shapes, `unknown` plus a guard for external data, discriminated unions for
  states, and descriptive generic names.

### Function design

- Flag mixed responsibilities, more than three parameters without an options
  object, needless nesting where early returns fit, and impure `get*`, `find*`
  or `is*` queries.

### Security

- Require secrets only from environment/configuration, validation at system
  boundaries, parameterized SQL, and API errors that omit stacks/internal paths.

### Testing

- Prefer behavior-specific names, isolated setup/teardown, concrete assertions,
  and coverage of empty, null, boundary and error paths proportional to risk.

## Output format

### Critical

List blocking correctness, data-loss, secret, injection, authorization or unsafe
input findings. Use `- [Category] file:line — evidence; fix.`

### Warning

List meaningful maintainability, error-handling, TypeScript, function-design or
risk-coverage gaps in the same format.

### Suggestion

List non-blocking naming, readability or documentation improvements. Omit an
empty section only when it has no findings.

### Recommendation

Finish with exactly one of: `APPROVE`, `REQUEST CHANGES`, or `NEEDS DISCUSSION`.
