# Mom Test Validation Plan — AI Code Reviewer

## Status walidacji

Dokument zawiera analizę prawdziwej historii repo oraz plan rozmów. **Nie przeprowadzono jeszcze wywiadów z zespołem ani pilota na prawdziwym PR-ze.** Wnioski z Git i kodu są dowodami zachowania systemu, ale nie zastępują dowodów adopcji użytkownika.

## Pomysł wejściowy

Read-only reviewer ocenia tytuł, opis i diff PR-a według sześciu wymiarów Definition of Done, publikuje findingi i ustawia blokujący check. Ma ograniczyć powtarzane poprawki CI/testów i wcześniej ujawniać ryzyka correctness/security/documentation.

## Hipotezy

- **Użytkownik/rola:** autor PR-a i reviewer/maintainer małego zespołu TypeScript.
- **Tarcie:** ryzyka testów, bezpieczeństwa i kontraktu są wykrywane po merge lub po kilku poprawkach CI.
- **Obecny workaround:** ręczny review, retry/timeout, poprawki pipeline, checklisty i nieblokujące E2E.
- **Ryzykowne założenia:** diff wystarcza; model jest stabilny; finding jest wykonalny; wysyłanie diffu jest dozwolone; gate nie spowalnia zespołu; gotowe narzędzia nie wystarczą.
- **Proponowane rozwiązanie:** single-shot reviewer w GitHub Actions, nie agent z tools ani automatycznym fixem.

## Dowody już obecne

### Fakty

- E2E w `10xCardsAstro` jest jawnie nieblokujące (`continue-on-error` na jobie i kroku).
- Historia repo zawiera liczne osobne commity „fix tests”, „additional timeout”, „new retry on CICD”, „resolve test timing”.
- Kod legacy nalicza `cards_reviewed` przed ratingiem, limituje zapytanie przed filtrowaniem due date i ma migrację wyłączającą RLS.
- Stały offline baseline reviewera obejmuje sześć przypadków: clean, missing tests, security gap, excessive complexity, missing documentation i malformed input.

### Inferencje

- Część późniejszych poprawek mogła być tańsza, gdyby finding pojawił się w PR-ze.
- Blokujący check może zmienić zachowanie bardziej niż obecne advisory E2E.
- Nie wiadomo jeszcze, czy model zobaczy problem algorytmiczny tylko z diffu ani czy zespół zaakceptuje false positives.

## Krytyka bez pytań prowadzących

„Agent do review” jest rozwiązaniem, nie problemem. Historia pokazuje tarcie techniczne, ale nie pokazuje, że brak modelu jest jego przyczyną. E2E mogło być nieblokujące świadomie z powodu niestabilnego środowiska; automatyczny gate może wtedy tylko przenieść flaky failure do innego narzędzia. Najtańszą alternatywą może być usunięcie `continue-on-error`, lepsze testy kontraktowe, CodeQL albo szablon PR. Pilot musi porównać te opcje, nie tylko potwierdzić własny pomysł.

## Przewodnik wywiadu (20–30 minut)

1. Opowiedz o ostatnim PR-ze, który wymagał dodatkowej poprawki po pierwszym review. Co dokładnie się wydarzyło?
   - Dopytaj: kiedy zauważono problem i kto go zauważył?
2. Pokaż ostatni przypadek, gdy test przeszedł lokalnie, ale zawiódł lub został pominięty w CI.
   - Dopytaj: ile rund i minut kosztowała poprawka?
3. Jak dziś decydujesz, że zmiana ma wystarczające testy ryzyka?
4. Kiedy ostatnio świadomie zignorowałeś czerwony lub ostrzegawczy check? Dlaczego?
5. Jaki ostatni komentarz review faktycznie zmienił Twoją implementację?
   - Dopytaj: co sprawiło, że komentarz był wiarygodny i wykonalny?
6. Kiedy ostatnio automatyczne narzędzie zgłosiło false positive? Co wtedy zrobiłeś?
7. Jakie dane w diffie nie mogą opuścić GitHub runnera lub organizacji?
8. Jak dzisiaj obsługujesz security scanning, dependency alerts i dokumentację publicznych kontraktów?
9. Pokaż przypadek, w którym istniejące narzędzie było wystarczające — co zadziałało?
10. Przy jakim czasie oczekiwania lub poziomie fałszywych alarmów wyłączyłbyś dodatkowy gate?
11. Czy możesz wskazać 3–5 zanonimizowanych historycznych PR-ów do replayu bez ujawniania sekretów?
12. Kto powinien mieć prawo do jawnego override i jak taki override ma być audytowany?

## Krótka ankieta

1. Czy w ostatnich 30 dniach otworzyłeś lub reviewowałeś PR? `tak / nie` (screener).
2. Ile PR-ów w ostatnich 30 dniach wymagało poprawki po pierwszym zielonym CI? `0 / 1–2 / 3–5 / >5`.
3. Jak często brak testu ryzyka jest wykrywany dopiero w review lub później? `nigdy / miesięcznie / tygodniowo / prawie codziennie`.
4. Ile czasu zwykle kosztuje jedna dodatkowa runda CI? `<5 / 5–15 / 16–30 / >30 min`.
5. Które źródło najczęściej wykrywa problem? `unit / E2E / security scan / człowiek / produkcja / inne`.
6. Opisz ostatni konkretny false positive automatycznego checka.
7. Opisz ostatni konkretny problem, którego automatyczny check nie wykrył.
8. Czy kod z PR może trafiać do zewnętrznego providera z ZDR? `tak / nie / wymaga akceptacji / nie wiem`.
9. Po ilu fałszywych blokadach na 10 PR-ów wyłączyłbyś gate? `1 / 2 / 3 / >3`.

## Kryteria decyzji

- **Proceed do ograniczonego pilota:** 3 z 5 przeanalizowanych osób spontanicznie opisują niedawny, podobny workaround; replay wykrywa ≥4/5 seedowanych ryzyk; false-positive rate na czystych PR-ach ≤20%; każdy run ≤60 s i ≤$0.20; polityka danych zaakceptowana.
- **Zawęź zakres:** problem istnieje tylko w jednym wymiarze (np. security) albo model potrzebuje planu/kontekstu repo; wtedy gate ocenia tylko potwierdzony wymiar lub pozostaje advisory.
- **Nie buduj jeszcze:** brak niedawnych przykładów, findingi nie prowadzą do działania, replay <4/5 albo false positives >20%.
- **Najpierw istniejące narzędzie/proces:** włącz blokujące E2E, CodeQL/Dependabot lub PR template i porównaj dwutygodniowy wynik, jeżeli łapią tę samą klasę problemów bez wysyłania kodu do modelu.

## Obecna decyzja

**Wąski, odwracalny pilot techniczny; bramka produkcyjna jeszcze niezatwierdzona.** Kontrakt, offline evale i workflow można przygotować, ale branch protection wymaga najpierw live evali i dwóch kontrolowanych PR-ów (jeden celowo odrzucony, drugi poprawiony i zaliczony).

## Rejestr rozmów / pilota

| Data      | Osoba/rola | Ostatni konkretny przypadek | Obecny workaround i koszt | Wynik     | Dowód/link |
| --------- | ---------- | --------------------------- | ------------------------- | --------- | ---------- |
| _pending_ | _pending_  | _pending_                   | _pending_                 | _pending_ | _pending_  |
