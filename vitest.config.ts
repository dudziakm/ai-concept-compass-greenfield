import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/scoring.ts", "src/lib/schemas.ts"],
      reporter: ["text", "json-summary"],
      thresholds: { lines: 90, functions: 90, statements: 90, branches: 85 },
    },
  },
});
