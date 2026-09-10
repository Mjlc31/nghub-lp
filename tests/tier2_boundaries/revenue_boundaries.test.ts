import assert from 'node:assert';
import { z } from 'zod';
import { describe, it } from '../harness/runner.ts';
import { REVENUE_BRACKETS, VALID_FOUNDER_APPLICATION } from '../harness/fixtures.ts';
import { assertValidZodLead, assertZodValidationError } from '../harness/assertions.ts';

const revenueEnumSchema = z.enum([
  "Estou começando (< R$ 10k)",
  "Tracionando (R$ 10k - R$ 50k)",
  "Escalando (R$ 50k - R$ 100k)",
  "Consolidado (R$ 100k - R$ 500k)",
  "High Stakes (R$ 500k+)"
]);

export function registerRevenueBoundariesTests() {
  describe('Tier 2 — Boundary Cases: Revenue Brackets Selection', () => {
    it('B.REV.1: accepts lowest entry bracket ("Estou começando (< R$ 10k)")', () => {
      const parsed = revenueEnumSchema.parse("Estou começando (< R$ 10k)");
      assert.strictEqual(parsed, "Estou começando (< R$ 10k)");
    });

    it('B.REV.2: accepts highest elite bracket ("High Stakes (R$ 500k+)")', () => {
      const parsed = revenueEnumSchema.parse("High Stakes (R$ 500k+)");
      assert.strictEqual(parsed, "High Stakes (R$ 500k+)");
    });

    it('B.REV.3: accepts all intermediate brackets in the spectrum', () => {
      for (const bracket of REVENUE_BRACKETS) {
        const parsed = revenueEnumSchema.parse(bracket);
        assert.strictEqual(parsed, bracket);
      }
    });

    it('B.REV.4: rejects unrecognized custom revenue bracket text', () => {
      const tamperedRevenue = "Bilionário (R$ 10M+)";
      try {
        revenueEnumSchema.parse(tamperedRevenue);
        assert.fail('Should have rejected unrecognized revenue bracket');
      } catch (err: any) {
        assert(err.issues || err.errors);
      }
    });

    it('B.REV.5: rejects numeric inputs or non-string revenue representations', () => {
      try {
        revenueEnumSchema.parse(500000 as any);
        assert.fail('Should reject non-string representation');
      } catch (err: any) {
        assert(err.issues || err.errors);
      }
    });
  });
}
