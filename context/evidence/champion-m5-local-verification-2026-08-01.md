# Champion M5 — local verification evidence (2026-08-01)

## Automated results

- Root workflow artifact checker: PASS (`45` required artifacts).
- App quality gates: lint PASS; Astro typecheck `0` errors (five existing
  deprecation hints); coverage PASS (`53` tests, `100%` scoped coverage); build
  PASS.
- Code reviewer: typecheck PASS; tests PASS (`35`); deterministic Promptfoo
  baseline PASS (`6/6`, no API key and no model call).
- Live M5L3 preflight: PASS. `eval:matrix` exits `1` before a provider call
  without `PROMPTFOO_LIVE_OPT_IN=1`; with opt-in but an empty key it again exits
  `1` before a provider call.
- Deliberate-break check: PASS. Replacing the exact DeepSeek model declaration
  with a suffixed invalid name makes the root artifact checker fail, then the
  original declaration was restored.
- Shared skill: `quick_validate.py` PASS. A Gemini Pro forward test of a
  harmless async diff followed the mandated severity sections, `file:line`
  evidence and one final `REQUEST CHANGES` recommendation.
- GitHub Packages toolkit: metadata/skill/pack validator PASS; isolated
  installer test PASS. The test covers double install, a simulated version
  update, preservation of consumer text and extra skill files, hostile manifest
  paths, malformed sentinels and uninstall.
- Toolkit deliberate-break check: PASS. Replacing the installer manifest entry
  with `not-managed` made the isolated installer test red; the production line
  was restored before the final green run.
- Hosted E2E hardening: PASS. The end-to-end flow has a 60 s budget so its
  required starter-pack cleanup cannot race the default 30 s timeout; the full
  hosted suite then passed `4/4` without retry.
- Independent AGY/Gemini Pro review: accepted the structured matrix and
  toolkit tests, flagged the layered live-opt-in wording and the package privacy
  decision. The provider now requires both the runner marker and user opt-in;
  GitHub's npm documentation confirms that a first personal package is private
  by default, with post-merge visibility verification still retained as manual
  evidence.

## Deliberately pending live proof

No OpenRouter credential, source diff, provider response or cost was written to
this repository. The paid live matrix, real red/pass/retry PR lifecycle,
required status check and private GitHub Package publication remain manual
evidence tasks in `context/team/champion-evidence-checklist.md`.
