# Inwentarz zrzutów ekranu — 5 sierpnia 2026

Mapowanie plików na pola obu formularzy zgłoszeniowych. Etykiety pól odczytane
z żywych formularzy 5 sierpnia 2026, nie z transkrypcji.

## Formularz 10xBuilder

| Pole formularza                                  | Wymagane | Plik                                            | Co pokazuje                                                                                             |
|--------------------------------------------------|----------|-------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| Screenshot: Poprawnie działający test lub zestaw testów | **tak**  | `screenshots/builder/green-tests-ci.png`        | Podsumowanie Actions runu `31021070538` na `main` @ `85a1b04`: `Success`, `quality` 1m48s, `e2e` 2m27s, `rls` 45s, adnotacje `Evaluation completed: 6/6` i `Playwright Run Summary 4 passed (1.4m)` |
| Screenshot: Strona główna / Ekran po zalogowaniu  | **tak**  | `screenshots/builder/public-home-after-login.png` | Dashboard po zalogowaniu na publicznym wdrożeniu: średnie mastery, liczniki, panel powtórki, postęp pięciu domen AWS, lista dziesięciu pojęć |
| Screenshot: Główna funkcjonalność nr 1            | **tak**  | `screenshots/builder/public-concept-form.png`   | Modal „Dodaj własne pojęcie" z pięcioma wypełnionymi polami — etykieta formularza podaje jako przykład „formularz zapisu danych" |
| Screenshot: Główna funkcjonalność nr 2            | **tak**  | `screenshots/builder/public-calibration-review.png` | Pełna mechanika kalibracji: wybrana pewność 3/5, odsłonięty wzorzec odpowiedzi, samoocena `Błędnie` / `Częściowo` / `Poprawnie`, obok postęp domen |
| Screenshot: Ekran logowania                       | nie      | `screenshots/builder/public-signin-screen.png`  | Formularz logowania na publicznym wdrożeniu                                                              |
| Publiczny adres opublikowanej aplikacji           | nie      | —                                               | `https://ai-concept-compass.dudziak-michal.workers.dev`                                                  |
| Załączniki niestandardowe                         | nie      | —                                               | Celowo pominięte: formularz sam pisze, że organizatorzy mają dostęp do repozytorium                       |

Trzy zrzuty z serii `public-*` i dwa z `local-*` pozostają w katalogu jako
materiał uzupełniający (wersje mobilne 360 px, wcześniejsze warianty dashboardu).
Nie są przypisane do żadnego pola.

## Formularz 10xArchitect / 10xChampion

Odczytany ponownie 5 sierpnia 2026 po wyborze `Obie odznaki`. Wcześniejsza
notatka w tym pliku mówiła, że formularz nie ma żadnego pola załącznika — to
było **błędne**. Dwa pola plikowe są ukryte do momentu wyboru odznaki i pojawiają
się dopiero warunkowo:

| Pole formularza                                    | Ujawnia się po                        | Czego oczekuje                                                                                     |
|----------------------------------------------------|---------------------------------------|-----------------------------------------------------------------------------------------------------|
| Raport architektoniczny (M4)                        | wyborze `10xArchitect` / `Obie odznaki` | jeden zsyntetyzowany two-pager złożony z czterech artefaktów M4                                       |
| Który projekt Champion (M5) zrealizowałeś?          | wyborze `10xChampion` / `Obie odznaki`  | wybór jednego z dwóch: `Pipeline CI/CD do review kodu (M5L2-3)` albo `Rejestr artefaktów zespołowych (M5L4)` |
| Załączniki dla projektu Pipeline (M5)               | wyborze wariantu Pipeline               | trzy zrzuty: widok pipeline'u z jobem, logi kroku code review, komentarz agenta na PR                   |
| Załączniki dla projektu Rejestr artefaktów AI (M5)  | wyborze wariantu Rejestr                | zrzut rejestru, definicja paczki (`package.json` lub manifest), lista wydanych wersji                  |

Nadal nie ma pola na URL repozytorium, więc oba adresy muszą znaleźć się
w treści komentarza.

Raport M4 jest wersjonowany w repozytorium legacy jako
`context/evidence/architectural-report-m4.md` wraz z wyrenderowanym PDF-em.

| Plik                                                              | Co dowodzi                                                                                                                    |
|-------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `screenshots/champion/pr-5-fail-sticky-comment-and-label.png`     | PR #5 `Closed` bez merge, etykieta `ai-cr:failed`, sticky comment `AI Code Review — ❌ FAIL`, finding `HIGH · test-risk-coverage`, telemetria $0.0002 / 2819 ms. Pokrywa pole „komentarz code review od agenta" |
| `screenshots/champion/pr-6-pass-retry-sticky-comment-and-label.png` | PR #6 `Merged`, `6 checks passed`, sticky comment `PASS` oznaczony `edited` (aktualizacja bez duplikatu), pełny cykl etykiet z ręcznym retry przez `ai-cr:review` |

Zrzut logów kroku `Review untrusted PR input` nie jest wersjonowany: GitHub
udostępnia logi Actions wyłącznie zalogowanemu właścicielowi repozytorium
(anonimowy widok pokazuje „Sign in to view logs"), więc ten jeden zrzut robi
właściciel ręcznie przed wysłaniem formularza. Widok samego joba i jego kroków
jest publiczny i nie wymaga logowania.

## Redakcja danych

Adresy kont testowych są zamalowane czarnym prostokątem z jasną obwódką
w czterech zrzutach, które je pokazywały: `local-desktop-learning-dashboard.png`,
`local-review-result-dashboard.png`, `public-desktop-dashboard.png`,
`public-review-recommendation.png`. Nowe zrzuty `public-*` z 5 sierpnia
renderują w tym miejscu tekst `[email zredagowany]`, wstawiony przed zrobieniem
zrzutu.

Nagłówki wszystkich trzynastu plików w `screenshots/builder/` zostały
sprawdzone złożonym paskiem, nie pojedynczo. Poza wymienionymi czterema żaden
nie zawierał adresu.

## Jedna rzecz, która wymaga kontekstu przy zgłoszeniu

Ciała PR-ów #5 i #6 widoczne na zrzutach Championa zawierają linię
„Made with Cursor". Oba PR-y powstały w fazie, gdy projekt był prowadzony
w Cursorze; repozytorium przeszło na Claude Code jako środowisko domyślne
5 sierpnia (PR #10, squash `9706d9b`). Zrzuty nie są retuszowane — to zapis
faktycznego stanu GitHuba w chwili dowodu.
