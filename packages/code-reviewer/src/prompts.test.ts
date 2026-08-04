import { describe, expect, it } from "vitest";

import { SYSTEM_PROMPT } from "./prompts.js";

describe("review scope contract", () => {
  it("keeps documentation-only reviews proportional to changed risk", () => {
    expect(SYSTEM_PROMPT).toContain("Dla PR-a wyłącznie dokumentacyjnego nie");
    expect(SYSTEM_PROMPT).toContain("wymagaj testów runtime");
    expect(SYSTEM_PROMPT).toContain("historycznego");
    expect(SYSTEM_PROMPT).toContain("pakiet jest publiczny");
    expect(SYSTEM_PROMPT).toContain("realnie osłabia kontrolę dostępu");
  });
});
