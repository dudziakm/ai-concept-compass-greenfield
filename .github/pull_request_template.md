## Context

- Change contract: `context/changes/<change-id>/`
- User-visible or operational outcome:
- Decision rationale and trade-offs:

## Risk and security

- [ ] No secrets, credentials, personal data, or unredacted artifacts are included.
- [ ] Supabase/RLS impact assessed (or not applicable).
- [ ] API validation, authorization, and error-contract impact assessed (or not applicable).
- [ ] AI Code Review Gate remains advisory unless its lifecycle is explicitly proven.

## Verification

- [ ] `npm run verify:fast`
- [ ] `npm run verify:full`
- [ ] `npm run test:e2e` (or explain why hosted credentials are unavailable)
- [ ] `npm run test:rls` (or explain why hosted credentials are unavailable)

## Self-review

- [ ] Reviewed the complete diff and removed unrelated changes.
- [ ] Updated tests, documentation, screenshots, or evidence where the change requires them.
- [ ] Checked that the branch is current with `main` and all required CI checks are green.
