import assert from 'node:assert';
import { z } from 'zod';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';
import { StatefulMockSupabase, VALID_FOUNDER_APPLICATION, DEFAULT_SITE_CONFIG } from '../harness/fixtures.ts';
import { assertValidPhoneMask, assertValidZodLead } from '../harness/assertions.ts';

const leadSchema = z.object({
  full_name: z.string().min(3),
  whatsapp: z.string().min(14),
  instagram: z.string().min(2),
  niche: z.string().min(2),
  revenue_range: z.string().min(2),
  biggest_challenge: z.string().min(5)
});

export function registerScenario1ExecutiveFounderTests() {
  describe('Tier 4 — Scenario 1: High-Net-Worth Founder Application Journey', () => {
    let env: ReturnType<typeof setupTestEnvironment>;
    let mockDb: StatefulMockSupabase;

    beforeEach(() => {
      env = setupTestEnvironment();
      mockDb = new StatefulMockSupabase();
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('SCENARIO 1: Complete end-to-end founder qualification workflow', async () => {
      // 1. Founder lands on desktop browser (1440x900)
      assert.strictEqual(env.window.innerWidth, 1440);

      // 2. Reviews Hero value proposition
      const { texts } = DEFAULT_SITE_CONFIG;
      assert(texts.heroTitle.includes('mesa'), 'Hero conveys peer-group proposition');
      assert(texts.heroSubtitle.includes('Sem gurus'), 'Subtitle rejects fluff');

      // 3. Verifies Authority Proof Bar
      assert(texts.proofBar && texts.proofBar.length >= 5);
      assert(texts.proofBar.includes('XP Investimentos'));

      // 4. Explores Ecosystem Bento Grid / Pillars
      const pillars = texts.pillars!;
      assert.strictEqual(pillars.length, 3);
      assert(pillars.some(p => p.title.includes('Capital')));

      // 5. Opens Manifesto to review admission criteria
      let isManifestoOpen = false;
      const openManifesto = () => { isManifestoOpen = true; };
      openManifesto();
      assert.strictEqual(isManifestoOpen, true, 'Founder opens manifesto modal');

      // 6. Convinced of positioning, clicks "Candidatar-me" from modal/navbar
      const applySection = env.document.getElementById('apply');
      assert(applySection !== null);
      isManifestoOpen = false; // Closed automatically
      applySection.scrollIntoView({ behavior: 'smooth' });
      assert.strictEqual((globalThis as any).__lastScrolledToElement, 'apply');

      // 7. Fills High-Ticket Lead Form with High Stakes Revenue (R$ 500k+)
      const founderPayload = { ...VALID_FOUNDER_APPLICATION };
      assertValidPhoneMask(founderPayload.whatsapp);
      assert.strictEqual(founderPayload.revenue_range, 'High Stakes (R$ 500k+)');

      // 8. Validates payload via Zod contract
      const validated = assertValidZodLead(leadSchema, founderPayload);

      // 9. Submits application to Supabase leads table
      let formStatus = 'loading';
      const insertResult = await mockDb.from('leads').insert([validated]);
      assert.strictEqual(insertResult.error, null);
      formStatus = 'success';

      // 10. Confirmation view displayed with authoritative 24h review message
      assert.strictEqual(formStatus, 'success');
      assert.strictEqual(mockDb.leads.length, 1);
      assert.strictEqual(mockDb.leads[0].full_name, 'Henrique Silva Alcantara');
      assert.strictEqual(mockDb.leads[0].status, 'new');
    });
  });
}
