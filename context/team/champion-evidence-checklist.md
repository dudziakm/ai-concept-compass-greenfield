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
- [x] Live smoke test providera wykonany 2026-08-04 bez sekretów: `openai/gpt-4o-mini`, oczekiwany `fail`, 4 findingi, `$0.0003099`, `5123 ms`.
- [x] Live promptfoo macierz 3×1 z LLM-as-a-judge wykonana 2026-08-04 na skonfigurowanym, nowym kluczu (`eval-mBw-2026-08-04T16:36:44`). Wynik 0/3: GLM timeout, DeepSeek schema error, Mistral poprawny kontrakt JSON, lecz tylko 1/3 seedowanych blokerów według judge'a. Negatywny wynik pozostaje dowodem porównawczym, nie został przedstawiony jako zielony.

## Konfiguracja GitHub — manualna

- [ ] Każdy wcześniej ujawniony klucz OpenRouter unieważniony; nowy klucz utworzony. Nowy klucz został dostarczony przez użytkownika i zweryfikowany jako ważny; unieważnienia starego klucza nie da się potwierdzić przez repo/API.
- [x] Nowy `OPENROUTER_API_KEY` ustawiony jako Actions repository secret 2026-08-04.
- [x] Workflow reviewera obecny na zaufanym `main`.
- [x] Pierwszy run zarejestrował check `AI Code Review Gate` — [run 30663070207](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30663070207) potwierdził też sticky comment i `ai-cr:failed` dla kontrolowanego błędu bez sekretu.
- [x] Branch protection `main` wymaga `AI Code Review Gate`, `quality`, `e2e` i `rls` (`strict: true`, `enforce_admins: true`, conversation resolution).
- [ ] Sprawdzono, że fork PR nie otrzymuje sekretu i nie wykonuje kodu head.
- [ ] Pakiet `@dudziakm/ai-toolkit@0.1.0` jest dostępny anonimowo (HTTP 200), więc jest publiczny, nie private. Dokumentacja pakietu ostrzega, że publicznej widoczności nie można cofnąć; nie usuwano ani nie publikowano ponownie pakietu.
- [x] Niezależny consumer smoke 2026-08-04: anonimowy install, reinstall i uninstall `@dudziakm/ai-toolkit@0.1.0` zakończone powodzeniem.

## PR odrzucony — manualny dowód

- [x] URL PR-a: [PR #5](https://github.com/dudziakm/ai-concept-compass-greenfield/pull/5) (zamknięty bez merge).
- [x] URL czerwonego runa: [run 30930636655](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30930636655).
- [ ] Screenshot sticky comment z findingiem: _pending_.
- [ ] Screenshot `ai-cr:failed`: _pending_.
- [ ] Screenshot blokady merge przez wymagany check: _pending_.
- [x] Opis seedowanego problemu i oczekiwany wymiar DoD: kontrolowana reguła rabatowa bez testów granicznych, wartości ujemnych i regresji; `test-risk-coverage`. Reviewer zwrócił finding `high`, etykietę `ai-cr:failed`, exit `1`, a chroniony `main` raportował `BLOCKED`.
- [x] Seedowana reguła była wyłącznie fixture w zamkniętym PR #5, nigdy nie została scalona ani dodana do runtime. Aktualny kod aplikacji zachowuje istniejące 53 testy (50 passed, 3 świadomie skipped), 100% scoped coverage oraz zielone E2E i RLS.

## PR zaliczony — manualny dowód

- [x] URL PR-a: [PR #6](https://github.com/dudziakm/ai-concept-compass-greenfield/pull/6).
- [x] URL zielonego runa: [run 30931114212](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30931114212).
- [ ] Screenshot zaktualizowanego sticky comment: _pending_.
- [ ] Screenshot `ai-cr:passed`: _pending_.
- [ ] Screenshot zielonej bramki merge: _pending_.
- [x] URL runa po retry przez `ai-cr:review`: [run 30931516252](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30931516252). Sticky comment został zaktualizowany bez duplikatu, a etykieta wróciła do `ai-cr:passed`.

## Metryki do formularza

- Model/provider bramki: `openai/gpt-4o-mini` przez OpenRouter.
- Live eval pass rate: `0/3` (`0%`) dla rygorystycznego wymagania wykrycia wszystkich trzech blokerów; wyniki per model opisano wyżej.
- Koszt PR fail / pass: `$0.0002` / `$0.0002` (wartości zaokrąglone z komentarzy workflow). Łączne użycie nowego klucza po smoke, probach diagnostycznych, matrix, fail/pass i retry: `$0.002231519`, poniżej limitu `$2`.
- Czas PR fail / pass: `2819 ms` / `2445 ms`; retry pass: zielony run w `17 s` łącznie z workflow.
- Liczba findingów i podjęte działanie: fail — 1 `high`, PR zamknięty bez merge; pass — 0, PR pozostawiony jako dowód i nośnik aktualizacji checklisty.
- Data weryfikacji polityki danych/ZDR: 2026-08-04. Reviewer wymusza `data_collection: deny` i `zdr: true`; kontrolowany probe potwierdził routing ZDR. Usunięto wyłącznie niekompatybilny filtr `require_parameters`, pozostawiając walidację `Output.object`.

## Granica uczciwego zgłoszenia

Live smoke, macierz, branch protection i dwa prawdziwe PR-y są wykonane. Do pełnego zgłoszenia nadal brakuje screenshotów oraz potwierdzenia unieważnienia starego klucza. Istnieje też jawne odstępstwo: opublikowany GitHub Package jest publiczny i według dokumentacji pakietu nie może zostać przełączony z powrotem na private. Nie przedstawiać go jako prywatnego w formularzu.
