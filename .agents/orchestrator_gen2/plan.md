# Master Plan — Orchestrator Gen 2

## Context & Baseline
- Survey Phase: Completed.
- E2E Test Suite: 114/114 passing tests (`TEST_READY.md`).
- Milestone 1 (Toolchain, Types, App.tsx Modularization): Completed & Passed Gate cleanly.
- Target Milestones: M2 -> M3 -> M4.

---

## Milestone 2: Minimalist "Silicon Valley" Aesthetic & Typography Overhaul
1. **Exploration (3 Explorers in parallel)**:
   - `explorer_m2_1`: Typography triad (Geist/Plus Jakarta Sans, Inter 300-700, Geist Mono, Instrument Serif) & Design tokens (obsidian `#060709`, surfaces `#0C0E12`, champagne `#E5C579`, hairline borders `border-white/[0.08]`) in `index.html`, `tailwind.config.js`, `index.css`.
   - `explorer_m2_2`: Floating glass Navbar (status badge `[ • COHORT 2026 // ADMISSIONS OPEN ]`), High-Impact Hero with live telemetry strip, Monochrome ProofBar SVG brand marks, and Minimalist Footer (fixing parallax quote bug).
   - `explorer_m2_3`: BentoGrid ecosystem (unifying Pillars and Arsenal into an asymmetrical 4/5-card bento with cursor spotlight and telemetry), Manifesto reframing (Declaração de Princípios & Critérios de Seleção), and Gallery member showcase.
2. **Implementation (Worker)**:
   - Worker applies changes, preserves React 19 safety, verifies `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.
3. **Verification & Audit**:
   - 2 Independent Reviewers (`teamwork_preview_reviewer`).
   - 2 Challengers (`teamwork_preview_challenger`) testing visual tokens, responsive layout, and interaction.
   - 1 Forensic Auditor (`teamwork_preview_auditor`) evaluating authenticity and integrity.
   - Gate evaluation in `GATE_STATUS.md`.

---

## Milestone 3: Fullstack Supabase Integration, State & Performance
1. **Exploration**:
   - Supabase dual-write & Admin Leads table triage.
   - Asset optimization (converting 155MB raw camera photos in `public/` to WebP/AVIF <200KB).
   - Bundle optimization: `manualChunks` in `vite.config.ts` (<500kB warning resolution).
   - Git hygiene & security (`.gitignore` for `.env*` and `.env.example`).
2. **Implementation & Verification**:
   - Worker -> Reviewers (2) -> Challengers (2) -> Auditor (1) -> Gate.

---

## Milestone 4: Final Acceptance, 100% E2E Pass & Adversarial Hardening
1. **Phase 1: Full Test Suite Verification**:
   - Execute full 114-test suite (`npm test`).
   - Verify zero TypeScript errors (`npm run typecheck`) and zero lint warnings (`npm run lint`).
   - Verify production build succeeds (`npm run build`).
2. **Phase 2: Adversarial Coverage Hardening (Tier 5)**:
   - 2 Challengers conduct white-box stress testing on edge cases, extreme payloads, and browser environments.
3. **Independent Aesthetic Victory Audit & Completion Report**:
   - Final review confirming Silicon Valley aesthetic, exclusive positioning, and flawless runtime.
   - Send completion message to parent agent.
