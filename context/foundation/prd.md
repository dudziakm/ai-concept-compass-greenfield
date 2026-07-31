---
project: "AI Concept Compass"
version: 1
status: draft
created: 2026-07-31
context_type: greenfield
product_type: web-app
target_scale:
  users: small
  qps: "low; planning assumption below 5 peak requests/second"
  data_volume: "small; planning assumption below 10000 review attempts in MVP"
timeline_budget:
  mvp_weeks: 2
  hard_deadline: 2026-08-10
  after_hours_only: true
---

# PRD — AI Concept Compass

> Product contract derived from `shape-notes.md`. The product name and exam
> domain are domain context, not a technology-stack decision. Planning
> assumptions that still require real-user validation are listed under Open
> Questions.

## Vision & Problem Statement

Polskojęzyczna osoba przygotowująca się do AWS Certified AI Practitioner może
rozpoznawać terminy bez umiejętności ich samodzielnego wyjaśnienia. Zwykła lista
fiszek nie pokazuje, gdzie pewność jest większa od wiedzy, więc użytkownik traci
czas na powtarzanie niewłaściwych tematów.

Wartość produktu wynika z połączenia deklaracji pewności przed odpowiedzią z
późniejszą samooceną. Deterministyczna rekomendacja ma wskazać następny temat bez
uzależniania podstawowego przepływu od generowania treści.

## User & Persona

**Primary persona:** polskojęzyczna osoba ucząca się samodzielnie do egzaminu
AIF-C01, korzystająca z krótkich sesji powtórkowych. Otwiera produkt, gdy chce w
kilka minut odpowiedzieć na pytanie „czego uczyć się dalej?”.

## Success Criteria

### Primary

- Nowy użytkownik kończy przepływ rejestracja → pakiet → pierwsza powtórka →
  rekomendacja w mniej niż 5 minut.
- Dwa różne konta nie mogą odczytać, zmienić ani usunąć swoich danych nawzajem.

### Secondary

- Użytkownik widzi mastery dla pięciu domen i potrafi wskazać najsłabszą z nich.
- Ponowne załadowanie pakietu nie zwiększa liczby skopiowanych szablonów.

### Guardrails

- Żaden sekret administracyjny ani prywatna historia nauki nie jest dostępna dla
  innego użytkownika lub w publicznie dostarczonym kodzie aplikacji.
- Niepoprawny zapis nie zmienia danych i kończy się jednoznacznym komunikatem.
- Podstawowy przepływ pozostaje używalny w widoku mobilnym 360 px i za pomocą
  klawiatury.

## User Stories

### US-01: Prywatne konto

- **Given** osoba nie ma aktywnej sesji
- **When** rejestruje się albo loguje poprawnymi danymi
- **Then** trafia do własnego obszaru nauki, a gość nie uzyskuje do niego dostępu

#### Acceptance Criteria

- Użytkownik może się zarejestrować, zalogować i wylogować.
- Wejście gościa do prywatnego obszaru prowadzi do logowania.
- Nieudane logowanie nie ujawnia danych konta.

### US-02: Pakiet startowy

- **Given** zalogowany użytkownik nie ma pojęć
- **When** wybiera załadowanie pakietu
- **Then** otrzymuje dziesięć prywatnych, edytowalnych pojęć

#### Acceptance Criteria

- Każde pojęcie ma domenę, opis, pytanie kontrolne, wzorzec i źródło.
- Drugie wykonanie nie tworzy duplikatów.
- Treści są autorskie i wskazują oficjalny blueprint AIF-C01 v1.1 jako źródło.

### US-03: Własna kolekcja pojęć

- **Given** użytkownik ma prywatną kolekcję
- **When** dodaje, odczytuje, edytuje albo usuwa pojęcie
- **Then** widzi trwały skutek wyłącznie na własnym koncie

#### Acceptance Criteria

- Tytuł, domena, opis, pytanie i wzorzec mają jawne ograniczenia wejścia.
- Odczyt lub zmiana nieistniejącego albo cudzego pojęcia nie ujawnia jego treści.
- Usunięcie pojęcia usuwa również jego historię.

### US-04: Kalibracja wiedzy

- **Given** użytkownik wybiera pojęcie
- **When** deklaruje pewność, odsłania wzorzec i wybiera wynik samooceny
- **Then** zapisuje się mastery, luka kalibracji, priorytet i następny termin

#### Acceptance Criteria

- Pewność mieści się w zakresie 1–5, a wynik ma jedną z trzech wartości.
- Wzorzec odpowiedzi jest dostępny przed wyborem wyniku.
- Dwie kolejne poprawne odpowiedzi wydłużają odstęp do 14 dni.

### US-05: Rekomendacja następnego tematu

- **Given** pojęcia mają różną historię i terminy
- **When** użytkownik otwiera obszar nauki po powtórce
- **Then** widzi jedno rekomendowane pojęcie i postęp pięciu domen

#### Acceptance Criteria

- Pojęcia wymagające powtórki wygrywają z przyszłymi terminami.
- Przy równym stanie wygrywa wyższy priorytet, a dalej najstarsza próba.
- Nowe pojęcie bez historii ma priorytet 100.

