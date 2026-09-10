# E2E Test Suite Implementation Plan

## Objective
Design and implement an opaque-box, requirement-driven 4-tier test suite for the NG Hub landing page overhaul, verify its execution, and publish `TEST_INFRA.md` and `TEST_READY.md`.

## Phases

### Phase 1: Test Infrastructure & Harness (`tests/harness/`)
- `tests/harness/env.ts`: DOM, Window, Document, LocalStorage, Web APIs, and test isolation lifecycle.
- `tests/harness/fixtures.ts`: User inputs, lead payloads, mock Supabase responses, default site config.
- `tests/harness/assertions.ts`: Opaque-box assertions for masks, validations, tokens, and telemetry.
- `tests/harness/runner.ts`: Suite definition helpers, assertion runner, timing, and formatting.

### Phase 2: Tier 1 — Feature Coverage (`tests/tier1_features/`)
- Covers all 25 features from `PROJECT.md` Feature Inventory:
  - `navbar.test.ts` (F7)
  - `hero.test.ts` (F8)
  - `proofbar.test.ts` (F9)
  - `bento_grid.test.ts` (F10)
  - `manifesto.test.ts` (F11)
  - `gallery.test.ts` (F12)
  - `lead_form.test.ts` (F14)
  - `supabase_leads.test.ts` (F15, F16)
  - `admin_gate.test.ts` (F3, F16)
  - `site_config.test.ts` (F17)
  - `footer.test.ts` (F13)
  - `toolchain_assets.test.ts` (F1, F2, F4, F5, F6, F18, F19, F20, F22, F23, F24, F25)

### Phase 3: Tier 2 — Boundary & Corner Cases (`tests/tier2_boundaries/`)
- `lead_form_boundaries.test.ts`: Empty strings, min length boundaries, missing fields.
- `phone_mask_boundaries.test.ts`: 10/11 digits, non-digits, truncation, formatting boundaries.
- `revenue_boundaries.test.ts`: Lowest/highest brackets, missing selections, tampered options.
- `rate_limit_debounce.test.ts`: Rapid double-clicks, in-flight blocking, retry recovery.
- `payload_boundaries.test.ts`: 10k-char inputs, SQLi/XSS strings, Unicode/emojis, control chars.
- `storage_boundaries.test.ts`: LocalStorage QuotaExceededError, corrupted JSON, null state fallback.

### Phase 4: Tier 3 — Cross-Feature Combinations (`tests/tier3_combinations/`)
- `nav_to_apply_flow.test.ts`: Navbar CTA -> Hash scroll to `#apply` -> Input focus -> Validation -> Submit.
- `mobile_drawer_manifesto.test.ts`: Mobile viewport -> Drawer toggle -> Open manifesto modal -> Dismiss -> Return.
- `admin_hotkey_login_flow.test.ts`: Hotkey `CTRL+SHIFT+A` -> Auth modal -> Bad credentials -> Valid login -> Dashboard -> Logout.
- `honeypot_bot_flow.test.ts`: Bot autofills hidden honeypot -> Intercepted -> DB clean -> Human passes.
- `config_reactivity_flow.test.ts`: Admin config updates (copy/colors) -> Public UI propagates reactively.

### Phase 5: Tier 4 — Real-World Application Scenarios (`tests/tier4_scenarios/`)
- `scenario1_executive_founder.test.ts`: High-net-worth founder qualification workflow.
- `scenario2_strategic_partner.test.ts`: Strategic partner credibility audit workflow.
- `scenario3_mobile_high_latency.test.ts`: Mobile visitor on high-latency 3G network workflow.
- `scenario4_admin_operations.test.ts`: Admissions director leads triage and site operations.
- `scenario5_malicious_bot_defense.test.ts`: Automated attack script and spam burst defense.

### Phase 6: Master Runner & Package.json Integration
- `tests/index.ts`: Unified runner aggregating all 4 tiers with colored CLI summary and exit code 0.
- `package.json`: Configure `"test"` and `"test:e2e"` scripts.
- Run complete test suite and verify execution.

### Phase 7: Documentation & Handoff
- Generate `TEST_INFRA.md` at repository root.
- Generate `TEST_READY.md` at repository root.
- Update `BRIEFING.md` and `progress.md`.
- Produce `handoff.md` and notify parent agent via `send_message`.
