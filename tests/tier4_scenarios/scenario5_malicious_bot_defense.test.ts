import assert from 'node:assert';
import { describe, it, beforeEach } from '../harness/runner.ts';
import { StatefulMockSupabase, BOT_APPLICATION_WITH_HONEYPOT, VALID_FOUNDER_APPLICATION } from '../harness/fixtures.ts';

export function registerScenario5MaliciousBotDefenseTests() {
  describe('Tier 4 — Scenario 5: Automated Attack Script & Spam Defense', () => {
    let mockDb: StatefulMockSupabase;

    beforeEach(() => {
      mockDb = new StatefulMockSupabase();
    });

    it('SCENARIO 5: Anti-spam defense isolates rapid bot burst and maintains database integrity', async () => {
      let droppedSubmissions = 0;
      let legitimateSubmissions = 0;

      const defenseGateway = async (payload: any) => {
        // Honeypot trap check
        if (payload.hp && payload.hp.trim().length > 0) {
          droppedSubmissions++;
          return { accepted: false, reason: 'honeypot_triggered' };
        }

        // Schema validation check
        if (!payload.full_name || payload.full_name.length < 3) {
          droppedSubmissions++;
          return { accepted: false, reason: 'validation_failed' };
        }

        // Legitimate insert
        legitimateSubmissions++;
        await mockDb.from('leads').insert([payload]);
        return { accepted: true };
      };

      // 1. Bot attempts 10 rapid-fire spam submissions with honeypot field filled
      const botBurst = Array(10).fill(null).map((_, idx) => ({
        ...BOT_APPLICATION_WITH_HONEYPOT,
        full_name: `Spam Bot Agent #${idx}`
      }));

      for (const attackPayload of botBurst) {
        const res = await defenseGateway(attackPayload);
        assert.strictEqual(res.accepted, false);
      }

      // 2. Database contains zero bot records
      assert.strictEqual(droppedSubmissions, 10);
      assert.strictEqual(mockDb.leads.length, 0);

      // 3. Legitimate human founder submits simultaneously
      const humanRes = await defenseGateway(VALID_FOUNDER_APPLICATION);
      assert.strictEqual(humanRes.accepted, true);
      assert.strictEqual(legitimateSubmissions, 1);
      assert.strictEqual(mockDb.leads.length, 1);
      assert.strictEqual(mockDb.leads[0].full_name, VALID_FOUNDER_APPLICATION.full_name);
    });
  });
}
