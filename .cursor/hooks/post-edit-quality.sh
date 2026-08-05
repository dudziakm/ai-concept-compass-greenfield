#!/usr/bin/env bash

set -uo pipefail

# Consume Cursor's event JSON. This hook deliberately uses a project-wide check:
# a successful edit stays non-blocking even if the quality gate is unavailable.
cat >/dev/null

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

if bash "scripts/post-edit-quality.sh" >&2; then
  printf '%s\n' '{"additional_context":"Post-edit quality passed: lint and typecheck are green."}'
else
  printf '%s\n' '{"additional_context":"Post-edit quality did not pass. Your edit was saved because this hook fails open; run `npm run verify:fast` and fix the reported lint or type errors before handoff."}'
fi

exit 0
