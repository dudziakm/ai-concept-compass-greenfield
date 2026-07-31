#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";

import { ReviewInfrastructureError, toReviewError } from "./errors.js";
import { formatErrorComment, formatReviewComment } from "./format-comment.js";
import { reviewPullRequest } from "./reviewer.js";
import { ReviewInputSchema, type ReviewInput, type ReviewResult } from "./schemas.js";

interface CliOptions {
  diffFile: string | undefined;
  inputFile: string | undefined;
  outputFile: string | undefined;
  markdownOutputFile: string | undefined;
}

function readOption(args: string[], name: string): string | undefined {
  const position = args.indexOf(name);
  if (position === -1) return undefined;
  const value = args[position + 1];
  if (!value || value.startsWith("--")) {
    throw new ReviewInfrastructureError("INVALID_INPUT", `Opcja ${name} wymaga wartości.`);
  }
  return value;
}

function parseOptions(args: string[]): CliOptions {
  const options = {
    diffFile: readOption(args, "--diff-file"),
    inputFile: readOption(args, "--input"),
    outputFile: readOption(args, "--output"),
    markdownOutputFile: readOption(args, "--markdown-output"),
  };

  if (options.diffFile && options.inputFile) {
    throw new ReviewInfrastructureError("INVALID_INPUT", "Użyj tylko jednego z --diff-file albo --input.");
  }

  return options;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function readInput(options: CliOptions): Promise<unknown> {
  try {
    if (options.inputFile) {
      return JSON.parse(await readFile(options.inputFile, "utf8")) as unknown;
    }

    const rawDiff = options.diffFile ? await readFile(options.diffFile, "utf8") : await readStdin();
    const trimmed = rawDiff.trimStart();

    if (!options.diffFile && trimmed.startsWith("{")) {
      return JSON.parse(rawDiff) as unknown;
    }

    return {
      title: process.env.PR_TITLE ?? "Lokalny diff",
      body: process.env.PR_BODY ?? "",
      diff: rawDiff,
    } satisfies ReviewInput;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ReviewInfrastructureError("INVALID_INPUT", "Wejście nie jest poprawnym JSON-em.", {
        cause: error,
      });
    }
    if (error instanceof ReviewInfrastructureError) throw error;
    throw new ReviewInfrastructureError("IO_ERROR", "Nie udało się odczytać wejścia review.", {
      cause: error,
    });
  }
}

async function writeOutput(path: string | undefined, content: string): Promise<void> {
  if (path) {
    try {
      await writeFile(path, `${content}\n`, { encoding: "utf8", mode: 0o600 });
      return;
    } catch (error) {
      throw new ReviewInfrastructureError("IO_ERROR", "Nie udało się zapisać wyniku review.", {
        cause: error,
      });
    }
  }
  process.stdout.write(`${content}\n`);
}

type ReviewFunction = (input: unknown) => Promise<ReviewResult>;

export async function runCli(
  args = process.argv.slice(2),
  review: ReviewFunction = reviewPullRequest,
): Promise<number> {
  let options: CliOptions = {
    diffFile: undefined,
    inputFile: undefined,
    outputFile: undefined,
    markdownOutputFile: undefined,
  };

  try {
    options = parseOptions(args);
    const input = ReviewInputSchema.parse(await readInput(options));
    const result = await review(input);
    await writeOutput(options.outputFile, JSON.stringify(result, null, 2));

    if (options.markdownOutputFile) {
      await writeOutput(options.markdownOutputFile, formatReviewComment(result));
    }

    if (options.outputFile) {
      process.stderr.write(
        `AI review: verdict=${result.verdict} findings=${result.findings.length} cost_usd=${result.usage.totalCostUsd.toFixed(4)} duration_ms=${result.durationMs}\n`,
      );
    }

    return result.verdict === "pass" ? 0 : 1;
  } catch (error) {
    const reviewError = toReviewError(error);
    try {
      await writeOutput(options.outputFile, JSON.stringify(reviewError, null, 2));
      if (options.markdownOutputFile) {
        await writeOutput(options.markdownOutputFile, formatErrorComment(reviewError));
      }
    } catch {
      // Ostatnia bezpieczna ścieżka: żadnych sekretów ani wejściowego diffu w logu.
    }
    process.stderr.write(`AI review error: code=${reviewError.error.code} message=${reviewError.error.message}\n`);
    return 2;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await runCli();
}
