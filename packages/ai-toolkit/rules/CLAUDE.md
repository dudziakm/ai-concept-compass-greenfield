# Shared AI Toolkit Conventions

Apply these conventions when creating or reviewing application code:

- Use descriptive camelCase names, verb-first functions, boolean prefixes
  (`is`, `has`, `should`, `can`), matching primary file exports and
  UPPER_SNAKE_CASE constants.
- Handle every asynchronous failure, keep error messages actionable without
  sensitive data, avoid empty catches, and release opened resources in `finally`.
- Do not use `any` without an explicit justification; narrow untrusted data from
  `unknown`, prefer interfaces for object shapes and discriminated unions for
  states.
- Keep functions single-purpose, use an options object above three parameters,
  prefer early returns and keep query functions pure.
- Read secrets from environment/configuration only, validate boundary input, use
  parameterized SQL and never return stacks or internal paths in API errors.
- Name tests after behaviour, isolate setup/teardown, assert concrete outcomes
  and cover empty, null, boundary and error paths in proportion to risk.
