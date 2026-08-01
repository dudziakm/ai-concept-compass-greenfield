# AI Concept Compass

Polskojęzyczna aplikacja do kalibracji wiedzy przed AWS Certified AI
Practitioner. Użytkownik deklaruje pewność, odpowiada własnymi słowami, porównuje
odpowiedź ze wzorcem i otrzymuje deterministyczną rekomendację kolejnego tematu.

MVP celowo nie używa LLM. Jego wartość — wykrywanie luk mastery i nadmiernej
pewności — działa przewidywalnie, tanio i jest w pełni testowalna.

> **Stan 1 sierpnia 2026:** aplikacja działa publicznie na
> [Cloudflare Workers](https://ai-concept-compass.dudziak-michal.workers.dev).
> Hosted RLS oraz krytyczny E2E dla aktualnego kodu przeszły w kontrolowanym
> środowisku, ale publiczny Worker nie jest obecnie dowodem tego przepływu: po
> edycji karty publiczny E2E oczekiwał pozycji `3`, a otrzymał `9`. Należy
> wdrożyć przetestowaną rewizję, następnie ponownie uruchomić publiczny flow i
> dopiero wtedy uznać go za zielony. Końcowy smoke świeżej rejestracji z
> prawdziwym e-mailem i screenshoty z publicznego środowiska pozostają osobnymi,
> jawnymi krokami przed wysłaniem formularza.
> Run `30662052616` nie jest dowodem zielonego pełnego CI: job `quality`
> przeszedł, ale hosted `e2e` i `rls` zakończyły się przed testami, ponieważ
> wymagane GitHub Actions Secrets nie były ustawione. Pełne CI będzie dowodem
> dopiero po jednym runie z zielonymi jobami `quality`, `e2e` i `rls` dla
> właściwej rewizji. Hosted RLS/E2E były dodatkowo wykonane lokalnie przeciwko
> prawdziwemu projektowi Supabase.

## Najważniejszy przepływ

```text
logowanie → pakiet 10 pojęć → pewność 1–5 → odpowiedź
→ samoocena wyniku → mastery + luka kalibracji → rekomendacja
```

Pakiet jest autorski i oparty na oficjalnym [AWS Certified AI Practitioner
Exam Guide](https://docs.aws.amazon.com/aws-certification/latest/ai-practitioner-01/ai-practitioner-01.html)
dla blueprintu AIF-C01 v1.1. Repozytorium nie zawiera skopiowanych pytań
egzaminacyjnych.

## Stack

- Astro 6 SSR, React 19, TypeScript i Tailwind CSS 4;
- hosted Supabase: PostgreSQL, Auth i Row Level Security;
- Cloudflare Workers;
- Zod 4, Vitest 4 i Playwright;
- GitHub Actions na Node 22.14.

```mermaid
flowchart LR
  B[Astro + React] -->|anon key + sesja| S[Supabase Auth]
  B --> A[Astro API routes]
  A -->|JWT użytkownika| P[(PostgreSQL + RLS)]
  A --> D[Deterministyczny scoring]
  D --> B
```

Klucz `service_role` nie jest używany przez aplikację. Każdy zapis przekazuje
`user_id` zalogowanego użytkownika, a baza niezależnie wymusza ten sam warunek
przez RLS.

## Logika rekomendacji

- wynik: incorrect `0`, partial `50`, correct `100`;
- pewność: `(confidence - 1) × 25`;
- mastery: pierwszy wynik albo `0.6 × poprzednie + 0.4 × wynik`;
- nadmierna pewność: `max(0, pewność - wynik)`;
- powtórka: `+1`, `+3`, `+7`, a po dwóch poprawnych `+14` dni;
- priority: 70% luki mastery + 30% nadmiernej pewności + do 20 punktów
  przeterminowania, zawsze w zakresie 0–100;
- nowe pojęcie ma priorytet 100; terminy wymagające powtórki wygrywają przed
  samym wynikiem priority.

`now` jest przekazywane do funkcji domenowych, dzięki czemu testy nie zależą od
zegara systemowego.

## API

| Metoda               | Endpoint                    | Cel                               |
| -------------------- | --------------------------- | --------------------------------- |
| GET / POST           | `/api/concepts`             | lista i tworzenie pojęć           |
| GET / PATCH / DELETE | `/api/concepts/:id`         | odczyt, edycja i usunięcie        |
| POST                 | `/api/concepts/:id/reviews` | zapis oceny i scoring             |
| POST                 | `/api/starter-pack`         | idempotentne dodanie 10 szablonów |
| GET                  | `/api/dashboard`            | postęp domen i rekomendacja       |

Zapisy są walidowane przez Zod. Błędy mają wspólny format JSON i statusy
400/401/404/409/500.

## Uruchomienie

Wymagany jest Node 22.14 (`.nvmrc`) oraz projekt Supabase.

```bash
npm install
cp .env.example .env
```

W `.env` ustaw `SUPABASE_URL` i publiczny klucz anon/publishable
`SUPABASE_KEY`. Następnie połącz projekt i zastosuj migrację:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
npm run dev
```

Migracja `supabase/migrations/20260731190000_ai_concept_compass.sql` tworzy
tabele, polityki RLS, indeksy i pakiet 10 szablonów. Logowanie do Supabase jest
czynnością użytkownika; sekret dostępu nie trafia do repozytorium.

## Testy i bramki

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

Lokalny pakiet ma 53 testy scoringu, schematów, migracji oraz tras API i 100%
pokrycia instrukcji, funkcji, linii oraz gałęzi silnika scoringu. Statyczny test
migracji sprawdza RLS, cascade i idempotencję; osobny hosted harness wykonuje
rzeczywistą macierz dwóch użytkowników. 1 sierpnia 2026 macierz przeszła 3/3.

E2E wymaga potwierdzonego konta testowego oraz zmiennych
`E2E_USER_EMAIL`/`E2E_USER_PASSWORD`:

```bash
npx playwright install chromium
npm run test:e2e
```

Setup Playwright loguje konto raz do `storageState` i czyści jego dane. Główny
scenariusz przechodzi przez prawdziwe auth, routing, API i bazę: pakiet → edycja
→ review → rekomendacja → usunięcie. Artefakty uwierzytelnienia są ignorowane
przez Git. Krytyczny scenariusz przeszedł również pięć kolejnych powtórzeń bez
niestabilności. Sama trasa rejestracji ma test integracyjny; pełna rejestracja z
potwierdzeniem e-mail pozostaje manualnym testem hosted, ponieważ zależy od
zewnętrznego dostawcy poczty.

Test RLS wymaga dwóch potwierdzonych zwykłych kont i świadomie nie używa
`service_role`:

```bash
SUPABASE_URL=... SUPABASE_KEY=... \
RLS_USER_A_EMAIL=... RLS_USER_A_PASSWORD=... \
RLS_USER_B_EMAIL=... RLS_USER_B_PASSWORD=... npm run test:rls
```

CI wymaga czterech sekretów E2E (`SUPABASE_URL`, `SUPABASE_KEY`,
`E2E_USER_EMAIL`, `E2E_USER_PASSWORD`) oraz danych dwóch kont `RLS_USER_A_*` i
`RLS_USER_B_*`. Quality, E2E i RLS są osobnymi bramkami merge.

### Hook jakości po edycji (M3L3)

Projektowy hook Codexa w [`.codex/hooks.json`](.codex/hooks.json) reaguje tylko
po wywołaniu narzędzia `apply_patch`. Uruchamia
[`scripts/post-edit-quality.sh`](scripts/post-edit-quality.sh), który odnajduje
root repozytorium przez Git, a następnie wykonuje szybkie `npm run lint` i
`npm run typecheck`. Handler ma limit 120 sekund. To lokalny feedback po edycji,
nie zamiennik testów, CI, review ani sprawdzeń hosted.

Codex nie uruchomi nowego hooka automatycznie: użytkownik musi ręcznie otworzyć
`/hooks`, sprawdzić dokładną definicję projektu i ją zaufać (trust). Zmiana lub
brak trustu oznacza, że hook pozostaje pominięty. Skrypt nie odczytuje ani nie
loguje plików `.env`.

## Wdrożenie na Cloudflare Workers

Po zalogowaniu do Cloudflare ustaw dwa sekrety i wdroż aplikację:

```bash
npx wrangler login
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_KEY
npx wrangler deploy
```

Dodaj publiczny URL do listy dozwolonych redirect URL w Supabase Auth.

## Dokumentacja procesu

- [Shape notes](context/foundation/shape-notes.md)
- [PRD](context/foundation/prd.md)
- [Wymagania biznesowe i traceability](context/foundation/business-requirements.md)
- [Tech stack](context/foundation/tech-stack.md)
- [Wymagania techniczne](context/foundation/technical-requirements.md)
- [Infrastruktura i granice sekretów](context/foundation/infrastructure.md)
- [Roadmapa i dependency graph](context/foundation/roadmap.md)
- [Plan testów](context/foundation/test-plan.md)
- [Research, plan wdrożenia i bieżący postęp](context/changes/ai-concept-compass-mvp/plan.md)
- [Specyfikacja API](context/changes/ai-concept-compass-mvp/specs/api.md)
- [Specyfikacja bazy i RLS](context/changes/ai-concept-compass-mvp/specs/database.md)
- [Specyfikacja UI](context/changes/ai-concept-compass-mvp/specs/ui.md)
- [Plan deployu](context/deployment/deploy-plan.md)
- [Audyt MVP](context/evidence/builder-mvp-check.md)
- [Agent code review — runbook](context/team/reviewer-runbook.md)

## Jak AI wspierało proces

Codex pomógł rozbić zakres na testowalne granice, przygotować migrację, API,
interfejs i testy oraz wykonywał każdą bramkę jakości. Reguły biznesowe, zakres
MVP, źródło treści i kryteria akceptacji pozostają jawne w repozytorium, zamiast
być ukryte w promptach lub wyniku modelu.

## Licencja

MIT
