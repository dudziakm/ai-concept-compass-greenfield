---
starter_id: 10x-astro-starter
package_manager: npm
project_name: ai-concept-compass
hints:
  language_family: js
  team_size: solo
  deployment_target: cloudflare-pages
  ci_provider: github-actions
  ci_default_flow: manual-promotion
  bootstrapper_confidence: first-class
  path_taken: custom
  quality_override: false
  self_check_answers:
    typed: true
    from_official_starter: true
    conventions: true
    docs_current: true
    can_judge_agent: true
  has_auth: true
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
---

## Why this stack

Solo developer, two-week deadline, authenticated web application and private relational data favor the official 10x Astro Starter: it provides a typed, convention-based Astro 6 + React 19 baseline with Supabase and Cloudflare integration while satisfying all four agent-friendly gates. The registry hand-off uses `cloudflare-pages`, the starter card's permitted Cloudflare default; the concrete SSR runtime will be Cloudflare Workers as recorded in `infrastructure.md`. GitHub Actions uses manual production promotion because hosted credentials and first deployment require human-controlled account access. `has_ai` is false intentionally: the product teaches AI concepts, but the MVP makes no model call.
