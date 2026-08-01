#!/usr/bin/env bash

set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

printf '%s\n' 'Post-edit quality: running lint and typecheck from the git root.'
npm run lint
npm run typecheck
