# 10xChampion — checklista dowodów

## Artefakty lokalne

- [x] `context/team/opportunity-map.md` — fakty, inferencje, otwarte pytania i wariant no-build.
- [x] `context/team/mom-test-validation.md` — neutralny plan walidacji i progi decyzji.
- [x] `packages/code-reviewer` — TypeScript, AI SDK, OpenRouter, Zod, CLI 0/1/2.
- [x] Limit wejścia 50k, jedno wywołanie, timeout 60 s, koszt ≤$0.20.
- [x] Sześć stałych eval cases i deterministyczny promptfoo baseline.
- [x] Workflow z minimalnymi permissions, ochroną forków, sticky comment, labels i retry.
- [x] Natywny czerwony/zielony check jako bramka — workflow implementuje zachowanie.
- [ ] Live smoke test providera wykonany i zapisany bez sekretów.
- [ ] Live promptfoo 6/6 wykonane na wybranym modelu.

## Konfiguracja GitHub — manualna

- [ ] Każdy wcześniej ujawniony klucz OpenRouter unieważniony; nowy klucz utworzony.
- [ ] Nowy `OPENROUTER_API_KEY` ustawiony jako Actions repository secret.
- [ ] Workflow reviewera obecny na zaufanym `main`.
- [ ] Pierwszy run zarejestrował check `AI Code Review Gate`.
- [ ] Ruleset/branch protection wymaga `AI Code Review Gate` oraz deterministycznego CI.
- [ ] Sprawdzono, że fork PR nie otrzymuje sekretu i nie wykonuje kodu head.

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

Tor nie jest gotowy do zgłoszenia wyłącznie na podstawie zielonych testów lokalnych. Wymagane są realny sekret skonfigurowany przez użytkownika, branch protection oraz dwa prawdziwe PR-y z zachowanymi URL-ami i screenshotami. Shared Registry i remote agents są poza zakresem tego sprintu.
