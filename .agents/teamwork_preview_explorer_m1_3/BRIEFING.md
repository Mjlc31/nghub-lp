# BRIEFING — 2026-09-10T04:50:10Z

## Mission
Formulate the exact blueprint for LazyMotion tree-shaking (m.* with domAnimation), component code-splitting boundaries, and bundle overhead elimination.

## 🔒 My Identity
- Archetype: explorer
- Roles: investigator, synthesizer
- Working directory: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_3
- Original parent: e476c07d-76d8-4221-ae79-7a244df408ab
- Milestone: M1

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Scope: Framer Motion migration to LazyMotion m.* with domAnimation, tree-shaking verification, code-splitting boundaries, and bundle overhead elimination.
- Write report to /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_3/handoff.md

## Current Parent
- Conversation ID: e476c07d-76d8-4221-ae79-7a244df408ab
- Updated: not yet

## Investigation State
- **Explored paths**: `App.tsx`, `components/AdminPanel.tsx`, `components/admin/Login.tsx`, `components/LeadForm.tsx`, `components/sections/Hero.tsx`, `components/sections/Pillars.tsx`, `components/sections/Footer.tsx`, `components/sections/Manifesto.tsx`, `components/sections/Arsenal.tsx`, `components/sections/Gallery.tsx`, `components/ui/MarqueeColumn.tsx`, `components/ui/SectionHeading.tsx`, `components/ui/WeaponCard.tsx`, `components/ui/Effects.tsx`, `vite.config.ts`, `node_modules/framer-motion/dist/types/index.d.ts`, `node_modules/framer-motion/dist/es/render/dom/features-animation.mjs`, `features-max.mjs`.
- **Key findings**:
  1. 7 files in root actively import `{ motion }` defeating tree-shaking (`Footer.tsx`, `Manifesto.tsx`, `MarqueeColumn.tsx`, `SectionHeading.tsx`, `WeaponCard.tsx`, `Login.tsx`, `AdminPanel.tsx`).
  2. 3 files already use `m` (`Hero.tsx`, `Pillars.tsx`, `LeadForm.tsx`).
  3. `domAnimation` provides 100% of required animation features across the app (`animate`, `initial`, `exit`, `variants`, `whileInView`, `whileHover`, `whileTap`, `whileFocus`, `useScroll`, `useTransform`). Zero layout animations (`layout`, `layoutId`) or drag gestures (`drag`) are used anywhere in the codebase.
  4. Using `<LazyMotion features={domAnimation} strict>` ensures instant entrance animations without CLS while eliminating the entire layout and drag engines (~85 kB).
  5. The `strict` prop automatically enforces that no `<motion.*>` components render within the tree, throwing in development to guarantee tree-shaking integrity.
  6. Main bundle is currently 645.25 kB due to static imports of `AdminPanel` (which imports 410 kB Gemini SDK) and full Framer Motion.
  7. Modular code splitting with `AdminGate`, `ManifestoModal`, and Vite `manualChunks` reduces the critical initial JS bundle from 645 kB to ~90 kB minified (~28 kB gzipped).
- **Unexplored areas**: None within scope. All animation and bundling boundaries fully surveyed.

## Key Decisions Made
- Confirmed `domAnimation` is 100% sufficient; `domMax` is NOT needed.
- Blueprint will specify synchronous `features={domAnimation}` with `strict` prop to prevent initial paint layout shift while shedding >80 kB of Framer Motion unused modules.
- Defined 3-Tier component splitting architecture (Tier 1 Critical Above-Fold, Tier 2 Deferred Suspense Sections, Tier 3 User-Interaction Modals/Admin).
- Formulated Rollup `manualChunks` configuration for Vite.

## Artifact Index
- /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_3/DISPATCH.md — Task assignment
- /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_3/progress.md — Liveness heartbeat
- /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_3/handoff.md — Final analysis report
