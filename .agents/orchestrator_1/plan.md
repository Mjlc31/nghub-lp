# Orchestrator Master Plan

## 1. Survey Phase
- Spawn 3 Explorers in parallel to inspect:
  1. `explorer_survey_arch`: Architecture, directory structure, App.tsx monolith, dependencies, state management, Supabase integration.
  2. `explorer_survey_design`: Current UI/UX aesthetic, typography, styling configuration (Tailwind / CSS), contrast, branding, Silicon Valley minimalism opportunities.
  3. `explorer_survey_build`: Build scripts, TypeScript config, linting, tests, dev server behavior, bundle performance, bugs and console issues.
- Aggregate findings into `PROJECT.md` Feature Inventory & Architecture specification.

## 2. Decomposition & Dual Track Setup
- Track A (E2E Testing Track): E2E Test Suite Orchestrator. Develop comprehensive tests (Tiers 1-4) covering all features, user interactions, responsive layouts, Supabase integration, and visual/functional acceptance criteria. Outputs `TEST_READY.md`.
- Track B (Implementation Track):
  - Milestone 1: Modular Architecture & App.tsx Refactoring (split components, hooks, services).
  - Milestone 2: Minimalist Exclusive "Silicon Valley" Aesthetic & Typography Redesign.
  - Milestone 3: Fullstack Supabase Integration, Robust State, Performance (Lazy Loading, Render Optimization).
  - Milestone 4: Final Acceptance & 100% E2E Test Pass (Tiers 1-4) + Adversarial Hardening (Tier 5).

## 3. Iteration & Gate Protocol
- For each implementation milestone:
  - Sub-orchestrator runs Explorer -> Worker -> Reviewers (2) -> Challengers (2) -> Forensic Auditor (`teamwork_preview_auditor`).
  - GATE_STATUS evaluation: Strict AND criteria. Integrity Forensics has non-negotiable binary veto.
  - Oscillation Guard and Regression Guard enforced.

## 4. Final Delivery & Reporting
- Verify `npm run build` zero TypeScript/lint errors.
- Verify dev server zero console errors.
- Verify visual audit passes Silicon Valley aesthetic criteria.
- Report completion to parent agent.
