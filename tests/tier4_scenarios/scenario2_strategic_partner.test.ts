import assert from 'node:assert';
import { z } from 'zod';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';
import { StatefulMockSupabase, VALID_STRATEGIC_PARTNER_APPLICATION, DEFAULT_SITE_CONFIG } from '../harness/fixtures.ts';
import { assertValidPhoneMask, assertValidZodLead } from '../harness/assertions.ts';

const leadSchema = z.object({
  full_name: z.string().min(3),
  whatsapp: z.string().min(14),
  instagram: z.string().min(2),
  niche: z.string().min(2),
  revenue_range: z.string().min(2),
  biggest_challenge: z.string().min(5)
});

export function registerScenario2StrategicPartnerTests() {
  describe('Tier 4 — Scenario 2: Strategic Partner Credibility Audit Journey', () => {
    let env: ReturnType<typeof setupTestEnvironment>;
    let mockDb: StatefulMockSupabase;

    beforeEach(() => {
      env = setupTestEnvironment();
      mockDb = new StatefulMockSupabase();
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('SCENARIO 2: Strategic investor audits authority proof, gallery, and proposes partnership', async () => {
      // 1. Partner inspects ProofBar brands for institutional credibility
      const proofBar = DEFAULT_SITE_CONFIG.texts.proofBar!;
      const institutionalPartners = ['XP Investimentos', 'Stone', 'iFood'];
      for (const partner of institutionalPartners) {
        assert(proofBar.includes(partner), `Must display recognized partner ${partner}`);
      }

      // 2. Partner inspects Gallery photo assets representing real closed-door meetings
      const gallery = DEFAULT_SITE_CONFIG.images.gallery;
      assert(gallery.length >= 4, 'Gallery must demonstrate genuine community track record');

      // 3. Partner scrolls to application section to initiate high-level discussion
      const applySection = env.document.getElementById('apply');
      applySection!.scrollIntoView({ behavior: 'smooth' });
      assert.strictEqual((globalThis as any).__lastScrolledToElement, 'apply');

      // 4. Partner completes application targeting Venture Capital / Family Office
      const partnerPayload = { ...VALID_STRATEGIC_PARTNER_APPLICATION };
      assertValidPhoneMask(partnerPayload.whatsapp);
      assert.strictEqual(partnerPayload.niche, 'Venture Capital & Family Office');

      // 5. Validates payload
      const validated = assertValidZodLead(leadSchema, partnerPayload);

      // 6. Submits to Supabase
      const insertResult = await mockDb.from('leads').insert([validated]);
      assert.strictEqual(insertResult.error, null);
      assert.strictEqual(mockDb.leads.length, 1);
      assert.strictEqual(mockDb.leads[0].full_name, 'Camila Guimarães Rocha');
      assert.strictEqual(mockDb.leads[0].status, 'new');
    });
  });
}
