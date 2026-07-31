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

`title + body + diff` ma twardy limit 50 000 znaków. Pusty diff, niepoprawny JSON i przekroczenie limitu kończą się kodem 2 przed wywołaniem modelu.

### Wynik

```json
{
  "verdict": "fail",
  "summary": "Brakuje testu zmienionej reguły biznesowej.",
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

Wymiary DoD: `correctness`, `idiomaticity`, `complexity`, `test-risk-coverage`, `documentation`, `security-safety`.

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
src/evals/              6 fixture'ów, offline oracle, provider promptfoo
```

Świadomie nie używamy `ToolLoopAgent`: reviewer nie potrzebuje tools, a wymagany kontrakt dopuszcza dokładnie jedno wywołanie. To ogranicza koszt, prompt injection i blast radius.

## Limity i prywatność

- jedno `generateText`, brak tools, `maxRetries: 0`;
- timeout maksymalnie 60 s;
- maksymalnie 1 800 output tokens;
- budżet maksymalnie `$0.20/review`;
- router ograniczony do endpointów do `$1/M` input i `$5/M` output, bez dodatkowej opłaty per request, z konserwatywnym preflightem `1 znak escaped promptu = 1 token`;
- koszt z OpenRouter usage jest weryfikowany po odpowiedzi; przy braku pola `cost` używana jest estymacja według górnych stawek;
- `data_collection: deny`, `zdr: true`, `require_parameters: true`;
- diff, klucz i nagłówki nie są logowane; log zawiera tylko verdict, liczbę findingów, koszt i czas;
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

Offline promptfoo nie używa klucza ani modelu. Ten deterministyczny baseline sprawdza sześć stałych przypadków i kontrakt assertions.

Prawdziwe review (klucz ma już być bezpiecznie dostępny w środowisku; nie wpisuj go do repo ani argumentu CLI):

```bash
git diff --no-ext-diff --unified=80 origin/main...HEAD \
  | PR_TITLE="feat: przykład" PR_BODY="Opis" npm run review
```

Live promptfoo używa tego samego reviewera dla sześciu przypadków, czyli wykonuje sześć osobnych review:

```bash
PROMPTFOO_LIVE=1 npm run eval:promptfoo
```

Każdy live case nadal ma limit `$0.20/review`; pełny run może więc kosztować do `$1.20`. Nie uruchamiaj go automatycznie bez świadomego budżetu.

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
