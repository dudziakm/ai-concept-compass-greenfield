import { describe, expect, it } from "vitest";

import { buildReviewPrompt, classifyReviewScope, SYSTEM_PROMPT } from "./prompts.js";

const input = (diff: string) => ({ title: "docs: update evidence", body: "", diff });

describe("review scope contract", () => {
  it("keeps documentation-only reviews proportional to changed risk", () => {
    expect(SYSTEM_PROMPT).toContain("Dla PR-a wyłącznie dokumentacyjnego nie");
    expect(SYSTEM_PROMPT).toContain("wymagaj testów runtime");
    expect(SYSTEM_PROMPT).toContain("historycznego");
    expect(SYSTEM_PROMPT).toContain("pakiet jest publiczny");
    expect(SYSTEM_PROMPT).toContain("realnie osłabia kontrolę dostępu");
  });

  it.each([
    ["one Markdown file", "diff --git a/README.md b/README.md\n+safe docs"],
    [
      "multiple documentation formats",
      "diff --git a/docs/a.mdx b/docs/a.mdx\n+x\ndiff --git a/docs/b.rst b/docs/b.rst\n+y",
    ],
  ])("classifies %s as documentation-only", (_, diff) => {
    expect(classifyReviewScope(input(diff))).toBe("documentation-only");
    expect(buildReviewPrompt(input(diff))).toContain(
      "<trusted_review_scope>documentation-only</trusted_review_scope>",
    );
  });

  it.each([
    ["mixed code and docs", "diff --git a/README.md b/README.md\n+x\ndiff --git a/src/a.ts b/src/a.ts\n+y"],
    ["code only", "diff --git a/src/a.ts b/src/a.ts\n+y"],
    ["unrecognized input", "+free-form patch without file headers"],
  ])("keeps %s in the conservative code-or-mixed scope", (_, diff) => {
    expect(classifyReviewScope(input(diff))).toBe("code-or-mixed");
  });
});
