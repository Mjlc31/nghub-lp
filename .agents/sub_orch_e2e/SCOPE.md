# Scope: E2E Testing Track

## Objective
Design and implement a comprehensive, opaque-box, requirement-driven E2E test suite for the NG Hub landing page overhaul, following the 4-tier methodology. Publish `TEST_READY.md` at project root upon completion.

## References
- ORIGINAL_REQUEST: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md`
- PROJECT: `/Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md`
- Working Directory: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/sub_orch_e2e`

## Architecture & Requirements
- **Test Methodology**: Opaque-box testing based strictly on user requirements and `PROJECT.md § Feature Inventory`.
- **Progressive Testability**: Verification must not depend on internal module implementations.
- **Coverage Tiers**:
  - **Tier 1 (Feature Coverage, >=5 per feature)**: Isolated functional verification for all 25 inventoried features.
  - **Tier 2 (Boundary & Corner Cases, >=5 per feature)**: Empty states, extreme inputs, rapid interaction, phone mask edge cases, network/Supabase failure resilience.
  - **Tier 3 (Cross-Feature Combinations, pairwise)**: Lead submission + validation, navigation + hash scrolling + mobile drawer, admin hotkey + session expiration + site config reactivity.
  - **Tier 4 (Real-World Application Scenarios, >=5 scenarios)**: Complete user journeys (Executive Founder application flow, Mobile visitor exploration, Admin curation workflow, Rapid form submission stress test, Visual contrast/viewport resizing).
- **Test Infrastructure**:
  - Create `TEST_INFRA.md` at project root.
  - Choose and configure an executable test runner (e.g. Playwright or Node/Vite test runner) with clear pass/fail exit code semantics (`npm run test:e2e` or `npm test`).
  - Output `TEST_READY.md` at project root with runner command and coverage matrix.

## Interface Contracts
- Command in `TEST_READY.md` must run the entire test suite and exit with 0 on pass, non-zero on fail.
