#!/usr/bin/env node

const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const path = require("node:path");

const root = __dirname;
const packageJsonPath = path.join(root, "package.json");
const expectedFiles = ["skills/", "rules/", "install.js", "uninstall.js", "README.md"];
const errors = [];

if (!fs.existsSync(packageJsonPath)) {
  errors.push("package.json is missing");
} else {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  if (packageJson.name !== "@dudziakm/ai-toolkit") errors.push("package name must be @dudziakm/ai-toolkit");
  if (packageJson.version !== "0.1.0") errors.push("package version must be 0.1.0");
  if (packageJson.publishConfig?.registry !== "https://npm.pkg.github.com") {
    errors.push("publishConfig.registry must target GitHub Packages");
  }
  if (packageJson.repository?.url !== "git+https://github.com/dudziakm/ai-concept-compass-greenfield.git") {
    errors.push("repository metadata must identify the source repository");
  }
  if (JSON.stringify(packageJson.files) !== JSON.stringify(expectedFiles)) {
    errors.push("published files list does not match the required artifact set");
  }
  if (packageJson.scripts?.postinstall !== "node install.js") errors.push("postinstall must invoke install.js");
}

const skillPath = path.join(root, "skills", "code-review", "SKILL.md");
if (!fs.existsSync(skillPath)) {
  errors.push("skills/code-review/SKILL.md is missing");
} else {
  const skill = fs.readFileSync(skillPath, "utf8");
  if (!/^---\nname: code-review\ndescription: .+\n---\n/m.test(skill)) {
    errors.push("code-review skill needs matching YAML frontmatter");
  }
  const sourceSkillPath = path.resolve(root, "..", "..", "skills", "code-review", "SKILL.md");
  if (!fs.existsSync(sourceSkillPath) || fs.readFileSync(sourceSkillPath, "utf8") !== skill) {
    errors.push("packaged skill must exactly match the repository skill source");
  }
}

for (const requiredPath of ["README.md", "install.js", "uninstall.js", "rules/CLAUDE.md"]) {
  if (!fs.existsSync(path.join(root, requiredPath))) errors.push(`${requiredPath} is missing`);
}

try {
  const packed = JSON.parse(execFileSync("npm", ["pack", "--dry-run", "--json"], { cwd: root, encoding: "utf8" }));
  const allowed = new Set([
    "package.json",
    "README.md",
    "install.js",
    "uninstall.js",
    "skills/code-review/SKILL.md",
    "rules/CLAUDE.md",
  ]);
  const packedFiles = packed[0]?.files?.map((file) => file.path) ?? [];
  for (const packedFile of packedFiles) {
    if (!allowed.has(packedFile)) errors.push(`unexpected packed file: ${packedFile}`);
  }
} catch (error) {
  errors.push(`npm pack --dry-run failed: ${error instanceof Error ? error.message : String(error)}`);
}

if (errors.length > 0) {
  console.error(`AI toolkit validation failed:\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exit(1);
}

console.log("AI toolkit package validation passed");
