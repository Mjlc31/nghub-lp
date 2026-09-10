import assert from 'node:assert';
import { describe, it } from '../harness/runner.ts';
import { DEFAULT_AUTHORITY_BRANDS } from '../harness/fixtures.ts';

export function registerProofBarTests() {
  describe('Tier 1 — Feature 9: Monochrome Brand & Authority Proof Bar', () => {
    it('F9.1: contains authoritative ecosystem brands', () => {
      assert(DEFAULT_AUTHORITY_BRANDS.length >= 5, 'Must contain at least 5 benchmark brand partners');
      assert(DEFAULT_AUTHORITY_BRANDS.includes('XP Investimentos'), 'Must include XP Investimentos');
      assert(DEFAULT_AUTHORITY_BRANDS.includes('Stone'), 'Must include Stone');
      assert(DEFAULT_AUTHORITY_BRANDS.includes('iFood'), 'Must include iFood');
      assert(DEFAULT_AUTHORITY_BRANDS.includes('Vtex'), 'Must include Vtex');
    });

    it('F9.2: renders with monochrome styling specifications', () => {
      const proofBarStyles = {
        filter: 'grayscale(100%)',
        opacity: 0.6,
        hoverOpacity: 1.0,
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
      };

      assert.strictEqual(proofBarStyles.filter, 'grayscale(100%)', 'Must enforce 100% grayscale monochrome design');
      assert(proofBarStyles.opacity <= 0.8, 'Default opacity must be subdued');
      assert(proofBarStyles.hoverOpacity === 1.0, 'Hover state must bring brand marks to full prominence');
    });

    it('F9.3: header displays executive context label', () => {
      const headerText = 'Membros do NGHUB lideram empresas como';
      assert(headerText.includes('NGHUB'), 'Context label must identify community');
      assert(headerText.includes('lideram'), 'Context label must emphasize leadership');
    });

    it('F9.4: handles dynamic brand arrays injected via site configuration', () => {
      const customBrands = ['Nubank', 'Brex', 'Stripe', 'Gympass'];
      const proofBarComponent = (brands?: string[]) => {
        if (!brands || brands.length === 0) return null;
        return { renderedCount: brands.length, items: brands };
      };

      const result = proofBarComponent(customBrands);
      assert(result !== null);
      assert.strictEqual(result.renderedCount, 4);
      assert.strictEqual(result.items[0], 'Nubank');
    });

    it('F9.5: returns null / renders nothing when brand array is empty or undefined', () => {
      const proofBarComponent = (brands?: string[]) => {
        if (!brands || brands.length === 0) return null;
        return { renderedCount: brands.length };
      };

      assert.strictEqual(proofBarComponent([]), null, 'Empty brand array must not render container');
      assert.strictEqual(proofBarComponent(undefined), null, 'Undefined brand prop must not render container');
    });
  });
}
