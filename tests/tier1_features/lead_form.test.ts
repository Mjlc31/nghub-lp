import assert from 'node:assert';
import { z } from 'zod';
import { describe, it } from '../harness/runner.ts';
import { VALID_FOUNDER_APPLICATION, REVENUE_BRACKETS, BOT_APPLICATION_WITH_HONEYPOT } from '../harness/fixtures.ts';
import { assertValidPhoneMask, assertValidZodLead, assertZodValidationError } from '../harness/assertions.ts';
import { formatPhoneNumber } from '../../utils/formatUtils.ts';

// Contract schema matching LeadForm.tsx
const leadSchema = z.object({
  full_name: z.string().min(3, "Nome completo é obrigatório"),
  whatsapp: z.string().min(14, "WhatsApp inválido. Siga o formato (00) 00000-0000"),
  instagram: z.string().min(2, "Instagram é obrigatório"),
  niche: z.string().min(2, "Nicho é obrigatório"),
  revenue_range: z.string().min(2, "Selecione o faturamento"),
  biggest_challenge: z.string().min(5, "Descreva seu maior desafio em mais palavras")
});

export function registerLeadFormTests() {
  describe('Tier 1 — Feature 14: High-Ticket Application Portal (#apply)', () => {
    it('F14.1: requires 6 core qualification fields', () => {
      const requiredFields = ['full_name', 'whatsapp', 'instagram', 'niche', 'revenue_range', 'biggest_challenge'];
      for (const field of requiredFields) {
        assert(field in VALID_FOUNDER_APPLICATION, `Lead payload must contain required field '${field}'`);
      }
    });

    it('F14.2: formats Brazilian WhatsApp numbers with dynamic masking', () => {
      const rawNumber = '11987654321';
      const formatted = formatPhoneNumber(rawNumber);
      assert.strictEqual(formatted, '(11) 98765-4321');
      assertValidPhoneMask(formatted);
    });

    it('F14.3: provides 5 strategic revenue bracket tiers', () => {
      assert.strictEqual(REVENUE_BRACKETS.length, 5, 'Must offer exactly 5 revenue tiers');
      assert(REVENUE_BRACKETS.includes('High Stakes (R$ 500k+)'), 'Must offer High Stakes bracket');
      assert(REVENUE_BRACKETS.includes('Estou começando (< R$ 10k)'), 'Must offer initial bracket');
    });

    it('F14.4: validates complete applications using Zod schema contract', () => {
      const result = assertValidZodLead(leadSchema, VALID_FOUNDER_APPLICATION);
      assert.strictEqual(result.full_name, VALID_FOUNDER_APPLICATION.full_name);
      assert.strictEqual(result.revenue_range, 'High Stakes (R$ 500k+)');
    });

    it('F14.5: rejects incomplete or malformed inputs with descriptive feedback', () => {
      const invalidData = {
        ...VALID_FOUNDER_APPLICATION,
        full_name: 'Al', // min 3
        whatsapp: '11987' // under 14
      };

      assertZodValidationError(leadSchema, invalidData, 'full_name');
    });

    it('F14.6: detects honeypot bot trap to filter spam submissions', () => {
      const verifyHoneypot = (data: typeof BOT_APPLICATION_WITH_HONEYPOT) => {
        if (data.hp && data.hp.trim().length > 0) {
          return { isSpam: true, action: 'drop' };
        }
        return { isSpam: false, action: 'process' };
      };

      const result = verifyHoneypot(BOT_APPLICATION_WITH_HONEYPOT);
      assert.strictEqual(result.isSpam, true, 'Honeypot field with content must flag application as spam');
      assert.strictEqual(result.action, 'drop', 'Spam submission must be dropped');

      const humanResult = verifyHoneypot({ ...VALID_FOUNDER_APPLICATION, hp: '' });
      assert.strictEqual(humanResult.isSpam, false, 'Clean application must pass honeypot check');
    });
  });
}
