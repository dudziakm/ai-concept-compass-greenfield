# Opportunity Map — agent code review

## Kontekst

- **Projekt**: AI Concept Compass / ścieżka 10xChampion.
- **Problem źródłowy**: powtarzające się poprawki CI i testów oraz brak blokującej ochrony ryzyk w historii `10xCardsAstro`.
- **Ograniczenie danych**: prawdziwy kod źródłowy, ale tylko tytuł PR-a, opis i diff; helper jest read-only. Dane opuszczają GitHub runner wyłącznie do OpenRouter z żądaniem `data_collection: deny` i `zdr: true`.
- **Data analizy**: 2026-07-31.
- **Status**: historyczne dowody uzasadniają wąski pilot. Nie dowodzą jeszcze adopcji zespołowej ani jakości modelu na prawdziwych PR-ach.

## Dowody, interpretacje i otwarte pytania

### Dowody

1. Legacy CI jawnie ustawia `continue-on-error: true` dla joba E2E i samego kroku Playwright, więc regresja E2E nie blokuje merge: [`ci.yml` L47–82](https://github.com/dudziakm/10xCardsAstro/blob/317acf5/.github/workflows/ci.yml#L47-L82).
2. Historia zawiera serię osobnych poprawek testów/CI w krótkim okresie, m.in. [`aeb760a`](https://github.com/dudziakm/10xCardsAstro/commit/aeb760a), [`8fbe4dd`](https://github.com/dudziakm/10xCardsAstro/commit/8fbe4dd), [`fc02fea`](https://github.com/dudziakm/10xCardsAstro/commit/fc02fea), [`19bf5be`](https://github.com/dudziakm/10xCardsAstro/commit/19bf5be) i [`48d43a4`](https://github.com/dudziakm/10xCardsAstro/commit/48d43a4).
3. Pobranie karty zwiększa `cards_reviewed` przed ratingiem: [`learning.service.ts` L91–120](https://github.com/dudziakm/10xCardsAstro/blob/317acf5/src/lib/services/learning.service.ts#L91-L120).
4. Serwis pobiera 10 najstarszych kart, a dopiero potem filtruje terminy, więc due card spoza pierwszej dziesiątki może zostać zagłodzona: [`learning.service.ts` L45–79](https://github.com/dudziakm/10xCardsAstro/blob/317acf5/src/lib/services/learning.service.ts#L45-L79).
5. Końcowa migracja testowa wyłącza RLS tabel nauki: [`20240320140000_disable_learning_rls_for_testing.sql` L1–8](https://github.com/dudziakm/10xCardsAstro/blob/317acf5/supabase/migrations/20240320140000_disable_learning_rls_for_testing.sql#L1-L8).
6. Wcześniejszy prototyp greenfield wymagał osobnej poprawki CI po pierwszym
   commicie MVP ([`bfcd92b`](https://github.com/dudziakm/ai-concept-compass/commit/bfcd92b):
   wygenerowanie typów Astro przed lintem). To jeden przypadek, nie trend, ale
   potwierdza koszt późnego wykrycia driftu środowiska.

### Interpretacje do zweryfikowania

- Reviewer z wymiarami `test-risk-coverage`, `security-safety` i `correctness` mógłby wykryć część tych problemów przed merge.
- Stały, krótki komentarz z dowodem może być użyteczniejszy niż kolejna ogólna checklista PR.
- Bramka będzie akceptowalna tylko wtedy, gdy `FAIL` jest stabilny, tani i zawiera wykonalny finding.

### Otwarte pytania walidacyjne

- Ile historycznych defektów jest rzeczywiście widocznych w samym diffie bez kontekstu repo?
- Jaki jest poziom false positives na 10 kolejnych prawdziwych PR-ach?
- Czy kod może być zgodnie z polityką projektu wysyłany wybraną ścieżką OpenRouter/provider/ZDR?
- Czy komentarz zmienia zachowanie autora, czy jest ignorowany jak nieblokujący E2E?
- Czy GitHub CodeQL, Dependabot i zwykły review template rozwiązują problem taniej?

## Mapa

| Sygnał                                    | Obecna odpowiedź                        | Cienki komplement                                      | Pierwsza użyteczna wersja                       | Ryzyko danych             | Kierunek, jeśli wartościowy      |
| ----------------------------------------- | --------------------------------------- | ------------------------------------------------------ | ----------------------------------------------- | ------------------------- | -------------------------------- |
| Seria poprawek CI/testów po implementacji | Retry, timeouty, ręczne fixy            | Reviewer wskazuje brak ochrony ryzyka                  | Lokalny `diff → JSON`, 6 stałych evali          | Prawdziwy kod, read-only  | Review / CI gate                 |
| E2E nie blokuje pipeline                  | `continue-on-error`, ręczny odczyt runa | Finding `test-risk-coverage` z dowodem                 | Ostrzeżenie na kontrolowanym diffie bez testu   | Prawdziwy diff            | Review / CI gate                 |
| Niezmienniki nauki nie są chronione       | Mockowane unit testy i review człowieka | Reviewer pyta o moment naliczania i przypadki brzegowe | Historyczny replay 5–10 PR-ów                   | Kod legacy                | Najpierw pilot; możliwy no-build |
| Migracja wyłącza RLS                      | Ręczny security audit / Dependabot      | Blokujący wymiar `security-safety`                     | Seed diff z wyłączeniem RLS lub sekretem        | Potencjalnie wrażliwy kod | Review / CI gate                 |
| Dokumentacja i runtime dryfują            | README aktualizowany później            | Finding `documentation` dla publicznego kontraktu      | Seed diff z publicznym endpointem bez kontraktu | Niskie                    | Review helper lub template       |

## Rekomendowany pierwszy kandydat

**Nazwa:** AI Code Reviewer — single-shot gate.

**Czyta:** tytuł PR-a, opis oraz diff względem merge-base (maksymalnie 50 tys. znaków).

**Zwraca:** walidowany JSON `pass|fail`, zwięzłe podsumowanie, findings przypisane do sześciu wymiarów DoD oraz usage/koszt/czas.

**Nie robi:** nie uruchamia kodu PR-a, nie modyfikuje gałęzi, nie czyta sekretów, nie ma tools, nie przechowuje diffu jako nowego systemu prawdy i nie zastępuje testów ani review człowieka.

**Ryzyko danych:** realny kod trafia do zewnętrznego providera. Pilot wymaga sprawdzenia aktualnej polityki OpenRouter i konkretnego upstream providera; wymuszenie ZDR zmniejsza ryzyko, ale nie jest zgodą organizacyjną.

**Kierunek:** wąska bramka Review / CI z komentarzem, etykietą i natywnym wymaganym checkiem.

## Dlaczego ten kandydat

Łączy trzy obserwowalne klasy tarcia — testy, bezpieczeństwo i dokumentację — w miejscu, w którym zmiana nadal jest mała i odwracalna. Może działać read-only, na stałych fixture'ach i historycznych diffach. Nie przejmuje odpowiedzialności GitHuba, test runnera ani bazy danych.

## Jawny wariant „nie budujemy”

Nie włączamy bramki i pozostajemy przy branch protection, testach, CodeQL/Dependabot oraz review template, jeżeli historyczny replay i pilot pokażą którekolwiek z poniższych:

- reviewer nie wykrywa co najmniej 4 z 5 przygotowanych blokujących ryzyk;
- więcej niż 20% czystych PR-ów otrzymuje blokujący false positive;
- medianowy czas przekracza 60 s albo koszt przekracza $0.20/review;
- polityka danych nie pozwala wysyłać diffów tą ścieżką;
- autorzy nie podejmują działania na podstawie findingów w co najmniej 3 z 5 pilotażowych PR-ów.

Koszt utrzymania kolejnego gate'a jest realny. Sam fakt, że agent da się zbudować, nie jest argumentem za jego trwałym utrzymaniem.
