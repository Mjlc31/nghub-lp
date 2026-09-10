# Test Infrastructure: NG Hub Landing Page

## 1. Overview & Testing Philosophy

The NG Hub test infrastructure provides an **opaque-box, requirement-driven, zero-external-dependency** test harness designed to validate all 25 features defined in `PROJECT.md § Feature Inventory` across a 4-tier testing hierarchy:

1. **Tier 1 — Feature Coverage**: Verifies isolated functionality, rendering contracts, and specifications for all 25 features.
2. **Tier 2 — Boundary & Corner Cases**: Tests input limits, extreme lengths, non-numeric phone sanitization, edge brackets, debounce rates, injection attempts, and LocalStorage quota errors.
3. **Tier 3 — Cross-Feature Combinations**: Validates pairwise workflows connecting navigation, scroll spy anchors, mobile drawers, modal lifecycle, Zod validation, and Supabase data mutations.
4. **Tier 4 — Real-World Application Scenarios**: Simulates full end-to-end user journeys including high-net-worth founders, strategic partners, high-latency mobile visitors, admissions directors, and bot defense mechanisms.

---

## 2. Test Runner Architecture

The test suite runs natively on **Node.js 24** using:
- **TypeScript Stripping Engine**: `node --experimental-strip-types` for instantaneous, in-process compilation of TypeScript modules without external compilation steps.
- **Assertion Engine**: `node:assert` with strict equality and custom domain predicates (`assertValidPhoneMask`, `assertValidZodLead`, `assertCohortStatus`).
- **Test Orchestrator & Registry**: `tests/harness/runner.ts` providing modular `describe`, `it`, `beforeEach`, and `afterEach` lifecycle execution.
- **ANSI Terminal Reporter**: Formatted real-time test execution logging, per-test millisecond latency tracking, suite categorization, and failure trace dumps.
- **Exit Code Contract**: Returns `0` on 100% suite success; returns `1` on any assertion or runtime failure.

---

## 3. Directory Layout

