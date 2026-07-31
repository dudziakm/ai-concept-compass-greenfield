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
      <https://github.com/dudziakm/ai-concept-compass>;
- [ ] publiczny URL wdrożonej aplikacji — opcjonalny w formularzu, ale wymagany
      przez wewnętrzne kryterium sprintu;
- [ ] screenshot ekranu logowania — opcjonalny;
- [ ] screenshot strony głównej / ekranu po zalogowaniu *;
- [ ] screenshot głównej funkcjonalności nr 1 * — rekomendowany: ocena pojęcia
      z deklaracją pewności;
- [ ] screenshot głównej funkcjonalności nr 2 * — rekomendowany: rekomendacja
      następnego tematu na dashboardzie;
- [ ] screenshot zielonego testu lub zestawu testów *;
- [ ] załączniki niestandardowe — opcjonalne;
- [ ] komentarz * — przygotować po zebraniu publicznego URL i końcowych dowodów.

### Dowody pomocnicze do przygotowania przed wysłaniem

- [x] URL repozytorium;
- [x] URL jakościowego joba CI:
      <https://github.com/dudziakm/ai-concept-compass/actions/runs/30655754312/job/91239593977>;
- [ ] URL wdrożenia;
- [ ] wymagane screenshoty w `context/evidence/screenshots/builder/`;
- [ ] screenshot realnego E2E na hosted Supabase;
- [ ] finalny tekst komentarza bez deklarowania niezweryfikowanych wyników.

## Architect — wspólny formularz M4/M5

- [ ] Email * — wpisać ręcznie;
- [ ] Imię i nazwisko * — wpisać ręcznie;
- [x] wybór odznaki * — formularz udostępnia `10xArchitect (M4)`,
      `10xChampion (M5)` albo `Obie odznaki`; docelowo `Obie odznaki`, jeśli oba
      tory przejdą końcową weryfikację;
- [ ] komentarz * — zawrzeć linki do repo, commitów/PR-ów oraz kluczowych
      artefaktów M4.

### Dowody Architecta do przygotowania przed wysłaniem

- [ ] URL-e mapy repo, analizy feature'u, długu technicznego, blast radius;
- [ ] URL-e trzech artefaktów DDD;
- [ ] URL planu `harden-learning-progress`;
- [ ] URL commita lub PR małego refaktoru `ReviewScheduler`;
- [ ] URL zielonych testów chroniących istniejący kontrakt API.

## Champion — dowody do komentarza wspólnego formularza

- [ ] URL fail PR, run, stałego komentarza i labela `ai-cr:failed`;
- [ ] URL poprawionego pass PR, run, komentarza i labela `ai-cr:passed`;
- [ ] URL lub log sześciu stałych evali;
- [ ] screenshoty obu wyników w `context/evidence/screenshots/champion/`;
- [ ] potwierdzenie, że wymagany status check blokuje merge;
- [ ] finalny komentarz łączący dowody Architecta i Championa, jeśli wybrano
      `Obie odznaki`.