### US-06: Prawo do usunięcia

- **Given** pojęcie ma historię powtórek
- **When** właściciel potwierdza usunięcie pojęcia
- **Then** pojęcie i jego historia przestają być dostępne

#### Acceptance Criteria

- Usunięcie wymaga jawnego potwierdzenia wskazującego skutek dla historii.
- Usunięcie cudzego albo nieistniejącego pojęcia nie ujawnia jego treści.
- Po udanym usunięciu pojęcie znika z kolekcji, a próby są usuwane przez relację `ON DELETE CASCADE`.

### US-07: Pusty i błędny stan

- **Given** kolekcja jest pusta albo operacja się nie powiodła
- **When** użytkownik otwiera obszar nauki lub wykonuje akcję
- **Then** otrzymuje jasny następny krok albo komunikat bez utraty istniejących danych

#### Acceptance Criteria

- Pusty stan prowadzi do pakietu startowego albo ręcznego dodania pojęcia.
- Operacja w toku jest widoczna i nie pozwala na przypadkowe podwójne wysłanie.
- Błąd pozostaje czytelny i nie usuwa wcześniej załadowanego widoku.

## Functional Requirements

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

## Non-Functional Requirements

- NFR-001: Użytkownik otrzymuje widoczne potwierdzenie akcji w ciągu 500 ms; przy dłuższej
  operacji widzi ciągłą informację o trwaniu.
- NFR-002: Dla kolekcji do 100 pojęć wynik obszaru nauki pojawia się w ciągu 2 s przy
  typowym połączeniu szerokopasmowym.
- NFR-003: Prywatne dane jednego konta nigdy nie są zwracane ani modyfikowane w kontekście
  innego konta.
- NFR-004: Wszystkie niepoprawne dane zapisu są odrzucane przed trwałą zmianą, z kategorią
  błędu rozróżniającą brak dostępu, brak zasobu, konflikt i błąd danych.
- NFR-005: Krytyczny przepływ działa w najnowszych dwóch głównych wersjach Chrome,
  Firefox, Safari i Edge oraz w widoku o szerokości 360 px.
- NFR-006: Reguły wyniku dają identyczny rezultat dla identycznych wejść i jawnie
  wskazanego czasu „teraz”.

## Business Logic

Następny temat jest wybierany na podstawie malejącego mastery, nadmiernej
pewności i przeterminowania, przy czym pojęcia wymagające powtórki zawsze
wygrywają z tymi, których termin jeszcze nie nadszedł.

Wynik samooceny przyjmuje 0, 50 albo 100, a deklarowana pewność skaluje się od 0
do 100. Pierwsze mastery równa się wynikowi; kolejne zachowuje 60% poprzedniej
wartości i 40% nowego wyniku. Nadmierna pewność jest dodatnią różnicą między
pewnością a wynikiem.

Priorytet łączy 70% luki mastery, 30% nadmiernej pewności i maksymalnie 20
punktów za przeterminowanie, z wynikiem ograniczonym do 0–100. Terminy wynoszą
1, 3 lub 7 dni, a po dwóch kolejnych poprawnych odpowiedziach 14 dni.

## Access Control

Gość może zobaczyć opis produktu oraz formularze rejestracji i logowania.
Zalogowany użytkownik może przeglądać globalne szablony, ale nie może ich
zmieniać. Może tworzyć, czytać, edytować i usuwać wyłącznie własne pojęcia oraz
dodawać i czytać wyłącznie własne próby powtórek. Próba dostępu do cudzego
zasobu zachowuje się jak brak zasobu.

## Non-Goals

- Brak rozmowy z modelem lub generowania treści — wartość MVP ma być dostępna i
  testowalna bez zewnętrznej inferencji.
- Brak automatycznego oceniania odpowiedzi — MVP jawnie korzysta z samooceny.
- Brak płatności, zespołów, ról i panelu administratora — produkt służy jednej
  osobie na konto.
- Brak importu PDF/CSV i masowego tworzenia materiałów — pakiet i ręczny CRUD
  wystarczają do sprawdzenia przepływu.
- Brak powiadomień, gamifikacji, zaawansowanego SRS i rozbudowanych wykresów —
  nie są potrzebne do rekomendacji następnego tematu.
- Brak aplikacji natywnej, pracy offline, wieloregionowego SLA i formalnej
  certyfikacji zgodności — poza jakością MVP.

## Open Questions

1. **Czy planowana skala „small” odpowiada realnemu użyciu po publikacji?** —
   Owner: product owner. By: przed decyzją o wyjściu poza darmowe limity. Block:
   no dla MVP.
2. **Czy użytkownicy poprawnie rozumieją samoocenę i wzorzec odpowiedzi?** —
   Owner: product owner. Resolve przez 3–5 testów użyteczności. Block: no dla
   wdrożenia technicznego, yes dla rozbudowy mechanizmu.
3. **Jaki jest publiczny URL produkcyjny?** — Owner: product owner. By:
   2026-08-10. Block: yes dla końcowego dowodu wdrożenia.
