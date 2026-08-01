#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const PACKAGE_NAME = "@dudziakm/ai-toolkit";
const BEGIN = `<!-- BEGIN ${PACKAGE_NAME} -->`;
const END = `<!-- END ${PACKAGE_NAME} -->`;
const MANIFEST_NAME = ".ai-toolkit-manifest.json";

function removeRulesBlock(content) {
  const start = content.indexOf(BEGIN);
  const end = content.indexOf(END);
  if (start === -1 || end === -1 || end < start) return content;
  return `${content.slice(0, start)}${content.slice(end + END.length)}`.replace(/\n{3,}/g, "\n\n");
}

function isManagedSkillPath(relativePath) {
  if (typeof relativePath !== "string") return false;
  const projectRoot = path.resolve(process.env.PROJECT_ROOT || process.cwd());
  const target = path.resolve(projectRoot, relativePath);
  const projectRelative = path.relative(projectRoot, target);
  const allowedPrefix = `${path.join(".claude", "skills")}${path.sep}`;
  return (
    !path.isAbsolute(projectRelative) &&
    !projectRelative.startsWith(`..${path.sep}`) &&
    projectRelative.startsWith(allowedPrefix)
  );
}

function main() {
  const projectRoot = path.resolve(process.env.PROJECT_ROOT || process.cwd());
  const manifestPath = path.join(projectRoot, ".claude", MANIFEST_NAME);
  if (!fs.existsSync(manifestPath)) {
    console.log(`${PACKAGE_NAME}: no manifest found, nothing to uninstall`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.package !== PACKAGE_NAME || !Array.isArray(manifest.files)) {
    throw new Error("manifest does not belong to this package");
  }
  for (const relativePath of manifest.files) {
    if (isManagedSkillPath(relativePath)) fs.rmSync(path.join(projectRoot, relativePath), { force: true });
  }

  const skillRoot = path.join(projectRoot, ".claude", "skills", "code-review");
  if (fs.existsSync(skillRoot) && fs.readdirSync(skillRoot).length === 0) fs.rmdirSync(skillRoot);

  const rulesPath = path.join(projectRoot, "CLAUDE.md");
  if (fs.existsSync(rulesPath)) {
    fs.writeFileSync(rulesPath, removeRulesBlock(fs.readFileSync(rulesPath, "utf8")));
  }

  fs.rmSync(manifestPath, { force: true });
  console.log(`${PACKAGE_NAME}: uninstalled managed artifacts`);
}

try {
  main();
} catch (error) {
  console.warn(`${PACKAGE_NAME}: uninstall warning: ${error instanceof Error ? error.message : String(error)}`);
}
