# Project: NG Hub Landing Page Comprehensive Overhaul

## Architecture
- **Framework & Runtime**: React 19, TypeScript 5.8 (Strict Mode), Vite 6, Tailwind CSS 3.4.
- **Client Architecture**: Modular component tree with separation of concerns:
  - `components/layout/`: `Navbar.tsx`, `Footer.tsx`, `AdminGate.tsx`
  - `components/sections/`: `Hero.tsx`, `ProofBar.tsx`, `BentoGrid.tsx`, `Manifesto.tsx`, `Gallery.tsx`, `ApplicationSection.tsx`
  - `components/ui/`: `Button.tsx`, `Badge.tsx`, `Card.tsx`, `Input.tsx`, `Modal.tsx`, `Spotlight.tsx`
  - `components/admin/`: `AdminPanel.tsx`, `Login.tsx`, `LeadsTable.tsx`
  - `hooks/`: `useSiteConfig.ts`, `useLeads.ts`, `useScrollSpy.ts`, `useAntiSpam.ts`
  - `services/`: `supabase.ts` (client, leads API, schema), `gemini.ts` (lazy AI copywriter)
  - `context/`: `SiteConfigContext.tsx`
  - `types/`: `config.ts`, `leads.ts`, `database.ts`
- **Data Flow**:
  - Leads submission: Client Form -> Zod Validation -> Honeypot Verification -> Supabase `leads` table (primary record) -> Webhook POST (notifications) -> Confirmation state.
  - Admin access: Hotkey `CTRL+SHIFT+A` -> Lazy-loaded Supabase Auth modal -> JWT session -> Admin Dashboard (Site Config editor + Supabase Leads viewer).
  - Public landing page: Clean static initial payload, zero admin bundle dependencies, code-split chunks.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Strict TypeScript & Toolchain Hygiene | Add `@types/react`, `@types/react-dom`, configure `"strict": true`, exclude `LANDING-PAGE---NG-main`, fix `vite-env.d.ts`, add npm scripts (`typecheck`, `lint`) | M1 | Survey E3 |
| 2 | App.tsx Monolith Modularization | Decompose `App.tsx` from 220 lines to <70 lines by extracting Navbar, Layout, Context Provider, and section containers | M1 | Survey E1 |
| 3 | Admin Auth Hardening & Lazy AdminGate | Remove `?admin=true` backdoor; lazy-load AdminPanel, Login, and Gemini SDK inside an isolated `AdminGate` | M1 | Survey E1, E3 |
| 4 | Animation Tree-Shaking & LazyMotion | Standardize Framer Motion imports to use `m.*` with `LazyMotion` features to eliminate animation library overhead | M1 | Survey E1, E3 |
| 5 | Silicon Valley Typography Triad | Configure Google Fonts: `Geist` / `Plus Jakarta Sans` (display), complete `Inter` (300-700), `Geist Mono` (telemetry), `Instrument Serif` (accent) | M2 | Survey E2 |
| 6 | Obsidian & Pale Champagne Design Tokens | Configure Tailwind with `#060709` canvas, `#0C0E12` surfaces, `#E5C579` champagne accent, hairline borders `border-white/[0.08]` | M2 | Survey E2 |
| 7 | Minimalist Floating Navbar & Mobile Menu | Floating glass bar with live status chip (`[ • COHORT 2026 // ADMISSIONS OPEN ]`), clean nav links, and sleek responsive drawer | M2 | Survey E2 |
| 8 | High-Impact Hero with Telemetry Strip | Minimalist headline with dynamic highlight, subtitle, high-contrast dual-CTAs, and live telemetry metric strip | M2 | Survey E2 |
| 9 | Monochrome Brand & Authority Proof Bar | Replace plain serif text with modern monochrome SVG brand marks and GPU-accelerated smooth display | M2 | Survey E2 |
| 10 | High-Craft Bento Grid Ecosystem | Merge duplicate Pillars and Arsenal into an asymmetrical 4/5-card Bento Grid with interactive cursor spotlights | M2 | Survey E2 |
| 11 | Authoritative Manifesto & Admissions Standard | Reframe combat copy into executive principles (*Declaração de Princípios & Critérios de Seleção*) with split-screen modal | M2 | Survey E2 |
| 12 | Member Showcase & Optimized Gallery | Replace heavy marquee with optimized responsive photo showcase and contextual badges (`[DINNER // FARIA LIMA]`) | M2 | Survey E2 |
| 13 | Minimalist Footer & Parallax Extraction | Fix fixed background quote bug; clean typography-first footer with copyright and system status indicator | M2 | Survey E2 |
| 14 | High-Ticket Application Portal (`#apply`) | Multi-step/progressive lead form with phone mask, revenue brackets, strict Zod validation, and honeypot anti-spam | M3 | Survey E1 |
| 15 | Fullstack Supabase Leads Dual-Write | Insert leads into Supabase `leads` table as persistent system-of-record, with webhook mirroring for instant alerts | M3 | Survey E1 |
| 16 | Admin Supabase Leads Dashboard | Wire existing `getLeads` & `updateLeadStatus` into a dedicated Leads Viewer tab in AdminPanel for status triage | M3 | Survey E1 |
| 17 | Site Configuration State Modernization | Clean up `useSiteConfig`, remove 5MB Base64 LocalStorage quota risk, provide clean React Context for theme/content | M3 | Survey E1 |
| 18 | High-Efficiency Asset Optimization | Convert 155MB raw camera JPEGs in `public/` into optimized WebP/AVIF formats (<200KB each), accelerating LCP by >90% | M3 | Survey E2, E3 |
| 19 | Production Bundle Optimization | Configure `manualChunks` in `vite.config.ts`, eliminate >500kB warning, silence top-level `console.warn` | M3 | Survey E3 |
| 20 | Git Hygiene & Secret Security | Untrack `.env` from git, update `.gitignore` for `.env*` safety, create comprehensive `.env.example` | M3 | Survey E3 |
| 21 | E2E Test Suite Creation & Verification | 4-Tier test suite covering all features, boundaries, interactions, and real-world workflows, publishing `TEST_READY.md` | M4 (E2E Track) | Architecture Spec |
| 22 | Zero TS & Lint Compilation | Validate `npm run build` succeeds with zero TypeScript errors under strict mode and zero lint warnings | M4 | Acceptance Criteria |
| 23 | Dev Server & Runtime Console Cleanliness | Verify dev server boots cleanly with zero console warnings or errors on all viewports | M4 | Acceptance Criteria |
| 24 | Agent-as-Judge Aesthetic Verification | Independent visual review confirming the minimalist, exclusive Silicon Valley aesthetic | M4 | Acceptance Criteria |
| 25 | Adversarial Coverage Hardening (Tier 5) | White-box stress-testing with Challengers to close edge cases, input anomalies, and runtime regressions | M4 | Project Pattern |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Build test infra, test runner, and comprehensive Tiers 1-4 test suite derived from user requirements; publish `TEST_READY.md` | None | DONE |
| M1 | Core Toolchain, Strict Type Safety & Monolith Modularization | Install `@types/react`, `@types/react-dom`, configure `"strict": true`, exclude legacy directory, add `typecheck`/`lint`, decompose `App.tsx` into clean layout/components/context, eliminate `?admin=true` backdoor, lazy-load AdminPanel | None | DONE |
| M2 | Minimalist "Silicon Valley" Aesthetic & Typography Overhaul | Configure font triad, obsidian/champagne color tokens, hairline borders, floating Navbar, high-impact Hero, monochrome ProofBar, Bento Grid ecosystem, reframed Manifesto, and clean Footer | M1 | DONE |
| M3 | Fullstack Supabase Integration, State & Performance Optimization | Supabase leads dual-write & Admin leads table, SiteConfig context refactoring, 155MB asset optimization to WebP, Vite manualChunks (<500kB), `.env` security hygiene | M1, M2 | IN_PROGRESS |
| M4 | Final Acceptance, 100% E2E Pass & Adversarial Hardening | Pass 100% of E2E tests (Tiers 1-4), verify zero TS/lint build errors, clean dev server runtime, visual aesthetic audit, and Tier 5 adversarial stress testing | E2E, M3 | PLANNED |

