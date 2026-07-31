import { toReviewError } from "../errors.js";
import { ReviewInputSchema, type ReviewDecision, type ReviewDimension, type ReviewInput } from "../schemas.js";

function fail(dimension: ReviewDimension, file: string, evidence: string, recommendation: string): ReviewDecision {
  return {
    verdict: "fail",
    summary: "Deterministyczny oracle wykrył blokujący wzorzec w kontrolowanym diffie.",
    findings: [
      {
        severity: dimension === "security-safety" ? "critical" : "medium",
        dimension,
        file,
        line: 1,
        evidence,
        recommendation,
      },
    ],
  };
}

export function runOfflineOracle(rawInput: unknown): ReviewDecision | ReturnType<typeof toReviewError> {
  const parsed = ReviewInputSchema.safeParse(rawInput);
  if (!parsed.success) return toReviewError(parsed.error);

  const input: ReviewInput = parsed.data;
  const diff = input.diff;

  if (/SERVICE_ROLE_KEY|dangerouslySetInnerHTML|\beval\s*\(/.test(diff)) {
    return fail(
      "security-safety",
      "src/lib/admin-client.ts",
      "Diff ujawnia sekret lub wprowadza niebezpieczne wykonanie danych.",
      "Usuń sekret z kodu, unieważnij go i przenieś operację do zaufanej granicy serwerowej.",
    );
  }

  if (diff.includes("calculateDiscount") && !diff.includes(".test.") && !diff.includes(".spec.")) {
    return fail(
      "test-risk-coverage",
      "src/lib/discount.ts",
      "Nowa reguła rabatowa nie ma testów wartości granicznych.",
      "Dodaj testy poniżej, na i powyżej progu rabatowego.",
    );
  }

  if ((diff.match(/^\+\s*if\s*\(/gm)?.length ?? 0) >= 4) {
    return fail(
      "complexity",
      "src/lib/next.ts",
      "Cztery zagnieżdżone warunki ukrywają prostą regułę wyboru.",
      "Zastosuj guard clauses albo jawny ranking i dodaj test zachowania.",
    );
  }

  if (
    diff.includes("src/pages/api/public/") &&
    !diff.includes("README") &&
    !diff.includes("/**") &&
    !diff.toLowerCase().includes("openapi")
  ) {
    return fail(
      "documentation",
      "src/pages/api/public/export.ts",
      "Publiczny endpoint nie opisuje odpowiedzi, błędów ani zasad autoryzacji.",
      "Udokumentuj kontrakt, statusy błędów i wymagania dostępu.",
    );
  }

  return {
    verdict: "pass",
    summary: "Kontrolowany diff spełnia deterministyczne oczekiwania baseline'u.",
    findings: [],
  };
}
