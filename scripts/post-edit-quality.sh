#!/usr/bin/env bash

# Post-edit quality gate. Registered as a PostToolUse hook on Write|Edit in
# .claude/settings.json and on apply_patch in .codex/hooks.json.
#
# Exit-code contract:
#   0 — checks passed, the agent continues.
#   2 — blocking failure; the agent receives stderr as context and is expected to
#       fix the reported issues before continuing.
# Any other status is logged by the tool but never reaches the agent, so a failing
# check must not be allowed to propagate its own exit status.

set -euo pipefail

readonly MAX_REPORTED_LINES=60

fail() {
  printf 'post-edit-quality: %s\n' "$1" >&2
  exit 2
}

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || fail 'not inside a git repository'
cd "$repo_root" || fail "cannot enter repository root: $repo_root"

printf 'post-edit-quality: running lint and typecheck in %s\n' "$repo_root"

# Both checks always run, so a failing lint still reports what typecheck found.
report=""
for check in lint typecheck; do
  if ! check_output="$(npm run --silent "$check" 2>&1)"; then
    report+="--- npm run ${check} failed ---"$'\n'
    report+="$(printf '%s\n' "$check_output" | tail -n "$MAX_REPORTED_LINES")"$'\n'
  fi
done

if [ -n "$report" ]; then
  printf 'post-edit-quality: blocking. Fix the reported issues before continuing.\n' >&2
  printf '%s' "$report" >&2
  exit 2
fi

printf 'post-edit-quality: lint and typecheck passed.\n'
