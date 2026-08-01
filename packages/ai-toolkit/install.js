#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const PACKAGE_NAME = "@dudziakm/ai-toolkit";
const PACKAGE_VERSION = require("./package.json").version;
const BEGIN = `<!-- BEGIN ${PACKAGE_NAME} -->`;
const END = `<!-- END ${PACKAGE_NAME} -->`;
const MANIFEST_NAME = ".ai-toolkit-manifest.json";

function findProjectRoot() {
  if (process.env.PROJECT_ROOT) return path.resolve(process.env.PROJECT_ROOT);

  let dir = __dirname;
  while (dir !== path.dirname(dir)) {
    if (path.basename(dir) === "node_modules") return path.dirname(dir);
    dir = path.dirname(dir);
  }
  return null;
}

function copyDir(source, target, installedFiles, projectRoot) {
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath, installedFiles, projectRoot);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
      installedFiles.push(path.relative(projectRoot, targetPath));
    }
  }
}

function applyRulesBlock(existing, teamRules) {
  const block = `${BEGIN}\n${teamRules.trim()}\n${END}`;
  const start = existing.indexOf(BEGIN);
  const end = existing.indexOf(END);
  const beginCount = existing.split(BEGIN).length - 1;
  const endCount = existing.split(END).length - 1;

  if (beginCount === 0 && endCount === 0) {
    return `${existing.trimEnd()}${existing.trimEnd() ? "\n\n" : ""}${block}\n`;
  }
  if (beginCount === 1 && endCount === 1 && end > start) {
    return existing.slice(0, start) + block + existing.slice(end + END.length);
  }
  throw new Error("refusing to overwrite malformed or duplicate managed rule sentinels");
}

function install(projectRoot) {
  const installedFiles = [];
  const sourceSkills = path.join(__dirname, "skills");
  const targetSkills = path.join(projectRoot, ".claude", "skills");

  if (fs.existsSync(sourceSkills)) {
    for (const skill of fs.readdirSync(sourceSkills, { withFileTypes: true })) {
      if (!skill.isDirectory()) continue;
      copyDir(path.join(sourceSkills, skill.name), path.join(targetSkills, skill.name), installedFiles, projectRoot);
    }
  }

  const rulesPath = path.join(__dirname, "rules", "CLAUDE.md");
  if (fs.existsSync(rulesPath)) {
    const targetRules = path.join(projectRoot, "CLAUDE.md");
    const existing = fs.existsSync(targetRules) ? fs.readFileSync(targetRules, "utf8") : "";
    fs.writeFileSync(targetRules, applyRulesBlock(existing, fs.readFileSync(rulesPath, "utf8")));
    installedFiles.push("CLAUDE.md");
  }

  const manifestPath = path.join(projectRoot, ".claude", MANIFEST_NAME);
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(
    manifestPath,
    `${JSON.stringify({ package: PACKAGE_NAME, version: PACKAGE_VERSION, files: installedFiles.sort() }, null, 2)}\n`,
  );
  console.log(`${PACKAGE_NAME}: installed ${installedFiles.length} managed file(s)`);
}

try {
  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    console.warn(`${PACKAGE_NAME}: postinstall skipped because no consumer project root was found`);
  } else {
    install(projectRoot);
  }
} catch (error) {
  console.warn(`${PACKAGE_NAME}: postinstall warning: ${error instanceof Error ? error.message : String(error)}`);
}
