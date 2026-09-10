# Dispatch: Worker M2-1 (Milestone 2 Implementation)

## Objective
Implement Milestone 2: Minimalist "Silicon Valley" Aesthetic & Typography Overhaul. Transform NG Hub from the outdated 2010s crypto/seminar look into an exclusive, ultra-refined, high-craft executive founder ecosystem with precision typography and minimalist luxury.

## References
- ORIGINAL_REQUEST: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md`
- PROJECT: `/Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md`
- Working Directory: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_worker_m2_1`
- Master Design Blueprint: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_survey_2/handoff.md`

## Write Ownership
You have exclusive write ownership of:
- `index.html`
- `tailwind.config.js`
- `index.css`
- `components/layout/Navbar.tsx`
- `components/sections/Hero.tsx`
- `components/sections/ProofBar.tsx`
- `components/sections/BentoGrid.tsx` (and deprecation/refactoring of duplicate Pillars/Arsenal)
- `components/sections/Manifesto.tsx`
- `components/sections/Gallery.tsx`
- `components/sections/Footer.tsx`
- `App.tsx` (mount BentoGrid)

## Implementation Tasks
1. **Typography Triad (`index.html`, `tailwind.config.js`)**:
   - Update Google Fonts imports in `index.html` with: `Geist` (display), `Plus Jakarta Sans` (display), complete `Inter` (weights 300, 400, 500, 600, 700), `Geist Mono` (telemetry/data), and `Instrument Serif` (accent italic).
   - Configure Tailwind font families: `font-sans` (Inter), `font-display` (Geist / Plus Jakarta Sans), `font-mono` (Geist Mono), `font-serif` (Instrument Serif).
2. **Obsidian & Pale Champagne Design Tokens (`tailwind.config.js`, `index.css`)**:
   - Palette: Deep Obsidian canvas (`#060709`), elevated card surfaces (`#0C0E12`, `#13161C`), refined pale champagne gold (`#E5C579`, subtle glow `rgba(229,197,121,0.12)`), hairline borders (`border-white/[0.08]`).
   - Remove harsh brass gold gradients (`#C5A059`); use titanium/champagne restrained accents.
3. **Hero Section (`components/sections/Hero.tsx`)**:
   - Minimalist, high-contrast headline using `font-display tracking-tight text-white`.
   - Super-badge: `[ ✦ REDE EXCLUSIVA PARA FUNDADORES // ADMISSÃO POR CURADORIA ]` in `font-mono text-[11px]`.
   - Dual-CTA: Primary high-contrast white capsule button (`bg-white text-black hover:bg-zinc-200`) + secondary frosted glass button (`border border-white/10 hover:border-white/20 text-zinc-300`).
   - Live Telemetry Strip below CTA:
     `4.8% TAXA DE ACEITAÇÃO` | `R$ 180M+ GMV GERADO` | `150 FUNDADORES ATIVOS` | `100% INDICAÇÃO & CURADORIA`.
4. **Monochrome Proof Bar (`components/sections/ProofBar.tsx`)**:
   - High-craft monochrome brand marks (Stone, XP Investimentos, iFood, VTEX, Nubank, Endeavor) with subtle hover luminescence.
5. **High-Craft Bento Grid (`components/sections/BentoGrid.tsx`)**:
   - Consolidate duplicate Pillars and Arsenal into a modern 4-card or 5-card Bento Grid:
     - Card 1 (Span 2 cols): *Acesso & Conselho Direto* (Private channel to 8-figure founders, confidential dealflow).
     - Card 2 (Span 1 col): *Smart Capital & VC* (Pipeline to top venture capital funds, angels, and syndicate rounds).
     - Card 3 (Span 1 col): *War Rooms Confidenciais* (Operational teardowns, financial audits, unreleased playbooks).
     - Card 4 (Span 2 cols): *Experiências & Encontros Fechados* (Private executive summits, dinners in SP/NY, confidential retreats).
   - Interactive cursor spotlight glow, subtle hairline borders (`border-white/[0.08]`), and monospace index tags (`01 // PLATFORM`).
6. **Authoritative Manifesto & Admissions Standard (`components/sections/Manifesto.tsx`)**:
   - Reframe combat copy into authoritative executive exclusivity: *Declaração de Princípios & Critérios de Seleção*.
   - Split-screen modal with principles on left, strict selection criteria on right (minimum revenue threshold, verified endorsements, partner interview).
7. **Curated Gallery & Minimalist Footer (`components/sections/Gallery.tsx`, `components/sections/Footer.tsx`)**:
   - Clean responsive layout for member showcase with contextual telemetry badges (`[DINNER // FARIA LIMA]`, `[RETREAT // 2026]`).
   - Fix fixed quote image bug in `Footer.tsx`; deliver clean typography-first footer.
8. **Quality & Verification**:
   - Maintain zero type errors (`npm run typecheck`).
   - Maintain zero lint warnings (`npm run lint`).
   - Maintain clean build (`npm run build`).
   - Run `npm test` and verify all tests pass.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-09-10T05:12:50Z
You are Worker M2-1 (Milestone 2 Implementation: Minimalist "Silicon Valley" Aesthetic & Typography Overhaul).
Your working directory: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_worker_m2_1
Your task description is at: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_worker_m2_1/DISPATCH.md
Project specification: /Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md
Original User Request: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md
Design Blueprint: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_survey_2/handoff.md
Domain Skills:
- Tailwind Design System: /Users/arthurdemoraespd/.gemini/config/skills/tailwind-design-system/SKILL.md
- React Patterns: /Users/arthurdemoraespd/.gemini/config/skills/react-patterns/SKILL.md

Execute Milestone 2:
1. Typography Triad: Update index.html and tailwind.config.js with Geist/Plus Jakarta Sans, complete Inter weights (300-700), Geist Mono, and Instrument Serif.
2. Obsidian & Champagne Design Tokens: Update tailwind.config.js and index.css with #060709 canvas, #0C0E12 surfaces, #E5C579 pale champagne gold, hairline borders border-white/[0.08].
3. Hero: Fluid minimalist typography, super-badge [ ✦ REDE EXCLUSIVA PARA FUNDADORES // ADMISSÃO POR CURADORIA ], dual-CTA (solid white capsule + frosted ghost), and live telemetry strip.
4. ProofBar: Monochrome SVG brand marks (Stone, XP, iFood, VTEX, Nubank, Endeavor).
5. BentoGrid: Create components/sections/BentoGrid.tsx merging duplicate Pillars and Arsenal into an asymmetrical 4/5-card Bento Grid with interactive cursor spotlights and monospace badges.
6. Manifesto: Reframe into executive Declaração de Princípios & Critérios de Seleção with split-screen modal.
7. Gallery & Footer: Curated member showcase with badges, clean typography-first footer, fix fixed parallax quote bug.
8. Verify: npm run typecheck (0 errors), npm run lint (0 errors), npm run build (clean), npm test (114/114 pass).
9. Deliver handoff.md with verified commands and screenshots/outputs.

