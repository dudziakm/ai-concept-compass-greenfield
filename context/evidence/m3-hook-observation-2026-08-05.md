# M3L3 post-edit hook — observed behaviour, 2026-08-05

This record closes the two manual criteria of
`context/changes/m3-post-edit-quality-hook/plan.md`. It replaces the earlier
statement in `claude-code-first-workflow-2026-08-05.md`, which described a manual
invocation of the script rather than an observed `PostToolUse` event.

## What the lesson requires

`LEKCJE/MODUL3/3-hooki-i-triggery-agent-ktory-sam-reaguje-na-bledy.md` fixes three
exit codes: `0` continue, `2` blocking with the output visible to the agent, anything
else logged but not surfaced. The exercise is satisfied when the hook fires on a real
agent edit and the agent receives the failure text in its context.

## Contract implemented

`scripts/post-edit-quality.sh` runs `npm run lint` and `npm run typecheck`, collects
the output of both, and exits `2` when either fails. Both checks always run, so a
failing lint still reports what typecheck found. Failure text goes to stderr, capped
at the last 60 lines per check. No other exit status can escape: `git rev-parse` and
`cd` failures also exit `2`.

## Verification 1 — clean tree exits 0

```
bash scripts/post-edit-quality.sh
exit=0  duration=10s
post-edit-quality: running lint and typecheck in <repo root>
post-edit-quality: lint and typecheck passed.
```

Ten seconds is well inside the 120-second `timeout` declared in
`.claude/settings.json`.

## Verification 2 — deliberate failure exits 2 and reports both checks

A probe file `src/lib/__probe.ts` containing
`const probeValue: number = "deliberately wrong";` was created, the hook was run, and
the probe was deleted.

```
exit=2
stderr:
post-edit-quality: blocking. Fix the reported issues before continuing.
--- npm run lint failed ---
  1:7  error  'probeValue' is assigned a value but never used  @typescript-eslint/no-unused-vars
--- npm run typecheck failed ---
src/lib/__probe.ts:1:7 - error ts(2322): Type 'string' is not assignable to type 'number'.
```

Both checks are represented, which the previous `set -e` sequence could not do — it
stopped at the first failing command.

## Verification 3 — the hook fires on a real agent edit

Two probes ran in an independent Claude Code session started with this repository as
its working directory, so `.claude/settings.json` loaded from the repository rather
than from any user-level configuration.

**Probe A — the event fires.** The hook was temporarily extended to write a timestamp
to a file outside the repository. The session was asked to create one file and stop.
It used exactly one tool, `Write`. The marker was then present:

```
hook ran at 2026-08-05T14:43:24Z
```

The hook script was restored immediately afterwards. A control run of the same
extended script invoked directly produced its own marker, confirming the appended
line was not the reason the event marker appeared.

**Probe B — the agent receives the blocking feedback.** The session was asked to
create `src/lib/__probe.ts` with a deliberately wrong type annotation, to report any
quality-gate output it received back, and to stop. Its transcript shows exactly one
tool use, `Write`. It then reported:

> File created at `src/lib/__probe.ts`. The `PostToolUse` hook fired and blocked,
> reporting:
> **lint:** `'probeValue' is assigned a value but never used`
> (`@typescript-eslint/no-unused-vars`) — 1 error.
> **typecheck:** `src/lib/__probe.ts:1:7 - error ts(2322): Type 'string' is not
> assignable to type 'number'.` — 1 error, 0 warnings, 9 hints overall.

The session never ran `npm run lint` or `npm run typecheck` itself, so the only
source of those two messages is the hook's stderr arriving in its context. That is
the lesson's requirement met end to end: the gate fired on an agent edit, blocked,
and the agent read the specific errors.

The probe file was deleted after each run. `git status` was clean of probe artifacts
before committing.

## Observation about exit 0

On exit `0` the hook's stdout does not appear in the `--output-format stream-json`
event stream; only the blocking path surfaces text. That is why Probe A needed a
filesystem marker to prove the event at all, and it is worth knowing before anyone
concludes from a quiet transcript that the hook is not wired up.

## Codex compatibility path

`.codex/hooks.json` still points at the same script on the `apply_patch` matcher and
still requires the owner to trust it once in `/hooks`. The course does not require
Codex: the lesson's task section says "Wybierz swoje narzędzie" and lists Claude Code
with `.claude/settings.json` as a first-class option. The Codex path is therefore
kept as compatibility, not as an outstanding obligation.
