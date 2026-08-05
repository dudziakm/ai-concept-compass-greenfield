# AI Concept Compass

Claude Code is the default development environment for this repository. Open the
repository — or the target worktree — as your working directory so this file,
`.claude/settings.json` and `.mcp.json` all load.

The delivery and safety contract lives in `AGENTS.md` and is imported below, so it
is in context without a second file read. `AGENTS.md` governs; this file adds the
architecture reference and the command list.

@AGENTS.md
@e2e/AGENTS.md

## Commands

- `npm run dev` — dev server on the Cloudflare workerd runtime
- `npm run build` — production build (SSR via `@astrojs/cloudflare`)
- `npm run preview` — preview the production build
- `npm run verify:fast` — lint, typecheck, unit tests; the gate for ordinary edits
- `npm run verify:full` — the local equivalent of CI's `quality` job; run before a PR
- `npm run lint:fix` — auto-fix lint issues
- `npm run format` — Prettier (includes prettier-plugin-astro + prettier-plugin-tailwindcss)
- `npm run toolkit:install` — regenerate `.claude/skills/` and the rules block below

`verify:full` does not run `test:e2e` or `test:rls`. Both need hosted Supabase
credentials and a confirmed account, and both are separate CI merge gates.

Git pre-commit hooks are separate from agent hooks: husky + lint-staged runs
`eslint --fix` on `*.{ts,tsx,astro}` and `prettier --write` on `*.{json,css,md}`.

## Agent hooks

`.claude/settings.json` registers a `PostToolUse` hook on `Write|Edit` that runs
`scripts/post-edit-quality.sh` (lint + typecheck). The script exits `2` when
either check fails, which is the code that surfaces its stderr into your context;
it reports rather than reverts, so the edit stands and you fix what it reports.
Both checks always run, so a failing lint still shows what typecheck found. Run
`npm run verify:fast` before handing work off. `.codex/hooks.json` keeps the same
script on Codex's `apply_patch` matcher as an optional compatibility path.

## MCP servers

`.mcp.json` declares `supabase`, `cloudflare-bindings`, `cloudflare-observability`
and `cloudflare-docs`. All four are remote HTTP endpoints that authenticate
interactively over OAuth on first tool call — no token, project reference or
account id is stored in the repository. Resolve the Supabase project id through
MCP; never hard-code it into source.

## Architecture

**Astro 6 SSR app** with React 19 islands, Tailwind 4, Supabase auth and shadcn/ui,
deployed to Cloudflare Workers.

### Rendering mode

Full server-side rendering (`output: "server"` in `astro.config.mjs`). All pages are
server-rendered by default. API routes must export `const prerender = false`.

### Auth flow

- `src/lib/supabase.ts` — Supabase SSR client via `@supabase/ssr` with cookie-based
  sessions. Reads `SUPABASE_URL` and `SUPABASE_KEY` from `astro:env/server`
  (server-only secrets declared in `astro.config.mjs` `env.schema`).
- `src/middleware.ts` — runs on every request, resolves the current user into
  `context.locals.user`, and redirects unauthenticated traffic away from
  `PROTECTED_ROUTES`.
- API endpoints: `src/pages/api/auth/{signin,signup,signout}.ts`
- Auth pages: `src/pages/auth/{signin,signup,confirm-email}.astro`
- Protected page example: `src/pages/dashboard.astro`

### Key conventions

- **Path alias**: `@/*` maps to `./src/*` (tsconfig paths).
- **Astro components** for static content and layout; **React components** only where
  interactivity is required.
- **Tailwind class merging**: use `cn()` from `@/lib/utils` (clsx + tailwind-merge).
  Do not concatenate class strings manually.
- **shadcn/ui**: components live in `src/components/ui/`, "new-york" variant. Add new
  ones with `npx shadcn@latest add [name]`.
- **API routes**: uppercase `GET` / `POST` exports; validate input with zod.
- **Supabase migrations**: `supabase/migrations/`, named `YYYYMMDDHHmmss_description.sql`.
  Always enable RLS on new tables with granular per-operation, per-role policies.
- **React**: no Next.js directives. Extract hooks to `src/components/hooks/`.
- **Services and helpers** go in `src/lib/` (or `src/lib/services/` for business logic).
- **Shared types** (entities, DTOs) go in `src/types.ts`.

### Environment

- Node.js 22.14.0 (`.nvmrc`)
- `SUPABASE_URL`, `SUPABASE_KEY` — copy `.env.example` to `.env` for Node, or to
  `.dev.vars` for Cloudflare local dev
- Local Supabase: `npx supabase start` (requires Docker)
- Deploy: `npx wrangler deploy` — only when explicitly in scope

## CI

`.github/workflows/ci.yml` runs three separate merge gates on every push and pull
request to `main`: `quality` (workflow:check → astro sync → lint → typecheck →
coverage → reviewer typecheck/test/promptfoo → build), then `e2e` and `rls` in
parallel. E2E and RLS need hosted Supabase credentials from repository secrets.

`.github/workflows/ai-code-review.yml` is the M5 review gate and is **advisory** —
it is not one of the required checks. The OpenRouter key is configured, so it does
produce real verdicts: exit `1` means findings, exit `0` means none. Exit `2` is an
infrastructure error and is deliberately distinct from a negative verdict; the
common cause is `INPUT_TOO_LARGE`, because `title + body + diff` is capped at
50 000 characters. Split a large pull request rather than raising the cap.

<!-- BEGIN @dudziakm/ai-toolkit -->
# Shared AI Toolkit Conventions

Apply these conventions when creating or reviewing application code:

- Use descriptive camelCase names, verb-first functions, boolean prefixes
  (`is`, `has`, `should`, `can`), matching primary file exports and
  UPPER_SNAKE_CASE constants.
- Handle every asynchronous failure, keep error messages actionable without
  sensitive data, avoid empty catches, and release opened resources in `finally`.
- Do not use `any` without an explicit justification; narrow untrusted data from
  `unknown`, prefer interfaces for object shapes and discriminated unions for
  states.
- Keep functions single-purpose, use an options object above three parameters,
  prefer early returns and keep query functions pure.
- Read secrets from environment/configuration only, validate boundary input, use
  parameterized SQL and never return stacks or internal paths in API errors.
- Name tests after behaviour, isolate setup/teardown, assert concrete outcomes
  and cover empty, null, boundary and error paths in proportion to risk.
<!-- END @dudziakm/ai-toolkit -->
