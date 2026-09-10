import assert from 'node:assert';
import { z } from 'zod';
import { describe, it } from '../harness/runner.ts';
import { VALID_FOUNDER_APPLICATION, INVALID_APPLICATIONS } from '../harness/fixtures.ts';
import { assertZodValidationError, assertValidZodLead } from '../harness/assertions.ts';

const leadSchema = z.object({
  full_name: z.string().min(3, "Nome completo é obrigatório"),
  whatsapp: z.string().min(14, "WhatsApp inválido. Siga o formato (00) 00000-0000"),
  instagram: z.string().min(2, "Instagram é obrigatório"),
  niche: z.string().min(2, "Nicho é obrigatório"),
  revenue_range: z.string().min(2, "Selecione o faturamento"),
  biggest_challenge: z.string().min(5, "Descreva seu maior desafio em mais palavras")
});

export function registerLeadFormBoundariesTests() {
  describe('Tier 2 — Boundary Cases: Lead Form Validation', () => {
    it('B.FORM.1: empty form payload triggers validation failure on first field', () => {
      assertZodValidationError(leadSchema, INVALID_APPLICATIONS.empty, 'full_name');
    });

    it('B.FORM.2: full_name with exactly 2 characters fails min(3) rule', () => {
      assertZodValidationError(leadSchema, INVALID_APPLICATIONS.shortName, 'full_name');
    });

    it('B.FORM.3: full_name with exactly 3 characters passes boundary', () => {
      const validBoundary = { ...VALID_FOUNDER_APPLICATION, full_name: 'Ana' };
      const parsed = assertValidZodLead(leadSchema, validBoundary);
      assert.strictEqual(parsed.full_name, 'Ana');
    });

    it('B.FORM.4: formatted whatsapp under 14 chars fails length constraint', () => {
      assertZodValidationError(leadSchema, INVALID_APPLICATIONS.malformedPhone, 'whatsapp');
    });

    it('B.FORM.5: instagram handle with 1 character fails min(2) rule', () => {
      assertZodValidationError(leadSchema, INVALID_APPLICATIONS.shortInstagram, 'instagram');
    });

    it('B.FORM.6: niche with 1 character fails min(2) rule', () => {
      assertZodValidationError(leadSchema, INVALID_APPLICATIONS.shortNiche, 'niche');
    });

    it('B.FORM.7: unselected empty revenue range fails validation', () => {
      assertZodValidationError(leadSchema, INVALID_APPLICATIONS.missingRevenue, 'revenue_range');
    });

    it('B.FORM.8: biggest_challenge with 4 characters fails min(5) rule', () => {
      assertZodValidationError(leadSchema, INVALID_APPLICATIONS.shortChallenge, 'biggest_challenge');
    });

    it('B.FORM.9: complex Portuguese names with accents, apostrophes and hyphens pass', () => {
      const complexLead = {
        ...VALID_FOUNDER_APPLICATION,
        full_name: "José d'Ávila-Sá Albuquerque"
      };
      const result = assertValidZodLead(leadSchema, complexLead);
      assert.strictEqual(result.full_name, "José d'Ávila-Sá Albuquerque");
    });
  });
}
