# 10xChampion — checklista dowodów

## Artefakty lokalne

- [x] `context/team/opportunity-map.md` — fakty, inferencje, otwarte pytania i wariant no-build.
- [x] `context/team/mom-test-validation.md` — neutralny plan walidacji i progi decyzji.
- [x] `packages/code-reviewer` — TypeScript, AI SDK, OpenRouter, Zod, CLI 0/1/2.
- [x] Limit pełnego wejścia 50k JS `String.length`, fail-closed `INPUT_TOO_LARGE`, jedno wywołanie, timeout 60 s, koszt ≤$0.20.
- [x] Lokalny kontrakt M5L3: sześć dokładnie nazwanych ocen `1..10`; pass wymaga każdej oceny ≥7 i braku findingu `critical`/`high`/`medium`, a `ERROR` pozostaje osobnym exit `2`.
- [x] Sześć stałych eval cases i deterministyczny promptfoo baseline.
- [x] M5L3: manualna macierz jednego złożonego diffu React 16 → React 19 dla `z-ai/glm-5.1`, `deepseek/deepseek-v4-flash` i `mistralai/mistral-small-3.2-24b-instruct`, z osobnym jawnym judge `openrouter:openai/gpt-4o-mini` (`temperature: 0`).
- [x] M5L3: test kontraktu potwierdza dokładnie trzy seedowane blokery, limit wejścia i przekazanie jawnego modelu; komenda matrix odmawia bez opt-inu lub klucza przed wywołaniem providera.
- [x] M5L4: `skills/code-review/SKILL.md` ma literalny kontrakt kursu; walidator skilla i static checker są zielone, a niezależny forward-test Gemini zwrócił poprawny format `REQUEST CHANGES` dla kontrolowanego diffu.
- [x] M5L4: `@dudziakm/ai-toolkit` zawiera identyczną kopię skilla, reguły, fail-soft installer/uninstaller, manifest i test idempotencji/bezpieczeństwa na tymczasowym konsumencie.
- [x] Workflow z minimalnymi permissions, ochroną forków, sticky comment, labels i retry.
- [x] Natywny czerwony/zielony check jako bramka — workflow implementuje zachowanie.
- [x] Workflow `Publish AI Toolkit` waliduje PR (`npm ci --ignore-scripts`, metadata/frontmatter i `npm pack --dry-run`); publikacja z push jest celowo dodatkowo chroniona zmienną `AI_TOOLKIT_PUBLISH_APPROVED`.
- [ ] Live smoke test providera wykonany i zapisany bez sekretów.
- [ ] Live promptfoo macierz 3×1 z LLM-as-a-judge wykonana na skonfigurowanym, nowym kluczu.

## Konfiguracja GitHub — manualna

- [ ] Każdy wcześniej ujawniony klucz OpenRouter unieważniony; nowy klucz utworzony.
- [ ] Nowy `OPENROUTER_API_KEY` ustawiony jako Actions repository secret.
- [x] Workflow reviewera obecny na zaufanym `main`.
- [x] Pierwszy run zarejestrował check `AI Code Review Gate` — [run 30663070207](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30663070207) potwierdził też sticky comment i `ai-cr:failed` dla kontrolowanego błędu bez sekretu.
- [ ] Ruleset/branch protection wymaga `AI Code Review Gate` oraz deterministycznego CI.
- [ ] Sprawdzono, że fork PR nie otrzymuje sekretu i nie wykonuje kodu head.
- [ ] Pakiet `@dudziakm/ai-toolkit@0.1.0` opublikowany jako **private** GitHub Package po świadomym wyborze widoczności; publiczne repo źródłowe nie jest dowodem prywatności paczki.

## PR odrzucony — manualny dowód

- [ ] URL PR-a: _pending_.
- [ ] URL czerwonego runa: _pending_.
- [ ] Screenshot sticky comment z findingiem: _pending_.
- [ ] Screenshot `ai-cr:failed`: _pending_.
- [ ] Screenshot blokady merge przez wymagany check: _pending_.
- [ ] Opis seedowanego problemu i oczekiwany wymiar DoD: _pending_.

## PR zaliczony — manualny dowód

- [ ] URL PR-a: _pending_.
- [ ] URL zielonego runa: _pending_.
- [ ] Screenshot zaktualizowanego sticky comment: _pending_.
- [ ] Screenshot `ai-cr:passed`: _pending_.
- [ ] Screenshot zielonej bramki merge: _pending_.
- [ ] URL runa po retry przez `ai-cr:review`: _pending_.

## Metryki do formularza

- Model/provider: _pending_.
- Live eval pass rate: _pending_.
- Koszt PR fail / pass: _pending_ / _pending_.
- Czas PR fail / pass: _pending_ / _pending_.
- Liczba findingów i podjęte działanie: _pending_.
- Data weryfikacji polityki danych/ZDR: _pending_.

## Granica uczciwego zgłoszenia

Tor nie jest gotowy do zgłoszenia wyłącznie na podstawie zielonych testów lokalnych. Wymagane są: nowy sekret skonfigurowany przez użytkownika, realna macierz trzech modeli, branch protection oraz dwa prawdziwe PR-y z zachowanymi URL-ami i screenshotami. Pakiet GitHub Packages jest zaimplementowany i lokalnie sprawdzony, lecz jego pierwsza publikacja wymaga świadomego potwierdzenia prywatności.
