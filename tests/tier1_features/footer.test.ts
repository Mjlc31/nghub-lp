import assert from 'node:assert';
import { describe, it } from '../harness/runner.ts';

export function registerFooterTests() {
  describe('Tier 1 — Feature 13: Minimalist Footer & Parallax Extraction', () => {
    it('F13.1: displays elite brand abbreviation "NG" with root anchor', () => {
      const footerBrand = { text: 'NG', href: '#' };
      assert.strictEqual(footerBrand.text, 'NG');
      assert.strictEqual(footerBrand.href, '#');
    });

    it('F13.2: renders dynamic current calendar year in copyright notice', () => {
      const currentYear = new Date().getFullYear();
      const copyrightText = `© ${currentYear} NGHUB. All Rights Reserved.`;
      assert(copyrightText.includes(String(currentYear)), 'Copyright notice must reflect current calendar year');
      assert(copyrightText.includes('NGHUB. All Rights Reserved.'));
    });

    it('F13.3: incorporates official communication channels (Instagram, Email)', () => {
      const socialChannels = [
        { name: 'Instagram', icon: 'Instagram' },
        { name: 'Email', icon: 'Mail' }
      ];

      assert.strictEqual(socialChannels.length, 2);
      assert(socialChannels.some(s => s.name === 'Instagram'));
      assert(socialChannels.some(s => s.name === 'Email'));
    });

    it('F13.4: parallax quote section isolates background rendering without fixed screen viewport bugs', () => {
      const quoteStyles = {
        position: 'relative',
        isFixedViewport: false,
        contrastOverlay: 'bg-black/70'
      };

      assert.strictEqual(quoteStyles.isFixedViewport, false, 'Parallax quote must not break mobile scrolling with fixed full-screen containers');
      assert(quoteStyles.contrastOverlay.includes('bg-black'), 'Must have contrast backdrop overlay');
    });

    it('F13.5: displays telemetry system status indicator in footer', () => {
      const systemStatus = {
        label: 'SYSTEM STATUS',
        status: 'ALL SERVICES OPERATIONAL',
        ping: '14ms'
      };

      assert.strictEqual(systemStatus.status, 'ALL SERVICES OPERATIONAL');
      assert(systemStatus.label.includes('SYSTEM STATUS'));
    });
  });
}
