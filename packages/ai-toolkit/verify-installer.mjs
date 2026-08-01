import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = mkdtempSync(path.join(os.tmpdir(), "ai-toolkit-consumer-"));
const environment = { ...process.env, PROJECT_ROOT: projectRoot };
const manifestPath = path.join(projectRoot, ".claude", ".ai-toolkit-manifest.json");
const skillPath = path.join(projectRoot, ".claude", "skills", "code-review", "SKILL.md");
const extraPath = path.join(projectRoot, ".claude", "skills", "code-review", "local-note.md");
const outsidePath = path.join(projectRoot, "outside.txt");
const rulesPath = path.join(projectRoot, "CLAUDE.md");
const begin = "<!-- BEGIN @dudziakm/ai-toolkit -->";
const end = "<!-- END @dudziakm/ai-toolkit -->";

try {
  writeFileSync(path.join(projectRoot, "package.json"), '{"name":"temporary-consumer"}\n');
  writeFileSync(rulesPath, "# Consumer rules\n\nKeep this text.\n");
  mkdirSync(path.dirname(extraPath), { recursive: true });
  writeFileSync(extraPath, "keep this user-owned file\n");

  execFileSync(process.execPath, ["install.js"], { cwd: packageRoot, env: environment, stdio: "pipe" });
  execFileSync(process.execPath, ["install.js"], { cwd: packageRoot, env: environment, stdio: "pipe" });

  const installedRules = readFileSync(rulesPath, "utf8");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  assert.ok(existsSync(skillPath), "installer copies the managed skill");
  assert.ok(existsSync(extraPath), "installer preserves an unrelated local skill file");
  assert.equal(installedRules.split(begin).length - 1, 1, "install is idempotent for the begin sentinel");
  assert.equal(installedRules.split(end).length - 1, 1, "install is idempotent for the end sentinel");
  assert.match(installedRules, /Keep this text/, "installer preserves consumer rules");
  assert.equal(manifest.package, "@dudziakm/ai-toolkit");
  assert.equal(manifest.version, "0.1.0");
  assert.deepEqual(manifest.files, [".claude/skills/code-review/SKILL.md", "CLAUDE.md"]);

  const newerPackageRoot = mkdtempSync(path.join(os.tmpdir(), "ai-toolkit-vnext-"));
  cpSync(packageRoot, newerPackageRoot, { recursive: true });
  const newerPackageJsonPath = path.join(newerPackageRoot, "package.json");
  const newerPackageJson = JSON.parse(readFileSync(newerPackageJsonPath, "utf8"));
  newerPackageJson.version = "0.1.1";
  writeFileSync(newerPackageJsonPath, `${JSON.stringify(newerPackageJson, null, 2)}\n`);
  execFileSync(process.execPath, ["install.js"], { cwd: newerPackageRoot, env: environment, stdio: "pipe" });
  assert.equal(
    JSON.parse(readFileSync(manifestPath, "utf8")).version,
    "0.1.1",
    "upgrade replaces the manifest version",
  );
  assert.equal(readFileSync(rulesPath, "utf8").split(begin).length - 1, 1, "upgrade does not duplicate rules");
  rmSync(newerPackageRoot, { recursive: true, force: true });

  writeFileSync(outsidePath, "must remain untouched\n");
  const hostileManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  hostileManifest.files.push("../../outside.txt", "/tmp/outside.txt", "not-managed.txt");
  writeFileSync(manifestPath, `${JSON.stringify(hostileManifest, null, 2)}\n`);
  execFileSync(process.execPath, ["uninstall.js"], { cwd: packageRoot, env: environment, stdio: "pipe" });
  const uninstalledRules = readFileSync(rulesPath, "utf8");
  assert.ok(!existsSync(skillPath), "uninstaller removes the managed skill");
  assert.ok(existsSync(extraPath), "uninstaller preserves an unrelated local skill file");
  assert.ok(!existsSync(manifestPath), "uninstaller removes the manifest");
  assert.match(
    readFileSync(outsidePath, "utf8"),
    /must remain untouched/,
    "uninstaller rejects hostile manifest paths",
  );
  assert.ok(!uninstalledRules.includes(begin) && !uninstalledRules.includes(end), "uninstaller removes only sentinels");
  assert.match(uninstalledRules, /Keep this text/, "uninstaller preserves consumer rules");

  const malformedRoot = mkdtempSync(path.join(os.tmpdir(), "ai-toolkit-malformed-"));
  try {
    writeFileSync(path.join(malformedRoot, "CLAUDE.md"), `# Consumer\n${begin}\nuser text\n`);
    execFileSync(process.execPath, ["install.js"], {
      cwd: packageRoot,
      env: { ...process.env, PROJECT_ROOT: malformedRoot },
      stdio: "pipe",
    });
    const malformedRules = readFileSync(path.join(malformedRoot, "CLAUDE.md"), "utf8");
    assert.equal(malformedRules.split(begin).length - 1, 1, "malformed sentinels never create a duplicate block");
    assert.ok(
      !existsSync(path.join(malformedRoot, ".claude", ".ai-toolkit-manifest.json")),
      "malformed rules skip manifest write",
    );
  } finally {
    rmSync(malformedRoot, { recursive: true, force: true });
  }

  console.log("AI toolkit installer verification passed");
} finally {
  rmSync(projectRoot, { recursive: true, force: true });
}
