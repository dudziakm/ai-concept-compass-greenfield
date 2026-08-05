import { describe, expect, it } from "vitest";

import { buildReviewPrompt, classifyReviewScope, SYSTEM_PROMPT } from "./prompts.js";

const input = (diff: string) => ({ title: "docs: update evidence", body: "", diff });

describe("review scope contract", () => {
  it("keeps documentation-only reviews proportional to changed risk", () => {
    expect(SYSTEM_PROMPT).toContain("Zakres documentation-only obejmuje");
    expect(SYSTEM_PROMPT).toContain("nie wymagaj testów runtime");
    expect(SYSTEM_PROMPT).toContain("historycznego");
    expect(SYSTEM_PROMPT).toContain("pakiet jest publiczny");
    expect(SYSTEM_PROMPT).toContain("realnie osłabia kontrolę dostępu");
  });

  it("tells the model that screenshots do not require a runtime test", () => {
    expect(SYSTEM_PROMPT).toContain("nieuruchamialne artefakty dowodowe");
    expect(SYSTEM_PROMPT).toContain("Dodanie samego obrazu nie jest ryzykiem wymagającym testu");
  });

  it.each([
    ["one Markdown file", "diff --git a/README.md b/README.md\n+safe docs"],
    [
      "multiple documentation formats",
      "diff --git a/docs/a.mdx b/docs/a.mdx\n+x\ndiff --git a/docs/b.rst b/docs/b.rst\n+y",
    ],
    [
      "screenshots only",
      "diff --git a/context/evidence/screenshots/builder/a.png b/context/evidence/screenshots/builder/a.png\nBinary files differ",
    ],
    [
      "screenshots alongside prose",
      "diff --git a/context/evidence/x.md b/context/evidence/x.md\n+x\ndiff --git a/e/b.jpeg b/e/b.jpeg\nBinary files differ",
    ],
  ])("classifies %s as documentation-only", (_, diff) => {
    expect(classifyReviewScope(input(diff))).toBe("documentation-only");
    expect(buildReviewPrompt(input(diff))).toContain("<trusted_review_scope>documentation-only</trusted_review_scope>");
  });

  it.each([
    ["mixed code and docs", "diff --git a/README.md b/README.md\n+x\ndiff --git a/src/a.ts b/src/a.ts\n+y"],
    ["code only", "diff --git a/src/a.ts b/src/a.ts\n+y"],
    ["unrecognized input", "+free-form patch without file headers"],
    [
      "screenshots alongside code",
      "diff --git a/e/a.png b/e/a.png\nBinary files differ\ndiff --git a/src/a.ts b/src/a.ts\n+y",
    ],
    ["an SVG, which can carry script", "diff --git a/public/logo.svg b/public/logo.svg\n+<svg/>"],
  ])("keeps %s in the conservative code-or-mixed scope", (_, diff) => {
    expect(classifyReviewScope(input(diff))).toBe("code-or-mixed");
  });
});
