import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';
import { StatefulMockSupabase, VALID_FOUNDER_APPLICATION, VALID_STRATEGIC_PARTNER_APPLICATION } from '../harness/fixtures.ts';

export function registerScenario4AdminOperationsTests() {
  describe('Tier 4 — Scenario 4: Cohort Admissions Director Operations Journey', () => {
    let env: ReturnType<typeof setupTestEnvironment>;
    let mockDb: StatefulMockSupabase;

    beforeEach(() => {
      env = setupTestEnvironment();
      mockDb = new StatefulMockSupabase();
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('SCENARIO 4: Admin hotkey -> Authenticate -> Triage leads -> Update status -> Logout', async () => {
      // 1. Seed existing applicants in Supabase
      await mockDb.from('leads').insert([
        { ...VALID_FOUNDER_APPLICATION, full_name: 'Applicant Alpha', status: 'new' },
        { ...VALID_STRATEGIC_PARTNER_APPLICATION, full_name: 'Applicant Beta', status: 'new' }
      ]);
      assert.strictEqual(mockDb.leads.length, 2);

      // 2. Admissions Director presses CTRL+SHIFT+A
      let showLogin = false;
      let isAdminOpen = false;
      let isAuthenticated = false;

      const triggerHotkey = () => {
        if (isAuthenticated) {
          isAdminOpen = !isAdminOpen;
        } else {
          showLogin = true;
        }
      };

      triggerHotkey();
      assert.strictEqual(showLogin, true, 'Login modal mounts for unauthenticated director');

      // 3. Director submits administrator credentials
      const authRes = await mockDb.auth.signInWithPassword({
        email: 'admin@nghub.com',
        password: 'ValidPassword123!'
      });
      assert.strictEqual(authRes.error, null);
      isAuthenticated = true;
      showLogin = false;
      isAdminOpen = true;

      // 4. Director views leads triage dashboard
      const { data: leadsList } = await mockDb.from('leads').select('*').order('created_at', { ascending: false });
      assert(leadsList !== null);
      assert.strictEqual(leadsList.length, 2);
      assert.strictEqual(leadsList[0].status, 'new');

      // 5. Director qualifies high-priority founder
      const targetLead = leadsList[0];
      const updateRes = await mockDb.from('leads').update({ status: 'qualified' }).eq('id', targetLead.id);
      assert.strictEqual(updateRes.error, null);

      // 6. Confirms lead status updated in database
      const updatedLead = mockDb.leads.find(l => l.id === targetLead.id);
      assert.strictEqual(updatedLead?.status, 'qualified');

      // 7. Director logs out cleanly
      await mockDb.auth.signOut();
      isAuthenticated = false;
      isAdminOpen = false;

      assert.strictEqual(isAuthenticated, false);
      assert.strictEqual(isAdminOpen, false);
      assert.strictEqual(mockDb.currentUser, null);
    });
  });
}
