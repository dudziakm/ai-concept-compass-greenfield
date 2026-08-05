import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

const HOOK = resolve(process.cwd(), "scripts/post-edit-quality.sh");
const temporaryDirectories: string[] = [];

/**
 * Installs an `npm` shim that fails for the named scripts and succeeds otherwise, so the
 * hook's exit-code mapping is tested without running the real lint and typecheck.
 */
function shimDirectory(failing: readonly string[]): string {
  const directory = mkdtempSync(join(tmpdir(), "hook-shim-"));
  temporaryDirectories.push(directory);
  const shim = join(directory, "npm");
  writeFileSync(
    shim,
    [
      "#!/usr/bin/env bash",
      'script="${*: -1}"',
      `for failing in ${failing.length > 0 ? failing.join(" ") : '""'}; do`,
      '  if [ "$script" = "$failing" ]; then',
      '    echo "simulated ${script} failure" >&2',
      "    exit 1",
      "  fi",
      "done",
      "exit 0",
    ].join("\n"),
  );
  chmodSync(shim, 0o755);
  return directory;
}

function runHook(failing: readonly string[], cwd = process.cwd()) {
  const shim = shimDirectory(failing);
  return spawnSync("bash", [HOOK], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, PATH: `${shim}:${process.env.PATH ?? ""}` },
  });
}

afterAll(() => {
  for (const directory of temporaryDirectories) {
    spawnSync("rm", ["-r", directory]);
  }
});

describe("post-edit quality hook exit codes", () => {
  it("exits 0 when both checks pass", () => {
    const result = runHook([]);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("lint and typecheck passed");
  });

  it("exits 2 and names lint when only lint fails", () => {
    const result = runHook(["lint"]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("npm run lint failed");
    expect(result.stderr).not.toContain("npm run typecheck failed");
  });

  it("exits 2 and names typecheck when only typecheck fails", () => {
    const result = runHook(["typecheck"]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("npm run typecheck failed");
  });

  it("reports both checks when both fail, rather than stopping at the first", () => {
    const result = runHook(["lint", "typecheck"]);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("npm run lint failed");
    expect(result.stderr).toContain("npm run typecheck failed");
  });

  it("exits 2 rather than 128 when there is no git repository to resolve", () => {
    const outside = mkdtempSync(join(tmpdir(), "hook-outside-"));
    temporaryDirectories.push(outside);

    const result = runHook([], outside);

    expect(result.status).toBe(2);
    expect(result.stderr).toContain("not inside a git repository");
  });
});
