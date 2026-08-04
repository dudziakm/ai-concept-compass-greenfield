# Mission Log — pola i dowody

Źródła sprawdzone 31 lipca 2026 bezpośrednio w publicznych formularzach:

- Builder: <https://baserow.io/form/g6rJ-njiGpV5lPxvot6iRxsXTh8Wb-AnRjy7s2Zck1c>
- Architect / Champion: <https://baserow.io/form/fwnBioduXc90QTli6lsCVL_YgRdTECPTCmwiVhu8d-E>

Poniższa lista jest transkrypcją aktualnych pól. Gwiazdka oznacza pole
wymagane przez formularz. Dane osobowe i zgoda promocyjna pozostają wyłącznie
do decyzji użytkownika — repo nie powinno ich przechowywać.

## Builder — pola formularza

- [ ] Email * — wpisać ręcznie;
- [ ] Imię i nazwisko / Full Name * — wpisać ręcznie;
- [x] Typ projektu / Project Type * — `Własny projekt`;
- [ ] zgoda na wykorzystanie projektu do promocji * — decyzja użytkownika
      (`Tak` albo `Nie`);
- [x] Repozytorium projektu na GitHub * —
      <https://github.com/dudziakm/ai-concept-compass-greenfield>;
- [x] publiczny URL wdrożonej aplikacji —
      <https://ai-concept-compass.dudziak-michal.workers.dev>;
- [ ] screenshot ekranu logowania — opcjonalny;
- [ ] screenshot strony głównej / ekranu po zalogowaniu *;
- [ ] screenshot głównej funkcjonalności nr 1 * — rekomendowany: ocena pojęcia
      z deklaracją pewności;
- [ ] screenshot głównej funkcjonalności nr 2 * — rekomendowany: rekomendacja
      następnego tematu na dashboardzie;
- [ ] screenshot zielonego testu lub zestawu testów *;
- [ ] załączniki niestandardowe — opcjonalne;
- [x] komentarz * — propozycja do wklejenia:
      `Własny projekt AI Concept Compass zrealizowany plan-first w Astro 6,
      React 19 i Supabase. Publiczna aplikacja działa na Cloudflare Workers.
      CI dla kanonicznego repozytorium obejmuje quality, hosted E2E i testy RLS;
      publiczna suite E2E przeszła 4/4. Repo, wdrożenie i dowody są podane w
      formularzu.`

### Dowody pomocnicze do przygotowania przed wysłaniem

- [x] URL repozytorium;
- [x] URL pełnego zielonego runu CI dla kanonicznego repozytorium:
      <https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30715121885>
      (`quality`, `e2e`, `rls` zielone dla merge commitu `28bc365`);
- [x] URL wdrożenia: <https://ai-concept-compass.dudziak-michal.workers.dev>
      (Cloudflare deployment `8c09f7d2-a731-497f-a8e3-4223ab652ff6`, version
      `8908bbab-5dfb-47e4-9edd-dc55b3fa5561`);
- [x] wymagane screenshoty publiczne w `context/evidence/screenshots/builder/`:
      sign-in, desktop dashboard, 360 px mobile dashboard i review/recommendation;
- [x] świeży screenshot/wynik realnego E2E na hosted Supabase — 4/4 publiczne
      testy; szczegóły w `builder-public-verification-2026-08-01.md`;
- [x] finalny tekst komentarza bez deklarowania niezweryfikowanych wyników;
- [ ] wpisanie osobistych pól, wybór zgody promocyjnej i wysłanie formularza.

## Architect — wspólny formularz M4/M5

- [ ] Email * — wpisać ręcznie;
- [ ] Imię i nazwisko * — wpisać ręcznie;
- [x] wybór odznaki * — formularz udostępnia `10xArchitect (M4)`,
      `10xChampion (M5)` albo `Obie odznaki`; docelowo `Obie odznaki`, jeśli oba
      tory przejdą końcową weryfikację;
- [ ] komentarz * — zawrzeć linki do repo, commitów/PR-ów oraz kluczowych
      artefaktów M4.

### Dowody Architecta do przygotowania przed wysłaniem

- [x] mapa repo i struktura:
      <https://github.com/dudziakm/10xCardsAstro/tree/master/context/map>;
- [x] analiza feature'u, długu i blast radius:
      <https://github.com/dudziakm/10xCardsAstro/tree/master/context/changes/learning-progress-analysis>;
- [x] trzy artefakty DDD:
      <https://github.com/dudziakm/10xCardsAstro/tree/master/context/domain>;
- [x] plan `harden-learning-progress`:
      <https://github.com/dudziakm/10xCardsAstro/blob/master/context/changes/harden-learning-progress/plan.md>;
- [x] mały refaktor `ReviewScheduler`: [PR #25](https://github.com/dudziakm/10xCardsAstro/pull/25),
      merge commit `2a2b929`;
- [x] zielone testy chroniące kontrakt API:
      <https://github.com/dudziakm/10xCardsAstro/actions/runs/30715689313>
      (`ReviewScheduler characterization`, unit, security, build i E2E).

## Champion — dowody do komentarza wspólnego formularza

- [x] fail: [PR #5](https://github.com/dudziakm/ai-concept-compass-greenfield/pull/5),
      [run 30930636655](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30930636655),
      sticky comment i `ai-cr:failed`;
- [x] pass: [PR #6](https://github.com/dudziakm/ai-concept-compass-greenfield/pull/6),
      [run 30931114212](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30931114212),
      retry [30931516252](https://github.com/dudziakm/ai-concept-compass-greenfield/actions/runs/30931516252),
      sticky comment i `ai-cr:passed`;
- [x] sześć stałych evali: deterministyczny baseline 6/6; manualna macierz
      `eval-mBw-2026-08-04T16:36:44` miała rygorystyczny wynik 0/3 i jest
      opisana bez upiększania w `context/team/champion-evidence-checklist.md`;
- [ ] screenshoty obu wyników w `context/evidence/screenshots/champion/`;
- [x] branch protection `main` wymaga `AI Code Review Gate`, `quality`, `e2e`
      i `rls`; PR #5 raportował `BLOCKED`, PR #6 `CLEAN`;
- [x] finalny komentarz do wariantu `Obie odznaki`:
      `Architect: repo map, analiza blast radius i trzy artefakty DDD doprowadziły
      do małego refaktoru ReviewScheduler w PR #25; characterization, unit,
      security, build i E2E są zielone. Champion: wdrożony reviewer ma
      schematyczny kontrakt sześciu ocen, limity kosztu/czasu, ZDR, ochronę
      forków i wymagany check. PR #5 został odrzucony z findingiem high
      test-risk-coverage i zablokowany przez protection; PR #6 przeszedł oraz
      przeszedł retry. Offline evale: 6/6. Manualna macierz trzech modeli:
      0/3 dla rygorystycznego wykrycia wszystkich trzech blokerów — wynik
      raportuję jawnie. Toolkit 0.1.0 przeszedł niezależny
      install/reinstall/uninstall, ale paczka jest publiczna, nie private.`;
- [ ] wpisać dane osobowe, wybrać `Obie odznaki`, dołączyć screenshoty i wysłać formularz.