```
tests/
├── harness/
│   ├── env.ts              # Browser DOM, Window, Document, LocalStorage & Event simulation
│   ├── fixtures.ts         # Authoritative test leads, default site config, stateful mock Supabase
│   ├── assertions.ts       # Domain assertion helpers (phone masks, zod schemas, color tokens)
│   └── runner.ts           # Modular test suite registry, test runner, and ANSI reporter
├── tier1_features/         # Tier 1: Feature coverage (>=5 tests per key feature)
│   ├── navbar.test.ts      # Feature 7: Minimalist Floating Navbar & Mobile Menu
│   ├── hero.test.ts        # Feature 8: High-Impact Hero with Telemetry Strip
│   ├── proofbar.test.ts    # Feature 9: Monochrome Brand & Authority Proof Bar
│   ├── bento_grid.test.ts  # Feature 10: High-Craft Bento Grid Ecosystem
│   ├── manifesto.test.ts   # Feature 11: Authoritative Manifesto & Admissions Standard
│   ├── gallery.test.ts     # Feature 12: Member Showcase & Optimized Gallery
│   ├── lead_form.test.ts   # Feature 14: High-Ticket Application Portal (#apply)
│   ├── supabase_leads.test.ts # Features 15 & 16: Supabase Leads Dual-Write & Admin Dashboard
│   ├── admin_gate.test.ts  # Feature 3: Admin Auth Hardening & Lazy AdminGate
│   ├── site_config.test.ts # Feature 17: Site Configuration State Modernization
│   ├── footer.test.ts      # Feature 13: Minimalist Footer & Parallax Extraction
│   └── toolchain_assets.test.ts # Features 1, 2, 4, 5, 6, 18, 19, 20: Toolchain, Tokens & Assets
├── tier2_boundaries/       # Tier 2: Boundary & corner cases (>=5 per area)
│   ├── lead_form_boundaries.test.ts # Empty inputs, min-length limits, missing fields
│   ├── phone_mask_boundaries.test.ts # 10/11 digits, non-numeric stripping, overflow truncation
│   ├── revenue_boundaries.test.ts   # Lowest to highest brackets, invalid custom inputs
│   ├── rate_limit_debounce.test.ts  # Rapid click bursts, in-flight blocking, retry recovery
│   ├── payload_boundaries.test.ts   # 10k-char inputs, SQLi/XSS escaping, Unicode/emojis
│   └── storage_boundaries.test.ts   # QuotaExceededError, corrupted JSON, null fallbacks
├── tier3_combinations/     # Tier 3: Pairwise cross-feature interactions
│   ├── nav_to_apply_flow.test.ts    # Nav click -> scroll to #apply -> focus -> validate -> submit
│   ├── mobile_drawer_manifesto.test.ts # Mobile viewport -> drawer toggle -> open modal -> dismiss
│   ├── admin_hotkey_login_flow.test.ts # Hotkey -> Login modal -> wrong pw -> valid login -> logout
│   ├── honeypot_bot_flow.test.ts    # Bot autofill -> honeypot trap -> DB clean -> human passes
│   └── config_reactivity_flow.test.ts # Admin updates config -> public UI reflects reactively
├── tier4_scenarios/        # Tier 4: Comprehensive real-world user journeys
│   ├── scenario1_executive_founder.test.ts # High-net-worth founder qualification journey
│   ├── scenario2_strategic_partner.test.ts # Institutional partner credibility audit journey
│   ├── scenario3_mobile_high_latency.test.ts # Mobile visitor on degraded high-latency connection
│   ├── scenario4_admin_operations.test.ts # Admissions director operations & lead triage
│   └── scenario5_malicious_bot_defense.test.ts # Automated attack script & spam defense
└── index.ts                # Master runner aggregating all 4 tiers with exit code semantics
```

---

## 4. Test Environment Emulation (`tests/harness/env.ts`)

The test harness provides comprehensive isolation without external heavyweight browser processes:
- **Virtual DOM Hierarchy**: `MockElement` with full hierarchy navigation, event bubbling, attributes, class names, query selectors, and value properties.
- **Scroll & Focus Tracking**: Records `scrollIntoView` invocations and focused inputs via global telemetry hooks.
- **Web Storage Emulation**: Fully compliant `Storage` interface supporting `getItem`, `setItem`, `removeItem`, `clear`, and configurable `QuotaExceededError` simulation.
- **Window & Device Viewports**: Configurable screen dimensions for mobile (375x812, 390x844) and desktop (1440x900) responsive behavior verification.
- **Lifecycle Guarantees**: `setupTestEnvironment()` and `cleanupTestEnvironment()` run before and after every test, preventing side effects and state leakage.

---

## 5. Mock Services & Contracts (`tests/harness/fixtures.ts`)

- **Stateful Mock Supabase**: In-memory store replicating table operations:
  - `supabase.from('leads').insert([data])` -> generates unique IDs, ISO timestamps, and enforces `'new'` status.
  - `supabase.from('leads').select('*').order('created_at', { ascending: false })` -> returns leads in chronological order.
  - `supabase.from('leads').update({ status }).eq('id', id)` -> stateful triage status progression.
  - `supabase.auth.signInWithPassword(...)` -> authenticates administrative credentials (`admin@nghub.com`).
  - `supabase.auth.signOut()` / `supabase.auth.getUser()` -> session management.

---

## 6. How to Run the Tests

```bash
# Run all 4 tiers via npm script
npm test

# Alternatively, run via explicit e2e script
npm run test:e2e

# Or invoke directly with Node.js
node --experimental-strip-types tests/index.ts
```

Execution takes less than **100ms** across all 28 suites and 114 test cases, ensuring instant feedback during development, pre-commit hooks, and CI/CD pipelines.
