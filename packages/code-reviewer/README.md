# AI Code Reviewer

Lokalny i CI-owy reviewer dla ścieżki 10xChampion. Przyjmuje tytuł PR-a, opis i diff, wykonuje jedno wywołanie modelu przez AI SDK + OpenRouter, waliduje structured output w Zod i zwraca wynik możliwy do użycia jako merge gate.

## Kontrakt

### Wejście

```json
{
  "title": "fix: validate review input",
  "body": "Opis zmiany i ryzyk.",
  "diff": "diff --git ..."
}
```

`title + body + diff` ma twardy limit 50 000 jednostek JavaScript `String.length`.
Przekroczenie pełnego budżetu kończy się bezpiecznym błędem `INPUT_TOO_LARGE` i
kodem 2 przed wywołaniem modelu; należy podzielić Pull Request na mniejsze,
samodzielnie reviewowalne zmiany. Reviewer nigdy nie skraca diffu po cichu ani
nie zwraca częściowego wyniku `pass`.

### Wynik

```json
{
  "verdict": "fail",
  "summary": "Brakuje testu zmienionej reguły biznesowej.",
  "scores": {
    "correctness": 7,
    "idiomaticity": 8,
    "complexity": 8,
    "test-risk-coverage": 4,
    "documentation": 7,
    "security-safety": 9
  },
  "findings": [
    {
      "severity": "medium",
      "dimension": "test-risk-coverage",
      "file": "src/lib/scoring.ts",
      "line": 42,
      "evidence": "Nowa gałąź nie ma testu przypadku granicznego.",
      "recommendation": "Dodaj test wartości na i po obu stronach progu."
    }
  ],
  "usage": {
    "provider": "openrouter",
    "model": "openai/gpt-4o-mini",
    "inputTokens": 1200,
    "outputTokens": 180,
    "totalTokens": 1380,
    "totalCostUsd": 0.0021
  },
  "durationMs": 3400
}
```

Wymiary DoD: `correctness`, `idiomaticity`, `complexity`, `test-risk-coverage`, `documentation`, `security-safety`. Każdy prawidłowy wynik zawiera dokładnie jedną całkowitą ocenę `1..10` dla każdego wymiaru. Lokalna bramka kanonizuje wynik do `fail`, gdy dowolna ocena jest niższa niż `7` lub gdy istnieje finding `critical`, `high` albo `medium`; modelowy `fail` pozostaje `fail`. Finding `low` sam nie blokuje bramki. Błąd `ERROR` (exit `2`) nie ma ocen i nie jest findingiem kodu.

Reviewer klasyfikuje diff jako `documentation-only` tylko wtedy, gdy wszystkie
nagłówki `diff --git` wskazują pliki `.md`, `.mdx`, `.rst` lub `.txt`. Diff
mieszany, kodowy albo bez rozpoznanych nagłówków pozostaje konserwatywnie
`code-or-mixed`. Zaufana klasyfikacja trafia do promptu poza niezaufanym
payloadem PR-a. Dzięki temu zmiana dokumentacyjna nie wymaga testów runtime bez
zmiany wykonywalnego kontraktu, ale każdy niejednoznaczny przypadek zachowuje
pełne wymagania test-risk-coverage.

Kody procesu:

- `0` — poprawne review z `verdict: pass`;
- `1` — poprawne review z `verdict: fail`;
- `2` — błąd wejścia, schematu, providera, timeoutu, budżetu lub I/O.

`FAIL` nie jest wyjątkiem infrastruktury. `ERROR` nigdy nie jest przedstawiany jako finding kodu.

## Architektura

```text
src/schemas.ts          input/output/Zod + Definition of Done
src/prompts.ts          system prompt i izolacja niezaufanego PR-a
src/reviewer.ts         reusable single-shot reviewer + usage/cost/timeout
src/index.ts            cienki stdin/file CLI i kody 0/1/2
src/format-comment.ts   stały komentarz GitHub z markerem
src/evals/              6 fixture'ów offline oraz kontrakt live matrix M5L3
```

Świadomie nie używamy `ToolLoopAgent`: reviewer nie potrzebuje tools, a wymagany kontrakt dopuszcza dokładnie jedno wywołanie. To ogranicza koszt, prompt injection i blast radius.

## Limity i prywatność

- jedno `generateText`, brak tools, `maxRetries: 0`;
- timeout maksymalnie 60 s;
- maksymalnie 1 800 output tokens;
- budżet maksymalnie `$0.20/review`;
- router ograniczony do endpointów do `$1/M` input i `$5/M` output, bez dodatkowej opłaty per request, z konserwatywnym preflightem `1 znak escaped promptu = 1 token`;
- koszt z OpenRouter usage jest weryfikowany po odpowiedzi; przy braku pola `cost` używana jest estymacja według górnych stawek;
- `data_collection: deny` i `zdr: true`; structured output nadal waliduje
  `Output.object`, bez filtra `require_parameters`, który odrzucał zgodne
  endpointy ZDR;
