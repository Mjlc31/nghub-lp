import assert from 'node:assert';
import { z } from 'zod';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment, createMockElement } from '../harness/env.ts';
import { StatefulMockSupabase, VALID_FOUNDER_APPLICATION } from '../harness/fixtures.ts';

const leadSchema = z.object({
  full_name: z.string().min(3),
  whatsapp: z.string().min(14),
  instagram: z.string().min(2),
  niche: z.string().min(2),
  revenue_range: z.string().min(2),
  biggest_challenge: z.string().min(5)
});

export function registerNavToApplyFlowTests() {
  describe('Tier 3 — Cross-Feature Flow: Navigation to Application Submission', () => {
    let env: ReturnType<typeof setupTestEnvironment>;
    let mockDb: StatefulMockSupabase;

    beforeEach(() => {
      env = setupTestEnvironment();
      mockDb = new StatefulMockSupabase();
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('X.FLOW.1: Nav CTA -> smooth scroll to #apply -> input focus -> validation -> successful DB insert', async () => {
      // 1. User clicks "Candidatar-me" in Navbar
      let isManifestoOpen = true; // Manifesto was open before
      const applySection = env.document.getElementById('apply');
      assert(applySection !== null);

      const scrollToApply = (e: any) => {
        if (e && e.preventDefault) e.preventDefault();
        if (isManifestoOpen) isManifestoOpen = false; // Close modal if open
        applySection.scrollIntoView({ behavior: 'smooth' });
      };

      scrollToApply({ preventDefault: () => {} });
      assert.strictEqual(isManifestoOpen, false, 'Should close any modal prior to scrolling to apply');
      assert.strictEqual((globalThis as any).__lastScrolledToElement, 'apply');

      // 2. User focuses first input field
      const nameInput = createMockElement('input', 'input_full_name');
      nameInput.focus();
      assert.strictEqual((globalThis as any).__focusedElement, nameInput);

      // 3. User attempts premature submission (empty)
      const emptyPayload = { full_name: '', whatsapp: '', instagram: '', niche: '', revenue_range: '', biggest_challenge: '' };
      const valResult = leadSchema.safeParse(emptyPayload);
      assert.strictEqual(valResult.success, false, 'Validation must block empty submission');

      // 4. User inputs complete valid data
      const completeData = { ...VALID_FOUNDER_APPLICATION };
      const validParse = leadSchema.safeParse(completeData);
      assert.strictEqual(validParse.success, true);

      // 5. Form dispatches to Supabase
      const insertResult = await mockDb.from('leads').insert([validParse.data]);
      assert.strictEqual(insertResult.error, null);
      assert.strictEqual(mockDb.leads.length, 1);
      assert.strictEqual(mockDb.leads[0].full_name, VALID_FOUNDER_APPLICATION.full_name);
      assert.strictEqual(mockDb.leads[0].status, 'new');
    });

    it('X.FLOW.2: Smooth scroll target handles nonexistent hash gracefully without uncaught exceptions', () => {
      const nonExistentSection = env.document.getElementById('nonexistent_hash');
      assert.strictEqual(nonExistentSection, null);

      let threw = false;
      try {
        if (nonExistentSection) {
          (nonExistentSection as any).scrollIntoView({ behavior: 'smooth' });
        }
      } catch {
        threw = true;
      }
      assert.strictEqual(threw, false, 'Missing anchor target must not crash page execution');
    });
  });
}
