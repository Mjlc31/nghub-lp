# Dispatch: Worker M1-1 (Milestone 1 Implementation)

## Objective
Implement Milestone 1: Core Toolchain, Strict Type Safety & Monolith Modularization.

## References
- ORIGINAL_REQUEST: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md`
- PROJECT: `/Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md`
- Working Directory: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_worker_m1_1`
- Blueprints:
  - Architecture: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_1/handoff.md`
  - TypeScript & Toolchain: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_2/handoff.md`
  - LazyMotion & Bundling: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_3/handoff.md`

## Write Ownership
You have exclusive write ownership of:
- `package.json`
- `tsconfig.json`
- `vite-env.d.ts`
- `vite.config.ts`
- `context/SiteConfigContext.tsx`
- `components/layout/Navbar.tsx`
- `components/layout/AdminGate.tsx`
- `App.tsx`
- Component typing & `m.*` conversions:
  - `components/sections/Footer.tsx`
  - `components/sections/Manifesto.tsx`
  - `components/ui/MarqueeColumn.tsx`
  - `components/ui/SectionHeading.tsx`
  - `components/ui/WeaponCard.tsx`
  - `components/admin/Login.tsx`
  - `components/AdminPanel.tsx`
  - `components/ui/Effects.tsx`
  - `components/admin/ImageControl.tsx`
  - `components/LeadForm.tsx`
  - `services/supabase.ts`

Do NOT modify files owned by the E2E Testing Track (`tests/`, `TEST_INFRA.md`, `TEST_READY.md`).

## Implementation Checklist
1. **Toolchain & Strict TypeScript**:
   - Update `package.json` with `@types/react: ^19.0.10`, `@types/react-dom: ^19.0.4`.
   - Run `npm install` to install `@types/react` and `@types/react-dom`.
   - Update `tsconfig.json` with `"strict": true`, `"types": ["node", "vite/client"]`, `"exclude": ["node_modules", "dist", "LANDING-PAGE---NG-main", ".agents", "temp_skills"]`.
   - Create `vite-env.d.ts` with complete `ImportMetaEnv` and `ImportMeta` types.
   - Add `"typecheck": "tsc --noEmit"` and `"lint"` scripts to `package.json`.
2. **Modular Architecture & Context**:
   - Create `context/SiteConfigContext.tsx` implementing `SiteConfigProvider` and `useSiteConfig()`.
   - Create `components/layout/Navbar.tsx` with floating glass design, live status chip (`[ • COHORT 2026 // ADMISSIONS OPEN ]`), desktop links, and mobile slide-out drawer.
   - Create `components/layout/AdminGate.tsx` encapsulating `CTRL+SHIFT+A` / `CMD+SHIFT+A` hotkeys, completely removing `?admin=true` URL backdoor, and lazy-loading `AdminPanel` and `Login`.
   - Refactor `App.tsx` into a lean composition root (<70 lines) using `<LazyMotion features={domAnimation} strict>`, `<SiteConfigProvider>`, `<Navbar>`, and section containers.
3. **Framer Motion Tree-Shaking & Component Types**:
   - Migrate `motion.*` to `m.*` across `Footer.tsx`, `Manifesto.tsx`, `MarqueeColumn.tsx`, `SectionHeading.tsx`, `WeaponCard.tsx`, `Login.tsx`, `AdminPanel.tsx`.
   - Add explicit typed interfaces to eliminate all implicit `any` errors.
4. **Verification & Build**:
   - Run `npm run typecheck` (`tsc --noEmit`) — must exit 0 with zero errors.
   - Run `npm run build` (`vite build`) — must exit 0 with clean build.
   - Document verification commands and verbatim output in `handoff.md`.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-10T04:51:49Z
Execute Milestone 1:
1. Toolchain & Strict TypeScript: Add @types/react and @types/react-dom to package.json, run npm install, update tsconfig.json with strict: true and proper exclude/include/types, create vite-env.d.ts, add typecheck/lint scripts.
2. Architecture & Modularization: Create context/SiteConfigContext.tsx, components/layout/Navbar.tsx, components/layout/AdminGate.tsx, refactor App.tsx (<70 lines) eliminating ?admin=true backdoor and 8-layer prop drilling.
3. LazyMotion & Types: Migrate components from motion to m.* with LazyMotion strict mode, resolve implicit any errors with explicit interfaces.
4. Run npm run typecheck and npm run build. Both must pass with exit code 0.
5. Deliver handoff.md with verified build/typecheck outputs.