## Interface Contracts
### `SiteConfigContext` ↔ `App` / `Sections`
- **Hook**: `useSiteConfig(): { config: SiteConfig; updateConfig: (partial: Partial<SiteConfig>) => void; resetConfig: () => void; isLoaded: boolean }`
- **Data Model**: `SiteConfig` containing `texts`, `images`, `colors`, `features`
- **Behavior**: Provides defaults immediately; updates propagate reactively without prop-drilling.

### `LeadForm` ↔ `services/supabase.ts`
- **Function**: `submitLead(leadData: LeadFormData): Promise<{ success: boolean; data?: any; error?: string }>`
- **Behavior**: Validates with Zod schema -> Inserts into `leads` table with status `'new'` -> Dispatches to external webhook if configured -> Returns unified result.

### `AdminGate` ↔ `components/admin/`
- **Interface**: `<AdminGate isOpen={boolean} onClose={() => void} />`
- **Behavior**: Evaluates Supabase session. If authenticated, dynamically mounts `AdminPanel` (code-split). If not, renders `Login` modal.

## Code Layout
```
/Users/arthurdemoraespd/Documents/nghub-lp/
├── .agents/                    # Orchestration & agent metadata only
├── index.html                  # HTML entry point, Google Fonts imports
├── vite.config.ts              # Vite config with manualChunks and aliases
├── tsconfig.json               # Strict TypeScript config with exclusions
├── package.json                # Dependencies, typecheck, lint, build scripts
├── src/ (or root components)
│   ├── components/
│   │   ├── layout/             # Navbar, Footer, AdminGate
│   │   ├── sections/           # Hero, ProofBar, BentoGrid, Manifesto, Gallery, ApplicationSection
│   │   ├── ui/                 # Button, Badge, Card, Spotlight, Modal, Input
│   │   └── admin/              # AdminPanel, Login, LeadsTable
│   ├── context/                # SiteConfigContext
│   ├── hooks/                  # useSiteConfig, useLeads, useAntiSpam
│   ├── services/               # supabase.ts, gemini.ts
│   ├── types/                  # config.ts, leads.ts, database.ts
│   └── utils/                  # cn, formatting, masking
├── tests/
│   └── e2e/                    # Opaque-box E2E test suites (Tiers 1-4)
└── public/
    └── assets/                 # Optimized WebP assets (<200KB each)
```
