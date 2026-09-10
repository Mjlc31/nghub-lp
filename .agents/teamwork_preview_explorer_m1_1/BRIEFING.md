# BRIEFING — 2026-09-10T04:49:00Z

## Mission
Formulate the exact architectural blueprint for decomposing App.tsx from 220 lines to <70 lines, extracting Navbar, creating SiteConfigContext to eliminate 8-layer prop-drilling, and extracting AdminGate to isolate hotkeys and remove the ?admin=true backdoor.

## 🔒 My Identity
- Archetype: Explorer
- Roles: Architect, Code Analyst, Read-only Investigator
- Working directory: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_1
- Original parent: e476c07d-76d8-4221-ae79-7a244df408ab
- Milestone: M1 (Core Toolchain, Strict Type Safety & Monolith Modularization)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement or modify project source code
- Produce actionable, production-grade architectural blueprints for Navbar, SiteConfigContext, AdminGate, and App.tsx (<70 lines)
- Deliver self-contained handoff report (handoff.md) with 5 components: Observation, Logic Chain, Caveats, Conclusion, Verification Method
- Communicate all findings to parent agent via send_message

## Current Parent
- Conversation ID: e476c07d-76d8-4221-ae79-7a244df408ab
- Updated: not yet

## Investigation State
- **Explored paths**: App.tsx (220 lines), hooks/useSiteConfig.ts (67 lines), config/defaults.ts (45 lines), services/supabase.ts (106 lines), components/AdminPanel.tsx (488 lines), components/admin/Login.tsx (101 lines), components/sections/* (Hero, ProofBar, Pillars, Manifesto, Arsenal, Gallery, Footer), components/LeadForm.tsx, LANDING-PAGE---NG-main/components/ui/MobileMenu.tsx.
- **Key findings**:
  1. `App.tsx` has 220 lines with 5 distinct responsibilities: routing/shell, inline navigation, backdoor admin auth (?admin=true), hotkey management (CTRL+SHIFT+A), and 8-layer prop drilling.
  2. Eagerly importing `AdminPanel` bundles Gemini AI SDK and image compression into initial load (645 kB JS chunk).
  3. `useSiteConfig()` currently creates isolated component-level state rather than shared context.
  4. Child sections require props in TypeScript; migrating them to optional props with `useSiteConfig()` fallback enables seamless decomposition with zero breaking changes.
- **Unexplored areas**: None within the M1-1 scope.

## Key Decisions Made
- Architecture blueprint finalized:
  1. `context/SiteConfigContext.tsx`: React Context with `SiteConfigProvider` and `useSiteConfig()` hook, providing full reactivity, LocalStorage sync, and fallback stubs for Supabase.
  2. `components/layout/Navbar.tsx`: Floating glass nav with brand logo, live cohort status badge (`[ • COHORT 2026 // ADMISSIONS OPEN ]`), desktop links, and mobile slide-out drawer (`m.div`).
  3. `components/layout/AdminGate.tsx`: Isolates `CTRL+SHIFT+A` / `CMD+SHIFT+A` hotkey, removes `?admin=true` backdoor completely, lazy-loads `AdminPanel` and `Login` via `React.lazy`, and manages auth session via Supabase.
  4. Refactored `App.tsx`: Lean 60-line orchestrator eliminating all prop-drilling, backdoors, and eager admin bundles.

## Artifact Index
- handoff.md — Architectural Blueprint and Handoff Report (target)
- progress.md — Liveness and progress heartbeat
- BRIEFING.md — Situational awareness
- DISPATCH.md — Incoming dispatches