- diff, klucz i nagłówki nie są logowane; log zawiera tylko verdict, liczbę findingów, koszt i czas;
- sticky comment pokazuje sześć ocen i zwięzły dowód findingu, ale redaguje
  surowy diff oraz rozpoznane przypisania sekretów;
- GitHub Action ma osobny limit transportowy, ale każdy diff poza pełnym budżetem
  reviewera kończy się `INPUT_TOO_LARGE` przed wywołaniem modelu;
- workflow wykonuje reviewer z zaufanego commita bazowego. Kod head PR-a nie jest checkoutowany ani wykonywany z sekretem — jest czytany tylko przez `git diff`.

Ustawienia routingu nie zastępują akceptacji polityki danych. Przed produkcją sprawdź aktualne warunki OpenRouter i konkretnego upstream providera.

## Lokalnie

```bash
cd packages/code-reviewer
npm ci
npm run typecheck
npm test
npm run eval:promptfoo
```

Offline promptfoo nie używa klucza ani modelu. Ten deterministyczny baseline sprawdza sześć stałych przypadków, pełny zestaw sześciu ocen `1..10` i kontrakt assertions. Nie jest dowodem jakości live modelu ani zastępstwem wymaganej później oceny wielomodelowej/LLM-rubric.

Prawdziwe review (klucz ma już być bezpiecznie dostępny w środowisku; nie wpisuj go do repo ani argumentu CLI):

```bash
git diff --no-ext-diff --unified=80 origin/main...HEAD \
  | PR_TITLE="feat: przykład" PR_BODY="Opis" npm run review
```

Live promptfoo dla sześciu kontraktowych fixture'ów nadal może użyć tego samego
reviewera (globalny model pozostaje tylko kompatybilnym ustawieniem CLI):

```bash
PROMPTFOO_LIVE=1 npm run eval:promptfoo
```

Każdy live case nadal ma limit `$0.20/review`; pełny run może więc kosztować do `$1.20`. Nie uruchamiaj go automatycznie bez świadomego budżetu.

### M5L3 — manualna macierz trzech modeli

`promptfoo.live.yaml` nie jest uruchamiany przez CI. Stosuje ten sam reviewer
do jednego złożonego diffu React 16 → React 19 na trzech jawnie wybranych
modelach: `z-ai/glm-5.1`, `deepseek/deepseek-v4-flash` i
`mistralai/mistral-small-3.2-24b-instruct`. Fixture ma dokładnie trzy seedowane
blokery: `ReactDOM.render`, string ref z `this.refs` oraz legacy context.

```bash
PROMPTFOO_LIVE_OPT_IN=1 npm run eval:matrix
```

Polecenie odmawia przed każdym wywołaniem bez jawnego opt-inu albo
`OPENROUTER_API_KEY`. Każdy wynik przechodzi przez osobno przypięty
LLM-as-a-judge `openrouter:openai/gpt-4o-mini` (temperatura `0`), który wymaga
wszystkich trzech findingów i sześciu ocen. To dodaje trzy wywołania judge'a
poza limitem `$0.20` pojedynczego reviewera, dlatego przed runem sprawdź aktualne
ceny/model catalog i zapisz model IDs, wynik, koszt i czas bez klucza ani diffu.

Zerokosztowy `npm run eval:promptfoo` pozostaje jedynym evalem w CI.

## CI

- reusable Composite Action: `.github/actions/ai-code-review/action.yml`;
- pipeline: `.github/workflows/ai-code-review.yml`;
- sticky marker: `<!-- AI-CODE-REVIEW -->`;
- labels: `ai-cr:passed`, `ai-cr:failed`; retry przez `ai-cr:review`;
- merge gate: natywny check `AI Code Review Gate`, nie label;
- fork PR: czerwony check bez checkoutu i bez sekretu.

Konfigurację sekretu, branch protection i dowodowych PR-ów opisuje [`context/team/reviewer-runbook.md`](../../context/team/reviewer-runbook.md).

## Weryfikacja bezpieczeństwa zależności

`npm audit --omit=dev` jest czyste (`0` podatności). Pełny audit zgłasza podatności w dużym, wyłącznie developerskim drzewie `promptfoo`; nie są one częścią runtime reviewera. Aktualizuj promptfoo i ponawiaj audit przed publikacją, ale nie używaj `npm audit fix --force` bez przeglądu zmian.

## Źródła API

- [AI SDK — structured output](https://ai-sdk.dev/docs/ai-sdk-core/generating-structured-data)
- [OpenRouter provider for AI SDK](https://github.com/OpenRouterTeam/ai-sdk-provider)
- [OpenRouter usage accounting](https://openrouter.ai/docs/use-cases/usage-accounting)
