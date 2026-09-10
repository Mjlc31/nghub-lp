# Scope: Milestone 1 — Core Toolchain, Strict Type Safety & Monolith Modularization

## Objective
Establish strict TypeScript and toolchain hygiene, add missing quality scripts, and refactor `App.tsx` from a monolithic, prop-drilled entry point into clean, modularized components, context, and lazy-loaded admin boundaries.

## References
- ORIGINAL_REQUEST: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md`
- PROJECT: `/Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md`
- Survey Reports:
  - `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_survey_1/handoff.md`
  - `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_survey_3/handoff.md`
- Working Directory: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/sub_orch_m1`

## Specific Scope & Tasks
1. **Toolchain & Strict TypeScript**:
   - Install/add `@types/react` and `@types/react-dom` to `package.json` devDependencies.
   - Configure `"strict": true` in `tsconfig.json`.
   - Add `"exclude": ["node_modules", "dist", "LANDING-PAGE---NG-main"]` to `tsconfig.json`.
   - Create/fix `vite-env.d.ts` so `ImportMeta.env` has complete types for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, etc.
   - Add `"typecheck": "tsc --noEmit"` and `"lint"` scripts to `package.json`.
   - Ensure `npm run build` and `npm run typecheck` succeed with zero errors.
2. **Modularize `App.tsx` Monolith**:
   - Extract inline `<nav>` to `components/layout/Navbar.tsx`.
   - Create `context/SiteConfigContext.tsx` to eliminate 8-layer prop drilling of `images`, `texts`, `colors`.
   - Extract `AdminGate.tsx` to encapsulate admin hotkeys (`CTRL+SHIFT+A`), remove `?admin=true` backdoor, and lazy-load `AdminPanel` and `Login`.
   - Standardize Framer Motion: ensure proper `LazyMotion` integration with `m.*` components to enable tree-shaking.
   - Leave `App.tsx` clean, declarative, and under 70 lines.

## Deliverables & Completion Criteria
- `npm run build` compiles cleanly.
- `npm run typecheck` exits with code 0 under strict mode.
- `App.tsx` is completely modularized with zero regression in page rendering.
- Full gate pass: Worker + Reviewers + Challengers + Forensic Auditor.
