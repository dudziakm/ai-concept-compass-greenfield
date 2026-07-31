# MVP Project Analysis Report — 31 lipca 2026

Wynik lokalnego audytu według kursowego `.claude/prompts/mvp-check.md`: **5/5
(100%)**. Audyt ocenia fundamenty techniczne w repozytorium, nie status
wdrożenia ani walory wizualne.

## 1. CRUD actions — ✅

Core item: pojęcie.

- Create: `POST` w `src/pages/api/concepts/index.ts` →
  `ConceptService.create()`.
- Read: `GET` w `src/pages/api/concepts/index.ts` i
  `src/pages/api/concepts/[id].ts` → `list()` / `get()`.
- Update: `PATCH` w `src/pages/api/concepts/[id].ts` → `update()` i trwały zapis
  do Supabase.
- Delete: `DELETE` w tym samym endpointcie → `delete()`; FK usuwa historię
  powtórek przez cascade.

UI wywołuje wszystkie operacje z `ConceptDashboard.tsx` i `ConceptForm.tsx`.

## 2. Business logic — ✅

`src/lib/scoring.ts` implementuje outcome/confidence score, moving mastery,
overconfidence, harmonogram, priorytet z przeterminowaniem oraz ranking
rekomendacji. `ConceptService.createReview()` utrwala obliczony wynik, a
`dashboard()` przelicza aktualne przeterminowanie na przekazanym `now`.

## 3. Tests addressing a defined risk — ✅

`context/testing/test-plan.md` nazywa ryzyko błędnego scoringu/rekomendacji.
`src/lib/scoring.test.ts` obejmuje wszystkie wyniki, dwie kolejne poprawne
odpowiedzi, overconfidence, przeterminowanie, clamp i ranking. 50 testów
przechodzi lokalnie, 3 hosted RLS są pomijane bez konfiguracji, a scoring ma
100% branch coverage.

Ryzyko cross-boundary jest związane z
`e2e/concept-review.spec.ts`; scenariusz jest gotowy, lecz jego realne wykonanie
wymaga skonfigurowanego hosted Supabase i konta testowego.

## 4. Authentication tied to a user — ✅

Supabase Auth jest obsługiwany w `src/lib/supabase.ts`, `src/middleware.ts` i
endpointach `src/pages/api/auth/`. Tabele `concepts` i `review_attempts` mają
`user_id`; każda operacja serwisu filtruje po użytkowniku. Migracja włącza RLS i
osobne polityki SELECT/INSERT/UPDATE/DELETE oparte na `auth.uid()`.

## 5. Documentation — ✅

README wyjaśnia produkt, scoring, API, bezpieczeństwo, uruchomienie, testy i
wdrożenie. `context/foundation/` zawiera meaningful shape notes, PRD i decyzję
stacku, a `context/testing/test-plan.md` mapuje ryzyka na warstwy testów.

## Priorytetowe prace poza samym audytem technicznym

1. Użytkownik loguje się do Supabase i Cloudflare, stosuje migrację i tworzy
   potwierdzone konto E2E.
2. Cztery sekrety trafiają do GitHub Actions; pełny E2E i CI muszą być zielone.
3. Po wdrożeniu należy zebrać publiczny URL oraz screenshoty mobile, auth,
   dashboardu i izolacji dwóch kont.
