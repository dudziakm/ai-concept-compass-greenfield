# Implementation plan — Champion live evaluations and shared skill

## Phase 1: M5L3 live matrix

### Changes required

1. Make the Promptfoo provider accept a declared `mode` and model instead of
   relying on a global model selector.
2. Add one bounded React 16 → React 19 migration fixture with exactly three
   real compatibility flaws and a static contract test.
3. Add a manual-only Promptfoo configuration for `z-ai/glm-5.1`,
   `deepseek/deepseek-v4-flash` and `mistralai/mistral-small-3.2-24b-instruct`,
   plus an explicitly pinned OpenRouter LLM rubric judge.
4. Fail the manual command before all provider calls without a deliberate opt-in
   and key; record how live costs/results are captured without secrets.

### Success criteria

- Existing offline `eval:promptfoo` remains green with no API key.
- Static tests prove the complex fixture has exactly three named flaws, is below
  the reviewer input limit, and the live provider uses its declared model.
- `eval:matrix` refuses without opt-in or key before issuing a provider call.

## Phase 2: M5L4 shared review skill

### Changes required

1. Create `skills/code-review/SKILL.md` with the exact required frontmatter,
   triggers, convention-derived categories and output contract.
2. Add a static contract check and forward-test the skill against a harmless
   sample diff.

### Success criteria

- The skill validator accepts `skills/code-review`.
- The repository checker rejects a missing trigger/category/verdict token.

## Phase 3: M5L4 GitHub Packages toolkit

### Changes required

1. Package the `code-review` skill and matching team rules as
   `@dudziakm/ai-toolkit`, a private GitHub Packages npm package.
2. Add fail-soft, idempotent install/uninstall scripts with sentinels and a
   manifest; test them only against a temporary consumer directory.
3. Add a workflow which validates frontmatter and `npm pack --dry-run` on PRs,
   then publishes only after a trusted push to `main` or `master`.

### Success criteria

- `npm pack --dry-run` contains only the declared package artifacts.
- A temporary consumer install is idempotent and creates the expected skill,
  rule sentinel and manifest; uninstall removes only managed artifacts.
- Workflow syntax and package artifact checks are green locally.

## Progress

### Phase 1: M5L3 live matrix

#### Automated

- [x] 1.1 Implement the explicit provider/config and fixture contract — 999ca0f
- [x] 1.2 Validate offline suite and no-spend preflight — 999ca0f
- [x] 1.3 Run full local quality gates and commit — 999ca0f

#### Manual

- [ ] 1.M1 Rotate/configure `OPENROUTER_API_KEY`, check model availability and approve matrix/judge budget
- [x] 1.M2 Run the three-model matrix and record redacted results, costs and
      duration — eval id `eval-mBw-2026-08-04T16:36:44`, run 2026-08-04, strict
      result 0/3 (GLM timeout, DeepSeek schema error, Mistral 1/3). Recorded in
      `context/team/champion-evidence-checklist.md`.

### Phase 2: M5L4 shared review skill

#### Automated

- [x] 2.1 Create and validate the exact course skill — e0e7599
- [x] 2.2 Run static contract check and a harmless forward test — e0e7599

#### Manual

- [ ] 2.M1 Install the published skill in an independent consumer repository and confirm its team-specific conventions fit that repository.

### Phase 3: M5L4 GitHub Packages toolkit

#### Automated

- [x] 3.1 Build the private package and its fail-soft installer — 42c881b
- [x] 3.2 Test pack/install/idempotency/uninstall in an isolated temporary consumer — 42c881b
- [x] 3.3 Run full local quality gates and commit — 42c881b

#### Manual

- [ ] 3.M1 Verify the post-merge `Publish AI Toolkit` workflow created version `0.1.0` in GitHub Packages.
