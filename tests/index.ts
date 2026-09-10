/**
 * Master E2E Test Suite Orchestrator
 * Runs all 4 tiers of opaque-box tests for the NG Hub landing page overhaul.
 */

import { registry } from './harness/runner.ts';

// Tier 1: Feature Coverage
import { registerNavbarTests } from './tier1_features/navbar.test.ts';
import { registerHeroTests } from './tier1_features/hero.test.ts';
import { registerProofBarTests } from './tier1_features/proofbar.test.ts';
import { registerBentoGridTests } from './tier1_features/bento_grid.test.ts';
import { registerManifestoTests } from './tier1_features/manifesto.test.ts';
import { registerGalleryTests } from './tier1_features/gallery.test.ts';
import { registerLeadFormTests } from './tier1_features/lead_form.test.ts';
import { registerSupabaseLeadsTests } from './tier1_features/supabase_leads.test.ts';
import { registerAdminGateTests } from './tier1_features/admin_gate.test.ts';
import { registerSiteConfigTests } from './tier1_features/site_config.test.ts';
import { registerFooterTests } from './tier1_features/footer.test.ts';
import { registerToolchainAssetsTests } from './tier1_features/toolchain_assets.test.ts';

// Tier 2: Boundary & Corner Cases
import { registerLeadFormBoundariesTests } from './tier2_boundaries/lead_form_boundaries.test.ts';
import { registerPhoneMaskBoundariesTests } from './tier2_boundaries/phone_mask_boundaries.test.ts';
import { registerRevenueBoundariesTests } from './tier2_boundaries/revenue_boundaries.test.ts';
import { registerRateLimitDebounceTests } from './tier2_boundaries/rate_limit_debounce.test.ts';
import { registerPayloadBoundariesTests } from './tier2_boundaries/payload_boundaries.test.ts';
import { registerStorageBoundariesTests } from './tier2_boundaries/storage_boundaries.test.ts';

// Tier 3: Cross-Feature Combinations
import { registerNavToApplyFlowTests } from './tier3_combinations/nav_to_apply_flow.test.ts';
import { registerMobileDrawerManifestoTests } from './tier3_combinations/mobile_drawer_manifesto.test.ts';
import { registerAdminHotkeyLoginFlowTests } from './tier3_combinations/admin_hotkey_login_flow.test.ts';
import { registerHoneypotBotFlowTests } from './tier3_combinations/honeypot_bot_flow.test.ts';
import { registerConfigReactivityFlowTests } from './tier3_combinations/config_reactivity_flow.test.ts';

// Tier 4: Real-World Application Scenarios
import { registerScenario1ExecutiveFounderTests } from './tier4_scenarios/scenario1_executive_founder.test.ts';
import { registerScenario2StrategicPartnerTests } from './tier4_scenarios/scenario2_strategic_partner.test.ts';
import { registerScenario3MobileHighLatencyTests } from './tier4_scenarios/scenario3_mobile_high_latency.test.ts';
import { registerScenario4AdminOperationsTests } from './tier4_scenarios/scenario4_admin_operations.test.ts';
import { registerScenario5MaliciousBotDefenseTests } from './tier4_scenarios/scenario5_malicious_bot_defense.test.ts';

async function main() {
  console.log('\x1b[90mRegistering Tier 1 (Feature Coverage) suites...\x1b[0m');
  registerNavbarTests();
  registerHeroTests();
  registerProofBarTests();
  registerBentoGridTests();
  registerManifestoTests();
  registerGalleryTests();
  registerLeadFormTests();
  registerSupabaseLeadsTests();
  registerAdminGateTests();
  registerSiteConfigTests();
  registerFooterTests();
  registerToolchainAssetsTests();

  console.log('\x1b[90mRegistering Tier 2 (Boundary & Corner Cases) suites...\x1b[0m');
  registerLeadFormBoundariesTests();
  registerPhoneMaskBoundariesTests();
  registerRevenueBoundariesTests();
  registerRateLimitDebounceTests();
  registerPayloadBoundariesTests();
  registerStorageBoundariesTests();

  console.log('\x1b[90mRegistering Tier 3 (Cross-Feature Combinations) suites...\x1b[0m');
  registerNavToApplyFlowTests();
  registerMobileDrawerManifestoTests();
  registerAdminHotkeyLoginFlowTests();
  registerHoneypotBotFlowTests();
  registerConfigReactivityFlowTests();

  console.log('\x1b[90mRegistering Tier 4 (Real-World Application Scenarios) suites...\x1b[0m');
  registerScenario1ExecutiveFounderTests();
  registerScenario2StrategicPartnerTests();
  registerScenario3MobileHighLatencyTests();
  registerScenario4AdminOperationsTests();
  registerScenario5MaliciousBotDefenseTests();

  const results = await registry.runAll();

  if (results.failed > 0) {
    console.error(`\x1b[31mE2E Test Run FAILED: ${results.failed} test(s) encountered errors.\x1b[0m\n`);
    process.exit(1);
  } else {
    console.log(`\x1b[32m✔ All ${results.totalTests} tests across ${results.totalSuites} suites passed successfully!\x1b[0m\n`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('\x1b[31mFatal unhandled error during test execution:\x1b[0m', err);
  process.exit(1);
});
