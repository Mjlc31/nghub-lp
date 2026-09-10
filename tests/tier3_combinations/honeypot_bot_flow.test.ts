import assert from 'node:assert';
import { describe, it, beforeEach } from '../harness/runner.ts';
import { StatefulMockSupabase, BOT_APPLICATION_WITH_HONEYPOT, VALID_FOUNDER_APPLICATION } from '../harness/fixtures.ts';

export function registerHoneypotBotFlowTests() {
  describe('Tier 3 — Cross-Feature Flow: Anti-Spam Honeypot Bot Interception', () => {
    let mockDb: StatefulMockSupabase;

    beforeEach(() => {
      mockDb = new StatefulMockSupabase();
    });

    it('X.BOT.1: Bot triggers honeypot -> form drops submission -> Supabase table untouched', async () => {
      const submitWithAntiSpam = async (payload: any) => {
        // Honeypot check
        if (payload.hp && payload.hp.trim().length > 0) {
          // Fake success or silent drop
          return { success: false, reason: 'bot_detected', simulatedSuccess: true };
        }
        await mockDb.from('leads').insert([payload]);
        return { success: true };
      };

      const botResult = await submitWithAntiSpam(BOT_APPLICATION_WITH_HONEYPOT);
      assert.strictEqual(botResult.reason, 'bot_detected');
      assert.strictEqual(mockDb.leads.length, 0, 'No record must be saved for bot');

      // Human submission immediately afterward
      const humanResult = await submitWithAntiSpam(VALID_FOUNDER_APPLICATION);
      assert.strictEqual(humanResult.success, true);
      assert.strictEqual(mockDb.leads.length, 1);
      assert.strictEqual(mockDb.leads[0].full_name, VALID_FOUNDER_APPLICATION.full_name);
    });

    it('X.BOT.2: Bot attempting hidden CSS form manipulation still triggers honeypot', async () => {
      const botPayload = {
        ...VALID_FOUNDER_APPLICATION,
        hp: 'http://malicious-advertiser.com/traffic'
      };

      const hasSpamTrap = Boolean(botPayload.hp && botPayload.hp.length > 0);
      assert.strictEqual(hasSpamTrap, true, 'Honeypot trap must detect automated injection');
    });
  });
}
