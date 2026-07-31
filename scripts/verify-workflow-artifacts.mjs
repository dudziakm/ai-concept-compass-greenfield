import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const requiredFiles = [
  "AGENTS.md",
  "context/archive/README.md",
  "context/changes/README.md",
  "context/foundation/README.md",
  "context/foundation/shape-notes.md",
  "context/foundation/prd.md",
  "context/foundation/business-requirements.md",
  "context/foundation/tech-stack.md",
  "context/foundation/technical-requirements.md",
  "context/foundation/infrastructure.md",
  "context/foundation/roadmap.md",
  "context/foundation/test-plan.md",
  "context/changes/bootstrap-verification/verification.md",
  "context/changes/ai-concept-compass-mvp/change.md",
  "context/changes/ai-concept-compass-mvp/research.md",
  "context/changes/ai-concept-compass-mvp/plan.md",
  "context/changes/ai-concept-compass-mvp/plan-brief.md",
  "context/changes/ai-concept-compass-mvp/specs/api.md",
  "context/changes/ai-concept-compass-mvp/specs/database.md",
  "context/changes/ai-concept-compass-mvp/specs/ui.md",
  "context/changes/ai-concept-compass-mvp/verification.md",
  "context/deployment/deploy-plan.md",
  "context/evidence/builder-mvp-check.md",
  "context/evidence/mission-log-fields.md",
  "context/evidence/security-audit.md",
  "context/team/opportunity-map.md",
  "context/team/mom-test-validation.md",
  "context/team/reviewer-runbook.md",
  "context/team/champion-evidence-checklist.md",
  ".github/actions/ai-code-review/action.yml",
  ".github/workflows/ai-code-review.yml",
  "packages/code-reviewer/package.json",
  "packages/code-reviewer/promptfooconfig.yaml",
];

const errors = [];

for (const path of requiredFiles) {
  try {
    await access(path);
  } catch {
    errors.push(`missing file: ${path}`);
  }
}

