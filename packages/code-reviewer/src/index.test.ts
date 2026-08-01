import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { runCli } from "./index.js";
import { ReviewErrorSchema, ReviewResultSchema, type ReviewResult } from "./schemas.js";

const baseResult: ReviewResult = {
  verdict: "pass",
  summary: "OK",
  scores: {
    correctness: 8,
    idiomaticity: 8,
    complexity: 8,
    "test-risk-coverage": 8,
    documentation: 8,
    "security-safety": 8,
  },
  findings: [],
  usage: {
    provider: "openrouter",
    model: "test/model",
    inputTokens: 10,
    outputTokens: 5,
    totalTokens: 15,
    totalCostUsd: 0.001,
  },
  durationMs: 12,
};

describe("CLI exit codes", () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), "ai-code-reviewer-"));
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  });

  afterEach(async () => {
    vi.restoreAllMocks();
    await rm(directory, { recursive: true, force: true });
  });

  async function paths(input: unknown) {
    const inputPath = join(directory, "input.json");
    const outputPath = join(directory, "output.json");
    await writeFile(inputPath, JSON.stringify(input));
    return { inputPath, outputPath };
  }

  it("zwraca 0 dla pass", async () => {
    const { inputPath, outputPath } = await paths({ title: "ok", body: "", diff: "+safe" });
    const exitCode = await runCli(["--input", inputPath, "--output", outputPath], async () =>
      Promise.resolve(baseResult),
    );

    expect(exitCode).toBe(0);
    const output = ReviewResultSchema.parse(JSON.parse(await readFile(outputPath, "utf8")) as unknown);
    expect(output.verdict).toBe("pass");
  });

  it("zwraca 1 dla negatywnego werdyktu", async () => {
    const { inputPath, outputPath } = await paths({ title: "bug", body: "", diff: "+unsafe" });
    const exitCode = await runCli(["--input", inputPath, "--output", outputPath], async () =>
      Promise.resolve({ ...baseResult, verdict: "fail" }),
    );

    expect(exitCode).toBe(1);
  });

  it("uruchamia review dla dokładnie 50 000 znaków", async () => {
    const { inputPath, outputPath } = await paths({
      title: "t",
      body: "b",
      diff: "d".repeat(49_998),
    });
    const review = vi.fn(async () => Promise.resolve(baseResult));

    const exitCode = await runCli(["--input", inputPath, "--output", outputPath], review);

    expect(exitCode).toBe(0);
    expect(review).toHaveBeenCalledOnce();
    expect(ReviewResultSchema.parse(JSON.parse(await readFile(outputPath, "utf8")) as unknown).verdict).toBe("pass");
  });

  it("liczy title po tym samym trimie co schema wejścia", async () => {
    const { inputPath, outputPath } = await paths({
      title: " t ",
      body: "",
      diff: "d".repeat(49_999),
    });
    const review = vi.fn(async () => Promise.resolve(baseResult));

    const exitCode = await runCli(["--input", inputPath, "--output", outputPath], review);

    expect(exitCode).toBe(0);
    expect(review).toHaveBeenCalledOnce();
  });

  it("zwraca 2 dla błędu schematu bez uruchamiania reviewera", async () => {
    const { inputPath, outputPath } = await paths({ title: "", body: "", diff: "" });
    const review = vi.fn(async () => Promise.resolve(baseResult));
    const exitCode = await runCli(["--input", inputPath, "--output", outputPath], review);

    expect(exitCode).toBe(2);
    expect(review).not.toHaveBeenCalled();
    const output = ReviewErrorSchema.parse(JSON.parse(await readFile(outputPath, "utf8")) as unknown);
    expect(output.error.code).toBe("INVALID_INPUT");
  });

  it("zwraca INPUT_TOO_LARGE dla 50 001 znaków i nie uruchamia reviewera", async () => {
    const { inputPath, outputPath } = await paths({
      title: "t",
      body: "b",
      diff: "d".repeat(49_999),
    });
    const markdownOutputPath = join(directory, "comment.md");
    const review = vi.fn(async () => Promise.resolve(baseResult));

    const exitCode = await runCli(
      ["--input", inputPath, "--output", outputPath, "--markdown-output", markdownOutputPath],
      review,
    );

    expect(exitCode).toBe(2);
    expect(review).not.toHaveBeenCalled();

    const output = ReviewErrorSchema.parse(JSON.parse(await readFile(outputPath, "utf8")) as unknown);
    expect(output.error.code).toBe("INPUT_TOO_LARGE");
    expect(output.error.message).toContain("50001");

    const markdown = await readFile(markdownOutputPath, "utf8");
    expect(markdown).toContain("<!-- AI-CODE-REVIEW -->");
    expect(markdown).toContain("INPUT_TOO_LARGE");
    expect(markdown).toContain("Podziel Pull Request");
  });
});
