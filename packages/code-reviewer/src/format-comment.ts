import { REVIEW_DIMENSIONS, type ReviewError, type ReviewResult } from "./schemas.js";

export const REVIEW_COMMENT_MARKER = "<!-- AI-CODE-REVIEW -->";

function redactCommentText(value: string): string {
  return value
    .replace(/\bdiff --git\b[\s\S]*/gi, "[zredagowano surowy diff]")
    .replace(
      /\b(?:OPENROUTER_API_KEY|SERVICE_ROLE_KEY|SUPABASE_(?:URL|KEY)|authorization|api[_-]?key|token|secret)\b\s*[:=]\s*["']?[^\s\x60"',]+/gi,
      "[zredagowano sekret]",
    );
}

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
              )}\n  - Dowód: ${redactCommentText(finding.evidence)}\n  - Rekomendacja: ${redactCommentText(finding.recommendation)}`,
          )
          .join("\n");

  return `${REVIEW_COMMENT_MARKER}
## AI Code Review — ${verdict}

${redactCommentText(result.summary)}

### Oceny DoD

${REVIEW_DIMENSIONS.map((dimension) => `- \`${dimension}\`: ${result.scores[dimension]}/10`).join("\n")}

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
- Komunikat: ${redactCommentText(error.error.message)}

_Check pozostaje czerwony. Po naprawieniu przyczyny dodaj label \`ai-cr:review\`, aby ponowić review._`;
}
