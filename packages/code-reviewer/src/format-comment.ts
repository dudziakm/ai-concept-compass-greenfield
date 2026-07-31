import type { ReviewError, ReviewResult } from "./schemas.js";

export const REVIEW_COMMENT_MARKER = "<!-- AI-CODE-REVIEW -->";

function formatLocation(file: string, line: number | null): string {
  return line === null ? `\`${file}\`` : `\`${file}:${line}\``;
}

export function formatReviewComment(result: ReviewResult): string {
  const verdict = result.verdict === "pass" ? "✅ PASS" : "❌ FAIL";
  const findings =
    result.findings.length === 0
      ? "Brak findingów."
      : result.findings
          .map(
            (finding) =>
              `- **${finding.severity.toUpperCase()} · ${finding.dimension}** — ${formatLocation(
                finding.file,
                finding.line,
              )}\n  - Dowód: ${finding.evidence}\n  - Rekomendacja: ${finding.recommendation}`,
          )
          .join("\n");

  return `${REVIEW_COMMENT_MARKER}
## AI Code Review — ${verdict}

${result.summary}

### Findings

${findings}

### Telemetria

- Model: \`${result.usage.model}\`
- Tokeny: ${result.usage.totalTokens} (input ${result.usage.inputTokens}, output ${result.usage.outputTokens})
- Koszt: $${result.usage.totalCostUsd.toFixed(4)}
- Czas: ${result.durationMs} ms

_Wynik został zwalidowany schematem. Finding review (exit 1) i awaria infrastruktury (exit 2) są rozdzielone._`;
}

export function formatErrorComment(error: ReviewError): string {
  return `${REVIEW_COMMENT_MARKER}
## AI Code Review — ⚠️ ERROR

Reviewer nie zakończył oceny. To błąd infrastruktury lub kontraktu, a nie negatywny werdykt kodu.

- Kod: \`${error.error.code}\`
- Komunikat: ${error.error.message}

_Check pozostaje czerwony. Po naprawieniu przyczyny dodaj label \`ai-cr:review\`, aby ponowić review._`;
}
