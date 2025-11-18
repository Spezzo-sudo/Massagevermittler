# Island Massage Delivery — AGENT Playbook

## Core Engineering Agreements
- Always favor TypeScript, functional React components, and side-effect free helpers. State that touches Supabase or Zustand must be deliberate and documented.
- The UI stack is Next.js (App Router) + Tailwind CSS with 2-space indentation and single quotes everywhere.
- Every exported function, hook, or constant needs a short JSDoc comment explaining its purpose.
- Gameplay-style logic (matching, payouts, pricing) belongs in `lib/` modules so that routing layers stay thin.
- When you add a top-level feature directory (e.g. `features/booking`) create a sibling `AGENTS.md` that captures any local rules.
- Keep temporary imports, archives, and scratch files out of the repo. Clean as you go.
- Before opening a PR run `npm run build` to ensure the Next.js output compiles cleanly.

## Project Guardrails
- Environment variables live in `.env.local`. Never check secrets into git.
- Supabase is the source of truth. Interact through `lib/supabase/*.ts` helpers or Edge Route handlers to keep ACL rules consistent.
- Long-running or sensitive work (matching, Stripe webhooks) should be handled via dedicated server utilities under `lib/`.
- Keep `README.md` and `docs/` updated with newly delivered functionality or architectural decisions—treat them as the living spec.
