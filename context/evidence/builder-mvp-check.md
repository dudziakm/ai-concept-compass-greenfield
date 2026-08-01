# MVP Project Analysis Report — 1 sierpnia 2026

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
odpowiedzi, overconfidence, przeterminowanie, clamp i ranking. 53 testy
przechodzą lokalnie, hosted RLS przechodzi 3/3 na dwóch zwykłych kontach, a
scoring ma 100% branch coverage.

Ryzyko cross-boundary jest związane z `e2e/concept-review.spec.ts`; scenariusz
przechodzi przeciwko hosted Supabase i publicznemu
<https://ai-concept-compass.dudziak-michal.workers.dev>. Obejmuje auth,
idempotentny starter pack, custom CRUD, review, rekomendację oraz sprzątanie
danych. Powtórzenie 5/5 lokalnie i finalny publiczny run 3/3 nie wykazały
niestabilności.

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

1. Wykonać świeżą rejestrację i kliknąć prawdziwy link potwierdzający e-mail na
   publicznym środowisku.
2. Zebrać finalne publiczne screenshoty i dowód zielonego E2E do Mission Log.
3. Podjąć świadomą decyzję o Supabase Leaked Password Protection, które advisor
   raportuje jako wyłączone.
