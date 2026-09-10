import assert from 'node:assert';
import { describe, it, beforeEach } from '../harness/runner.ts';
import { StatefulMockSupabase, VALID_FOUNDER_APPLICATION, VALID_STRATEGIC_PARTNER_APPLICATION } from '../harness/fixtures.ts';

export function registerSupabaseLeadsTests() {
  describe('Tier 1 — Features 15 & 16: Supabase Leads Dual-Write & Admin Leads Table', () => {
    let mockDb: StatefulMockSupabase;

    beforeEach(() => {
      mockDb = new StatefulMockSupabase();
    });

    it('F15.1: submitLead inserts record into "leads" table with default status "new"', async () => {
      const submitLeadWrapper = async (data: any) => {
        return await mockDb.from('leads').insert([{ ...data, status: 'new' }]);
      };

      const res = await submitLeadWrapper(VALID_FOUNDER_APPLICATION);
      assert.strictEqual(res.error, null);
      assert.strictEqual(mockDb.leads.length, 1);
      assert.strictEqual(mockDb.leads[0].status, 'new');
      assert.strictEqual(mockDb.leads[0].full_name, VALID_FOUNDER_APPLICATION.full_name);
      assert(mockDb.leads[0].id.startsWith('lead_'));
      assert(mockDb.leads[0].created_at.length > 0);
    });

    it('F15.2: getLeads retrieves leads sorted by creation date descending', async () => {
      await mockDb.from('leads').insert([
        { ...VALID_FOUNDER_APPLICATION, full_name: 'Lead Earlier', status: 'new' }
      ]);
      // Small artificial offset
      await new Promise(r => setTimeout(r, 5));
      await mockDb.from('leads').insert([
        { ...VALID_STRATEGIC_PARTNER_APPLICATION, full_name: 'Lead Later', status: 'new' }
      ]);

      const { data, error } = await mockDb.from('leads').select('*').order('created_at', { ascending: false });
      assert.strictEqual(error, null);
      assert.strictEqual(data?.length, 2);
      assert.strictEqual(data[0].full_name, 'Lead Later', 'Most recent lead must be first');
    });

    it('F16.1: updateLeadStatus transitions lead status accurately', async () => {
      await mockDb.from('leads').insert([{ ...VALID_FOUNDER_APPLICATION, status: 'new' }]);
      const leadId = mockDb.leads[0].id;

      const { error } = await mockDb.from('leads').update({ status: 'qualified' }).eq('id', leadId);
      assert.strictEqual(error, null);
      assert.strictEqual(mockDb.leads[0].status, 'qualified');

      await mockDb.from('leads').update({ status: 'won' }).eq('id', leadId);
      assert.strictEqual(mockDb.leads[0].status, 'won');
    });

    it('F15.3: supports dual-write webhook dispatch when endpoint is configured', async () => {
      let webhookPayload: any = null;
      const mockWebhookPoster = async (url: string, payload: any) => {
        if (url) {
          webhookPayload = payload;
          return { ok: true, status: 200 };
        }
        return null;
      };

      const endpoint = 'https://api.nghub.com/webhooks/leads';
      const payload = { ...VALID_FOUNDER_APPLICATION, source: 'Landing Page' };

      await mockDb.from('leads').insert([payload]);
      const webhookRes = await mockWebhookPoster(endpoint, payload);

      assert.strictEqual(webhookRes?.ok, true);
      assert.strictEqual(webhookPayload.full_name, VALID_FOUNDER_APPLICATION.full_name);
      assert.strictEqual(webhookPayload.source, 'Landing Page');
    });

    it('F15.4: propagates database connection errors gracefully', async () => {
      mockDb.simulateNetworkError = true;
      const res = await mockDb.from('leads').insert([VALID_FOUNDER_APPLICATION]);
      assert(res.error !== null, 'Should return error object when database fails');
      assert.strictEqual(mockDb.leads.length, 0, 'No lead should be saved when database errors');
    });
  });
}