async function load(path) {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

function requireText(path, content, expected) {
  if (!content.includes(expected)) {
    errors.push(`${path}: missing ${JSON.stringify(expected)}`);
  }
}

function requireOrderedHeadings(path, content, headings) {
  let previous = -1;
  for (const heading of headings) {
    const matches = [...content.matchAll(new RegExp(`^${escapeRegExp(heading)}$`, "gm"))];
    if (matches.length !== 1) {
      errors.push(`${path}: expected exactly one ${JSON.stringify(heading)}, found ${matches.length}`);
      continue;
    }
    const position = matches[0].index ?? -1;
    if (position <= previous) {
      errors.push(`${path}: heading out of order: ${heading}`);
    }
    previous = position;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const shape = await load("context/foundation/shape-notes.md");
for (const marker of [
  "context_type: greenfield",
  "checkpoint:",
  "quality_check_status: accepted",
  "Pochodzenie dokumentu",
]) {
  requireText("context/foundation/shape-notes.md", shape, marker);
}

const prdPath = "context/foundation/prd.md";
const prd = await load(prdPath);
for (const marker of ["context_type: greenfield", "product_type: web-app", "target_scale:", "timeline_budget:"]) {
  requireText(prdPath, prd, marker);
}
requireOrderedHeadings(prdPath, prd, [
  "## Vision & Problem Statement",
  "## User & Persona",
  "## Success Criteria",
  "## User Stories",
  "## Functional Requirements",
  "## Non-Functional Requirements",
  "## Business Logic",
  "## Access Control",
  "## Non-Goals",
  "## Open Questions",
]);

const expectedPrdStories = [
  "### US-01: Prywatne konto",
  "### US-02: Pakiet startowy",
  "### US-03: Własna kolekcja pojęć",
  "### US-04: Kalibracja wiedzy",
  "### US-05: Rekomendacja następnego tematu",
  "### US-06: Prawo do usunięcia",
  "### US-07: Pusty i błędny stan",
];
for (const story of expectedPrdStories) requireText(prdPath, prd, story);
const prdStoryIds = [...prd.matchAll(/^### (US-\d{2}):/gm)].map((match) => match[1]);
if (new Set(prdStoryIds).size !== prdStoryIds.length) {
  errors.push(`${prdPath}: duplicate user-story identifier`);
}

for (const storyId of ["US-01", "US-02", "US-03", "US-04", "US-05", "US-06", "US-07"]) {
  requireText("context/foundation/shape-notes.md", shape, `### ${storyId}:`);
}

const businessPath = "context/foundation/business-requirements.md";
const business = await load(businessPath);
requireText(businessPath, business, "US-03/US-06; FR-005/FR-006/FR-012");
requireText(businessPath, business, "US-07; NFR-004/NFR-005");

const roadmapPath = "context/foundation/roadmap.md";
const roadmap = await load(roadmapPath);
if (/^## Streams$/m.test(roadmap)) {
  errors.push(`${roadmapPath}: Streams must be omitted while the dependency graph is one chain`);
}
const roadmapIds = ["F-01", "S-01", "S-02", "S-03", "S-04"];
const allowedRoadmapStatuses = new Set(["proposed", "ready", "blocked", "done"]);
for (const slice of roadmapIds) {
  requireText(roadmapPath, roadmap, `| ${slice} |`);
}
for (const id of roadmapIds) {
  const row = roadmap.match(new RegExp(`^\\| ${id} \\|.*\\|\\s*(\\S+)\\s*\\|$`, "m"));
  const detail = roadmap.match(new RegExp(`^### ${id}:.*?^- \\*\\*Status:\\*\\*\\s*(\\S+)\\s*$`, "ms"));
  const rowStatus = row?.[1];
  const detailStatus = detail?.[1];
  if (!rowStatus || !allowedRoadmapStatuses.has(rowStatus)) {
    errors.push(`${roadmapPath}: ${id} table status must be one of ${[...allowedRoadmapStatuses].join(", ")}`);
  }
  if (!detailStatus || !allowedRoadmapStatuses.has(detailStatus)) {
    errors.push(`${roadmapPath}: ${id} detail status must be one of ${[...allowedRoadmapStatuses].join(", ")}`);
  }
  if (rowStatus && detailStatus && rowStatus !== detailStatus) {
    errors.push(`${roadmapPath}: ${id} table status ${rowStatus} disagrees with detail status ${detailStatus}`);
  }
}

const stackPath = "context/foundation/tech-stack.md";
const stack = await load(stackPath);
for (const marker of [
  "starter_id: 10x-astro-starter",
  "package_manager: npm",
  "project_name: ai-concept-compass",
  "hints:",
  "bootstrapper_confidence:",
  "path_taken:",
  "self_check_answers:",
  "has_auth: true",
  "has_ai: false",
  "## Why this stack",
]) {
  requireText(stackPath, stack, marker);
}

const planPath = "context/changes/ai-concept-compass-mvp/plan.md";
const plan = await load(planPath);
const progressHeadings = [...plan.matchAll(/^## Progress$/gm)].length;
if (progressHeadings !== 1) {
  errors.push(`${planPath}: expected exactly one ## Progress, found ${progressHeadings}`);
}
const progressPhaseNames = [
  "Planning and verified starter baseline",
  "Identity, schema and ownership",
  "Starter pack and private CRUD",
  "Review engine and recommendation",
  "Shared gates, deploy and evidence",
];
for (const [index, phaseName] of progressPhaseNames.entries()) {
  const phase = index + 1;
  requireText(planPath, plan, `## Phase ${phase}:`);
  requireText(planPath, plan, `### Phase ${phase}: ${phaseName}`);
}
const progressSection = plan.slice(plan.indexOf("## Progress"));
if ([...progressSection.matchAll(/^#### Automated$/gm)].length !== 5) {
  errors.push(`${planPath}: expected five Progress/Automated headings`);
}
if ([...progressSection.matchAll(/^#### Manual$/gm)].length !== 5) {
  errors.push(`${planPath}: expected five Progress/Manual headings`);
}

const changePath = "context/changes/ai-concept-compass-mvp/change.md";
const change = await load(changePath);
const status = change.match(/^status:\s*(\S+)$/m)?.[1];
const pendingProgress = [...plan.matchAll(/^- \[ \] /gm)].length;
if (status === "complete" && pendingProgress > 0) {
  errors.push(`${changePath}: status complete conflicts with ${pendingProgress} pending progress rows`);
}
if (status === "implementing" && pendingProgress === 0) {
  errors.push(`${changePath}: status implementing requires at least one pending progress row`);
}

const bootstrapPath = "context/changes/bootstrap-verification/verification.md";
const bootstrap = await load(bootstrapPath);
for (const marker of [
  "formal_bootstrapper_run: false",
  "planning commit precedes scaffold commit",
  "imported without upstream Git history",
]) {
  requireText(bootstrapPath, bootstrap, marker);
}
const bootstrappedAt = bootstrap.match(/^bootstrapped_at:\s*(\S+)$/m)?.[1];
try {
  const { stdout } = await execFileAsync("git", ["log", "-1", "--format=%aI", "3397461"]);
  const scaffoldCommittedAt = stdout.trim();
  if (!bootstrappedAt || Number.isNaN(Date.parse(bootstrappedAt))) {
    errors.push(`${bootstrapPath}: bootstrapped_at must be a valid ISO timestamp`);
  } else if (Date.parse(bootstrappedAt) < Date.parse(scaffoldCommittedAt)) {
    errors.push(`${bootstrapPath}: bootstrapped_at predates scaffold commit 3397461`);
  }
} catch {
  errors.push(`${bootstrapPath}: cannot read scaffold commit 3397461`);
}

const testPlanPath = "context/foundation/test-plan.md";
const testPlan = await load(testPlanPath);
requireOrderedHeadings(testPlanPath, testPlan, [
  "## 1. Strategy",
  "## 2. Risk Map",
  "## 3. Phased Rollout",
  "## 4. Stack",
  "## 5. Quality Gates",
  "## 6. Cookbook Patterns",
  "## 7. What We Deliberately Don't Test",
  "## 8. Freshness Ledger",
]);

const verification = await load("context/changes/ai-concept-compass-mvp/verification.md");
requireText("context/changes/ai-concept-compass-mvp/verification.md", verification, "delivery is **not yet complete**");

const reviewerWorkflowPath = ".github/workflows/ai-code-review.yml";
const reviewerWorkflow = await load(reviewerWorkflowPath);
for (const marker of [
  "branches: [main]",
  "permissions: {}",
  "github-actions[bot]",
  "AI Code Review Gate",
  "OPENROUTER_API_KEY",
]) {
  requireText(reviewerWorkflowPath, reviewerWorkflow, marker);
}

const reviewerPackagePath = "packages/code-reviewer/package.json";
const reviewerPackage = await load(reviewerPackagePath);
for (const marker of ['"node": ">=22.14.0"', '"promptfoo": "0.120.14"', '"build:eval"']) {
  requireText(reviewerPackagePath, reviewerPackage, marker);
}

const promptfooPath = "packages/code-reviewer/promptfooconfig.yaml";
const promptfoo = await load(promptfooPath);
const evalCases = [...promptfoo.matchAll(/^ {2}- description:/gm)].length;
if (evalCases !== 6) {
  errors.push(`${promptfooPath}: expected exactly 6 fixed eval cases, found ${evalCases}`);
}

if (errors.length > 0) {
  console.error("10xWorkflow artifact check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`10xWorkflow artifact check passed (${requiredFiles.length} required files).`);
}
