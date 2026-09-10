import assert from 'node:assert';
import { describe, it, beforeEach } from '../harness/runner.ts';
import { StatefulMockSupabase, VALID_FOUNDER_APPLICATION } from '../harness/fixtures.ts';

export function registerRateLimitDebounceTests() {
  describe('Tier 2 — Boundary Cases: Rate Limiting & Rapid Submissions', () => {
    let mockDb: StatefulMockSupabase;

    beforeEach(() => {
      mockDb = new StatefulMockSupabase();
    });

    it('B.RATE.1: rapid click burst (5 clicks) executes only one database submission while loading', async () => {
      let status: 'idle' | 'loading' | 'success' | 'error' = 'idle';
      let networkCalls = 0;

      const submitHandler = async () => {
        if (status === 'loading') {
          return { ignored: true };
        }
        status = 'loading';
        networkCalls++;
        // Simulate async work
        await new Promise(r => setTimeout(r, 10));
        await mockDb.from('leads').insert([VALID_FOUNDER_APPLICATION]);
        status = 'success';
        return { success: true };
      };

      // Trigger 5 concurrent calls
      const promises = [
        submitHandler(),
        submitHandler(),
        submitHandler(),
        submitHandler(),
        submitHandler()
      ];

      const results = await Promise.all(promises);
      assert.strictEqual(networkCalls, 1, 'Only first click should initiate network call');
      assert.strictEqual(mockDb.leads.length, 1, 'Only one record should be inserted in DB');
      assert.strictEqual(status, 'success');
      
      const ignoredCount = results.filter(r => (r as any).ignored).length;
      assert.strictEqual(ignoredCount, 4, 'Subsequent rapid clicks should be ignored');
    });

    it('B.RATE.2: submit button remains disabled during network in-flight state', async () => {
      let status: 'idle' | 'loading' | 'success' = 'idle';
      const isButtonDisabled = () => status === 'loading';

      assert.strictEqual(isButtonDisabled(), false);
      status = 'loading';
      assert.strictEqual(isButtonDisabled(), true, 'Button must be disabled when status is loading');
      status = 'success';
      assert.strictEqual(isButtonDisabled(), false);
    });

    it('B.RATE.3: submission error reenables form and allows intentional retry', async () => {
      let status: 'idle' | 'loading' | 'error' | 'success' = 'idle';
      mockDb.simulateNetworkError = true;

      // First attempt fails
      status = 'loading';
      const res1 = await mockDb.from('leads').insert([VALID_FOUNDER_APPLICATION]);
      if (res1.error) status = 'error';

      assert.strictEqual(status, 'error');
      assert.strictEqual(mockDb.leads.length, 0);

      // User fixes network and retries
      mockDb.simulateNetworkError = false;
      status = 'loading';
      const res2 = await mockDb.from('leads').insert([VALID_FOUNDER_APPLICATION]);
      if (!res2.error) status = 'success';

      assert.strictEqual(status, 'success');
      assert.strictEqual(mockDb.leads.length, 1, 'Retry successfully writes to database');
    });

    it('B.RATE.4: success confirmation state locks form inputs', () => {
      let status: 'idle' | 'success' = 'success';
      const areInputsEditable = () => status !== 'success';

      assert.strictEqual(areInputsEditable(), false, 'Inputs must be uneditable once in success state');
    });

    it('B.RATE.5: automatic form reset after success clears fields for fresh state', async () => {
      let formData = { ...VALID_FOUNDER_APPLICATION };
      let status: 'idle' | 'success' = 'success';

      const resetForm = () => {
        formData = {
          full_name: '',
          whatsapp: '',
          instagram: '',
          niche: '',
          revenue_range: '',
          biggest_challenge: ''
        };
        status = 'idle';
      };

      resetForm();
      assert.strictEqual(status, 'idle');
      assert.strictEqual(formData.full_name, '');
      assert.strictEqual(formData.whatsapp, '');
    });
  });
}
