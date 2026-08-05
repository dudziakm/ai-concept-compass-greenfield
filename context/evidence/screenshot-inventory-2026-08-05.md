# Inwentarz zrzutów ekranu — 5 sierpnia 2026

Mapowanie plików na pola obu formularzy zgłoszeniowych. Etykiety pól odczytane
z żywych formularzy 5 sierpnia 2026, nie z transkrypcji.

## Formularz 10xBuilder

| Pole formularza                                  | Wymagane | Plik                                            | Co pokazuje                                                                                             |
|--------------------------------------------------|----------|-------------------------------------------------|---------------------------------------------------------------------------------------------------------|
| Screenshot: Poprawnie działający test lub zestaw testów | **tak**  | `screenshots/builder/green-tests-ci.png`        | Podsumowanie Actions runu `31016045921` na `main` @ `9706d9b`: `Success`, `quality` 2m4s, `e2e` 2m9s, `rls` 44s, adnotacje `Evaluation completed: 6/6` i `Playwright Run Summary 4 passed (1.2m)` |
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

Formularz nie ma **żadnego** pola załącznika ani pola na URL repozytorium.
Wymagane są tylko email, imię i nazwisko, wybór odznaki i komentarz. Zrzuty
Championa nie idą więc do formularza — służą jako dowód w repozytorium, do
którego komentarz kieruje.

| Plik                                                              | Co dowodzi                                                                                                                    |
|-------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| `screenshots/champion/pr-5-fail-sticky-comment-and-label.png`     | PR #5 `Closed` bez merge, etykieta `ai-cr:failed`, sticky comment `AI Code Review — ❌ FAIL`, finding `HIGH · test-risk-coverage`, telemetria $0.0002 / 2819 ms |
| `screenshots/champion/pr-6-pass-retry-sticky-comment-and-label.png` | PR #6 `Merged`, `6 checks passed`, sticky comment `PASS` oznaczony `edited` (aktualizacja bez duplikatu), pełny cykl etykiet z ręcznym retry przez `ai-cr:review` |

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
