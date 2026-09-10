# Dispatch: Explorer M1-3 (LazyMotion Tree-Shaking & Component Bundling)

## Objective
Analyze all animation and component imports to specify the exact migration to `LazyMotion` and `m.*` components, resolving tree-shaking failures and preparing for chunk splitting.

## References
- ORIGINAL_REQUEST: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md`
- PROJECT: `/Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md`
- Survey Reports:
  - `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_survey_1/handoff.md`
  - `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_survey_3/handoff.md`
- Working Directory: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_3`

## Specific Scope
1. Catalog every file importing `motion` from `framer-motion` (e.g. `Footer.tsx`, `Manifesto.tsx`, `MarqueeColumn.tsx`, `SectionHeading.tsx`, `WeaponCard.tsx`, `Login.tsx`).
2. Specify exact replacements using `m.div`, `m.span`, `m.button`, and `AnimatePresence`.
3. Verify how `LazyMotion features={domAnimation}` in root wraps the application so the full 100kB+ Framer Motion bundle is never bundled synchronously into initial paint.
4. Specify code-splitting boundaries for `App.tsx` and section components.

Scope boundaries: Read-only exploration and technical specification. Do NOT modify source files.

## 2026-09-10T04:46:22Z
You are Explorer M1-3 (LazyMotion Tree-Shaking & Component Bundling).
Your working directory: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_3
Your task description is at: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_3/DISPATCH.md
Project specification: /Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md
Original User Request: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md
Workspace root: /Users/arthurdemoraespd/Documents/nghub-lp

Formulate the exact blueprint for:
1. Migrating all components importing motion from framer-motion to m.* with domAnimation.
2. Verifying LazyMotion tree-shaking and component code-splitting boundaries.
3. Ensuring bundle overhead is eliminated from the initial render.

Scope boundary: Read-only exploration. Do NOT write or modify code. Write report to /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_3/handoff.md.
