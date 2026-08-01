# AI Code Reviewer — runbook operacyjny

## Cel

Uruchomić reviewer jako bezpieczny, wymagany check i zebrać dowód jednego odrzuconego oraz jednego zaliczonego PR-a. Kroki wykonujące operacje na GitHubie są manualne; lokalna implementacja nie loguje się ani nie zapisuje sekretów.

## 1. Bramka lokalna

```bash
cd packages/code-reviewer
npm ci
npm run typecheck
npm test
npm run eval:promptfoo
npm audit --omit=dev
```

Oczekiwane:

- typecheck: exit 0;
- Vitest: wszystkie testy zielone, w tym kody 0/1/2;
- promptfoo: 6/6;
- runtime audit: 0 podatności.

## 2. Live smoke test

1. Unieważnij i obróć każdy wcześniejszy klucz, który pojawił się w lokalnym outputcie, logu testu albo historii shell. **Nie używaj wcześniej ujawnionego klucza.**
2. Dostarcz nowy `OPENROUTER_API_KEY` przez bezpieczny secret store/shell session. Nie umieszczaj wartości w `.env` śledzonym przez Git.
3. Uruchom review na kontrolowanym diffie.
4. Sprawdź: poprawny JSON, `usage.totalCostUsd <= 0.20`, `durationMs <= 60000`, brak diffu/klucza w logu.
5. Uruchom `PROMPTFOO_LIVE=1 npm run eval:promptfoo` tylko po świadomej akceptacji budżetu maksymalnego `$1.20` dla sześciu review.
6. Zapisz timestamp, model, wynik 6/6, koszt sumaryczny i screenshot — bez zapisywania klucza ani pełnych diffów.

## 3. Konfiguracja GitHub

Po merge infrastruktury reviewera do `main`:

1. Dodaj **nowy, obrócony** repository secret `OPENROUTER_API_KEY` (Settings → Secrets and variables → Actions). Nie dodawaj go jako variable ani do workflow YAML.
2. Utwórz lub pozwól workflow utworzyć labels `ai-cr:passed`, `ai-cr:failed`, `ai-cr:review`.
3. Otwórz testowy same-repository PR. Fork PR celowo nie dostaje sekretu i kończy check czerwono.
4. W ruleset/branch protection dla `main` włącz wymagany status check **AI Code Review Gate** dopiero po pierwszym poprawnym runie, gdy GitHub zna nazwę checka.
5. Pozostaw wymagane także deterministyczne CI (lint/typecheck/test/build). AI reviewer nie zastępuje tych checków.

Top-level workflow pozostaje `permissions: {}`. Job dostaje wyłącznie
`contents: read`, `issues: write` i `pull-requests: write`; ostatnie uprawnienie
jest wymagane przez GitHub dla komentarza/etykiety na PR. W ustawieniach repo
domyślne uprawnienia Actions mogą być `write`, ale każdy job musi nadal jawnie
zawężać je do tej trójki. Workflow nie ma `contents: write` ani prawa do
zatwierdzania PR-ów.

## 4. Dowodowy PR odrzucony

1. Utwórz osobną gałąź z kontrolowanym problemem, np. nową regułą biznesową bez testu. Nie używaj prawdziwego sekretu jako fixture.
2. Otwórz PR z opisem spodziewanego wymiaru `test-risk-coverage`.
3. Sprawdź, że:
   - sticky comment ma marker i konkretny dowód;
   - istnieje dokładnie label `ai-cr:failed`;
   - check **AI Code Review Gate** jest czerwony;
   - branch protection blokuje merge;
   - run nie ujawnia diffu ani sekretu.
4. Zapisz URL PR-a, URL runa, screenshot komentarza i screenshot zablokowanego merge.
5. Zamknij PR bez merge albo popraw go i zachowaj oba runy jako audit trail.

## 5. Dowodowy PR zaliczony

1. Utwórz drugi PR zawierający małą zmianę wraz z testem i dokumentacją ryzyka.
2. Sprawdź `ai-cr:passed`, zielony check i możliwość merge przy wszystkich pozostałych checkach.
3. Usuń/dodaj label `ai-cr:review` albo dodaj go ponownie, aby potwierdzić retry bez duplikowania komentarza.
4. Zapisz URL PR-a, oba runy retry, screenshot zaktualizowanego sticky comment i zielonej bramki.

## 6. Awaria i rollback

- **Exit 1:** napraw finding w kodzie; to nie jest incident providera.
- **Exit 2 / ERROR:** sprawdź obecność sekretu, dostępność modelu, timeout, limit wejścia i koszt. Kod `INPUT_TOO_LARGE` oznacza fail-closed scope error: podziel PR; nie skracaj diffu po cichu i nie zmieniaj wyniku na `pass`.
- **Model niedostępny:** ustaw kompatybilny `AI_REVIEW_MODEL` po live evalach i przeglądzie kosztu/ZDR; nie zwiększaj limitu `$0.20`.
- **False positive:** udokumentuj przypadek w eval fixtures przed zmianą promptu; porównaj baseline przed/po.
- **Pilny rollback:** wyłącz wymaganie checka w ruleset (jawny ślad administracyjny), a następnie wyłącz workflow. Nie zamieniaj czerwonego checka w milczący success.
- **Fork contribution:** maintainer może przenieść commit na zaufaną gałąź repo po ręcznym review; nigdy nie używaj `pull_request_target` do wykonania kodu forka z sekretem.

## 7. Progi stop

Wyłącz pilot i wróć do deterministycznych checków, jeśli wystąpi którykolwiek warunek no-build z `opportunity-map.md`: replay <4/5, >20% false positives, przekroczenie czasu/kosztu, brak zgody danych lub brak działania autorów.
