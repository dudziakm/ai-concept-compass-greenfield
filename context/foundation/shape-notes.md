---
project: "AI Concept Compass"
context_type: greenfield
created: 2026-07-31
updated: 2026-07-31
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6]
  gray_areas_resolved:
    - topic: primary user
      decision: polskojęzyczna osoba przygotowująca się do AWS Certified AI Practitioner
    - topic: core value
      decision: wykrywanie luki między deklarowaną pewnością a faktycznym wynikiem powtórki
    - topic: content source
      decision: dziesięć autorskich pojęć opartych wyłącznie na oficjalnym blueprintcie AIF-C01 v1.1
    - topic: model dependency
      decision: brak wywołań LLM w MVP; rekomendacja jest deterministyczna
    - topic: access
      decision: konto użytkownika i pełna izolacja prywatnych danych
  frs_drafted: 12
  quality_check_status: accepted
---

# Shape notes — AI Concept Compass

> **Pochodzenie dokumentu:** discovery przeprowadzone 31 lipca 2026 przed
> scaffoldem i implementacją, na podstawie zatwierdzonego briefu sprintu.
> Nie przeprowadzono jeszcze wywiadów z użytkownikami. Etykiety
> **Evidence**, **Decision**, **Inference** i **Open question** rozdzielają to,
> co zostało dostarczone przez użytkownika, od wniosków oraz braków.

## Vision & Problem Statement

**Decision.** Polskojęzyczne osoby przygotowujące się do AWS Certified AI
Practitioner potrafią rozpoznać termin, ale nie zawsze potrafią go wyjaśnić.
Zwykła lista fiszek nie ujawnia, kiedy deklarowana pewność przewyższa faktyczną
wiedzę, więc użytkownik może poświęcać czas niewłaściwym tematom.

**Decision.** Produkt łączy deklarację pewności przed odpowiedzią z późniejszą
samooceną. Z tych dwóch sygnałów wyprowadza mastery, lukę kalibracji i priorytet,
aby w mniej niż pięć minut wskazać kolejny temat do nauki.

## User & Persona

**Primary persona.** Samodzielnie ucząca się, polskojęzyczna osoba przygotowująca
się do egzaminu AIF-C01. Korzysta z aplikacji podczas krótkiej sesji nauki i
potrzebuje odpowiedzi na pytanie „co powtórzyć teraz?”, a nie kolejnego
rozbudowanego systemu notatek.

**Access decision.** Użytkownik zakłada konto, loguje się i pracuje wyłącznie na
własnych pojęciach oraz historii powtórek. Globalny pakiet jest tylko źródłem
kopii startowych.

**Open question.** Nie przeprowadzono jeszcze walidacji persony na realnych kandydatkach
i kandydatach do egzaminu. Przed rozbudową MVP należy przeprowadzić 3–5 rozmów
problemowych, bez prezentowania rozwiązania jako punktu wyjścia.

## MVP Discipline

### Must-have outcome

Rejestracja → pakiet startowy → wybór pojęcia → deklaracja pewności → odsłonięcie
wzorca → samoocena → aktualizacja mastery i kalibracji → rekomendacja kolejnego
pojęcia.

### Appetite

**Decision.** Pięć dni implementacji Buildera w ramach sprintu do 10 sierpnia 2026. Podstawowa wartość nie może zależeć od zewnętrznego modelu AI.

### Explicit boundaries

- Bez rozmowy z LLM i generowania treści.
- Bez płatności, zespołów, ról administracyjnych i panelu operatora.
- Bez importu PDF/CSV, powiadomień, gamifikacji i rozbudowanego SRS.
- Bez zaawansowanych wykresów, aplikacji natywnej i rozwiązań „Demo Day”, dopóki
  podstawowy przepływ nie jest ukończony.

## Draft User Stories

### US-01: Prywatne konto

- **Given** osoba nie ma aktywnej sesji
- **When** rejestruje się lub loguje poprawnymi danymi
- **Then** trafia do prywatnego obszaru nauki

### US-02: Start bez ręcznego przepisywania materiału

- **Given** zalogowany użytkownik nie ma pojęć
- **When** ładuje pakiet startowy
- **Then** otrzymuje dokładnie dziesięć edytowalnych pojęć, bez duplikatów po ponowieniu

### US-03: Zarządzanie pojęciami

- **Given** użytkownik ma prywatną kolekcję
- **When** dodaje, otwiera, zmienia albo usuwa pojęcie
- **Then** widzi trwały skutek tylko na własnym koncie

### US-04: Kalibracja wiedzy

- **Given** użytkownik wybiera pojęcie
- **When** najpierw deklaruje pewność, następnie porównuje odpowiedź ze wzorcem i wybiera wynik
- **Then** widzi zapisany wynik mastery, lukę kalibracji i termin kolejnej powtórki

### US-05: Następny temat

