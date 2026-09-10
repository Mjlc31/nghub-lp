# Dispatch: E2E Test Writer (E2E Testing Track)

## Objective
Design and implement a comprehensive, opaque-box, requirement-driven E2E test suite for the NG Hub landing page overhaul, following the 4-tier methodology. Publish `TEST_INFRA.md` and `TEST_READY.md` at project root upon completion.

## References
- ORIGINAL_REQUEST: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md`
- PROJECT: `/Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md`
- Working Directory: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_test_writer_e2e`
- Recommended Skills: `/Users/arthurdemoraespd/.gemini/config/skills/e2e-testing-patterns/SKILL.md`, `/Users/arthurdemoraespd/.gemini/config/skills/javascript-testing-patterns/SKILL.md`

## Testing Philosophy & Guidelines
- **Opaque-Box & Requirement-Driven**: Tests must test against user requirements and `PROJECT.md § Feature Inventory` from an end-user perspective, not internal implementation details.
- **Progressive Testability**: Tier 1 tests must verify entry points and basic rendering/behavior without assuming complex internal features.
- **Write Ownership**: You own the test files in `tests/e2e/` (or `tests/`) and `TEST_INFRA.md` / `TEST_READY.md`. Do NOT modify application source code in `src/` or `components/`.

## 4-Tier Test Suite Requirements
1. **Tier 1 - Feature Coverage (>=5 tests per feature for key features)**:
   - Verify all 25 inventoried features (Navbar display, Hero headline/CTAs, ProofBar elements, Bento Grid cards, Manifesto principles/modal, Gallery images/badges, Lead form inputs, Zod validation feedback, Honeypot detection, Supabase leads submission contract, Admin hotkey modal trigger, responsive layouts, etc.).
2. **Tier 2 - Boundary & Corner Cases (>=5 per feature area)**:
   - Empty input submissions, malformed WhatsApp phone numbers, invalid names, extreme revenue selections, rapid clicking/debouncing, long text inputs, localStorage fallback resilience.
3. **Tier 3 - Cross-Feature Combinations (Pairwise interactions)**:
   - Navigation link click -> smooth hash scroll to `#apply` -> form field focus -> validation trigger -> submit.
   - Mobile viewport -> toggle mobile menu drawer -> click Manifesto -> open modal -> close modal.
   - Admin hotkey -> Login dialog appears -> cancel/close -> return to clean landing page.
4. **Tier 4 - Real-World Application Scenarios (>=5 scenarios)**:
   - Realistic user journeys: Executive founder application workflow, prospective partner exploring credibility and social proof, mobile visitor reviewing ecosystem on high-latency device, admin updating site configuration.

## Required Outputs
1. Executable test harness in `tests/` with runner configured in `package.json` (e.g. `npm run test:e2e` or `npm test`). Ensure the runner can execute in this environment and exit with code 0 on pass.
2. `TEST_INFRA.md` at project root following the Project Pattern template.
3. `TEST_READY.md` at project root summarizing test commands and coverage checklist.
4. `handoff.md` in your working directory summarizing results.

## 2026-09-10T04:46:21Z
<USER_REQUEST>
You are the E2E Test Writer for the NG Hub React landing page overhaul.
Your working directory: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_test_writer_e2e
Your task description is at: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_test_writer_e2e/DISPATCH.md
Project specification: /Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md
Original User Request: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md
Workspace root: /Users/arthurdemoraespd/Documents/nghub-lp

Following the 4-tier methodology (Tiers 1-4) in PROJECT.md:
1. Design and implement the opaque-box test infrastructure in tests/ (e.g. Playwright or Node/Vite test runner).
2. Create test suites for Tier 1 (Feature Coverage), Tier 2 (Boundary & Corner Cases), Tier 3 (Cross-Feature Combinations), and Tier 4 (Real-World Application Scenarios).
3. Create TEST_INFRA.md and TEST_READY.md at project root.
4. Deliver your handoff report to /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_test_writer_e2e/handoff.md.

Scope boundary: Do NOT modify application source code in src/ or components/. You own test infrastructure and test suites.
</USER_REQUEST>
