import assert from 'node:assert';
import { describe, it } from '../harness/runner.ts';
import { formatPhoneNumber } from '../../utils/formatUtils.ts';
import { assertValidPhoneMask } from '../harness/assertions.ts';

export function registerPhoneMaskBoundariesTests() {
  describe('Tier 2 — Boundary Cases: Phone Masking Utility', () => {
    it('B.PHONE.1: formats 10-digit telephone number correctly', () => {
      const formatted = formatPhoneNumber('1133334444');
      assert.strictEqual(formatted, '(11) 3333-4444');
      assertValidPhoneMask(formatted);
    });

    it('B.PHONE.2: formats 11-digit mobile number correctly with 9-digit prefix', () => {
      const formatted = formatPhoneNumber('11987654321');
      assert.strictEqual(formatted, '(11) 98765-4321');
      assertValidPhoneMask(formatted);
    });

    it('B.PHONE.3: strips non-numeric characters and formats extracted digits', () => {
      const dirty = 'tel: +55 (11) 98765-4321 [ext 99]';
      // formatPhoneNumber regex extracts pure digits
      const formatted = formatPhoneNumber(dirty);
      assert(formatted.startsWith('(55)') || formatted.startsWith('(11)'));
    });

    it('B.PHONE.4: truncates overflow digits beyond 11 digits to prevent buffer overflow', () => {
      const overflow = '1198765432199999999999';
      const formatted = formatPhoneNumber(overflow);
      // Expected to truncate at 11 digits
      assert.strictEqual(formatted, '(11) 98765-4321');
    });

    it('B.PHONE.5: preserves partial typing for short inputs gracefully', () => {
      const twoDigits = formatPhoneNumber('11');
      assert.strictEqual(twoDigits, '11');

      const threeDigits = formatPhoneNumber('119');
      assert.strictEqual(threeDigits, '(11) 9');
    });

    it('B.PHONE.6: handles empty string and whitespace without crashing', () => {
      assert.strictEqual(formatPhoneNumber(''), '');
      assert.strictEqual(formatPhoneNumber('   '), '');
    });
  });
}