- **Given** kolekcja ma pojęcia z różną historią
- **When** użytkownik otwiera dashboard
- **Then** widzi jedno rekomendowane pojęcie oraz postęp pięciu domen

### US-06: Prawo do usunięcia

- **Given** pojęcie ma historię powtórek
- **When** właściciel potwierdza usunięcie pojęcia
- **Then** pojęcie i jego historia przestają być dostępne

## Draft Functional Requirements

### Identity and ownership

- FR-001: Gość może założyć konto. Priority: must-have
- FR-002: Użytkownik może zalogować się i wylogować. Priority: must-have
- FR-003: Użytkownik może odczytywać i zmieniać wyłącznie własne dane. Priority: must-have

### Learning content

- FR-004: Użytkownik może idempotentnie załadować dziesięć startowych pojęć. Priority: must-have
- FR-005: Użytkownik może utworzyć własne pojęcie. Priority: must-have
- FR-006: Użytkownik może odczytać, edytować i usunąć własne pojęcie. Priority: must-have

### Review and recommendation

- FR-007: Użytkownik może zadeklarować pewność od 1 do 5 przed samooceną. Priority: must-have
- FR-008: Użytkownik może porównać odpowiedź ze wzorcem i wybrać wynik incorrect, partial albo correct. Priority: must-have
- FR-009: Produkt aktualizuje mastery, lukę kalibracji, priorytet i następny termin po każdej powtórce. Priority: must-have
- FR-010: Produkt rekomenduje jedno następne pojęcie według reguł biznesowych. Priority: must-have
- FR-011: Użytkownik widzi zagregowany postęp w pięciu domenach. Priority: must-have
- FR-012: Usunięcie pojęcia usuwa jego historię powtórek. Priority: must-have

### Socratic challenge log

| Założenie                        | Najmocniejszy kontrargument                                         | Rozstrzygnięcie ze źródła intencji                                                                         |
| -------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Własny CRUD jest potrzebny w MVP | Pakiet startowy sam wystarczy do sprawdzenia głównej hipotezy.      | CRUD pozostaje, bo wymagany jest trwały, prywatny przedmiot pracy oraz dowód pełnego przepływu.            |
| Samoocena mierzy wiedzę          | Użytkownik może źle ocenić własną odpowiedź.                        | Interfejs nazywa wynik samooceną i pokazuje wzorzec; obiektywne sprawdzanie odpowiedzi pozostaje poza MVP. |
| LLM zwiększyłby wartość          | Zależność od modelu może blokować dostępność, koszt i testowalność. | Wartość MVP jest deterministyczna; integracja modelu jest non-goal.                                        |

## Business Logic & Product Data

**One-sentence rule.** Następny temat jest wybierany na podstawie malejącego
mastery, nadmiernej pewności i przeterminowania, przy czym pojęcia wymagające
powtórki zawsze wygrywają z tymi, których termin jeszcze nie nadszedł.

**Inputs.** Pewność 1–5, samoocena `incorrect|partial|correct`, poprzednie mastery
i wynik, termin ostatniej powtórki oraz przekazany czas „teraz”.

**Outputs.** Nowe mastery, nieujemna luka kalibracji, następny termin, priorytet
0–100 i jedno rekomendowane pojęcie. Brak historii oznacza priorytet 100.

**Product nouns.** Szablon pojęcia, prywatne pojęcie, próba powtórki, pięć domen
i rekomendacja. Szczegóły technicznego modelu danych należą do planu zmiany, nie
do PRD.

## Success & Quality Cross-Check

- **Core user flow:** obecny i kończy się widoczną rekomendacją.
- **Non-empty domain rule:** obecna, deterministyczna i możliwa do przetestowania.
- **Primary persona:** jedna; brak dowodu z wywiadów oznaczony jawnie.
- **MVP vs later:** granica wyraźna.
- **Access:** prywatne dane przypisane do właściciela.
- **Success:** użytkownik może ukończyć pierwszy przepływ w mniej niż pięć minut;
  deploy i prawdziwy E2E pozostają osobnymi dowodami operacyjnymi.

## Forward: tech-stack-selection

- Oficjalny starter 10x Astro, Node 22.14 i npm.
- Hosted Supabase z Auth oraz RLS; bez klucza service-role w aplikacji.
- Astro 6 SSR, React 19, TypeScript, Tailwind 4 i Zod.
- Cloudflare Workers jako rzeczywisty runtime docelowy; GitHub Actions jako CI.
- Vitest dla czystej domeny i Playwright dla krytycznego przepływu.

## Forward: technical-roadmap

- Najpierw pionowy przepływ auth → pusty dashboard.
- Następnie pakiet startowy i prywatny CRUD.
- Potem review engine oraz rekomendacja.
- Ochrona RLS i testy powinny powstawać razem z pierwszym zapisem danych, nie po
  ukończeniu UI.
- Publiczny deploy, hosted E2E i dowody manualne są ostatnią bramką, nie nową
  funkcjonalnością produktu.
