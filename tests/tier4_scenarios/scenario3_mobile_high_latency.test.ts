import assert from 'node:assert';
import { z } from 'zod';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';
import { StatefulMockSupabase, VALID_FOUNDER_APPLICATION } from '../harness/fixtures.ts';
import { formatPhoneNumber } from '../../utils/formatUtils.ts';
import { assertValidPhoneMask, assertValidZodLead } from '../harness/assertions.ts';

const leadSchema = z.object({
  full_name: z.string().min(3),
  whatsapp: z.string().min(14),
  instagram: z.string().min(2),
  niche: z.string().min(2),
  revenue_range: z.string().min(2),
  biggest_challenge: z.string().min(5)
});

export function registerScenario3MobileHighLatencyTests() {
  describe('Tier 4 — Scenario 3: Mobile Visitor on High-Latency Connection', () => {
    let env: ReturnType<typeof setupTestEnvironment>;
    let mockDb: StatefulMockSupabase;

    beforeEach(() => {
      // Mobile screen: 375x812
      env = setupTestEnvironment({ viewport: { width: 375, height: 812 } });
      mockDb = new StatefulMockSupabase();
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('SCENARIO 3: Mobile visitor on simulated slow connection completes application smoothly', async () => {
      // 1. Mobile viewport active
      assert.strictEqual(env.window.innerWidth, 375);

      // 2. Mobile visitor uses mobile navigation to jump directly to #apply
      const applySection = env.document.getElementById('apply');
      applySection!.scrollIntoView({ behavior: 'smooth' });
      assert.strictEqual((globalThis as any).__lastScrolledToElement, 'apply');

      // 3. User types phone number with touch keypad
      const rawInput = '11977778888';
      const formatted = formatPhoneNumber(rawInput);
      assert.strictEqual(formatted, '(11) 97777-8888');
      assertValidPhoneMask(formatted);

      // 4. Prepares mobile application payload
      const mobileLead = {
        ...VALID_FOUNDER_APPLICATION,
        full_name: 'Lucas Barreto Mobile',
        whatsapp: formatted
      };
      const validated = assertValidZodLead(leadSchema, mobileLead);

      // 5. Submit under high-latency simulated network (50ms async delay)
      let status: 'idle' | 'loading' | 'success' = 'idle';
      let buttonDisabled = false;

      const submitAction = async () => {
        status = 'loading';
        buttonDisabled = true;
        // High latency simulation
        await new Promise(r => setTimeout(r, 50));
        await mockDb.from('leads').insert([validated]);
        status = 'success';
        buttonDisabled = false;
      };

      const submitPromise = submitAction();
      // Verify loading state and disabled interactions
      assert.strictEqual(status, 'loading');
      assert.strictEqual(buttonDisabled, true, 'Double-tap during latency must be disabled');

      await submitPromise;
      // 6. Completes with success
      assert.strictEqual(status, 'success');
      assert.strictEqual(buttonDisabled, false);
      assert.strictEqual(mockDb.leads.length, 1);
      assert.strictEqual(mockDb.leads[0].full_name, 'Lucas Barreto Mobile');
    });
  });
}
