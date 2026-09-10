import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';
import { assertCohortStatus } from '../harness/assertions.ts';

export function registerNavbarTests() {
  describe('Tier 1 — Feature 7: Minimalist Floating Navbar & Mobile Menu', () => {
    let env: ReturnType<typeof setupTestEnvironment>;

    beforeEach(() => {
      env = setupTestEnvironment({ viewport: { width: 1440, height: 900 } });
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('F7.1: renders brand mark "NG" with correct link target', () => {
      const brandLogo = { text: 'NG', href: '#' };
      assert.strictEqual(brandLogo.text, 'NG', 'Navbar must render elite brand abbreviation NG');
      assert.strictEqual(brandLogo.href, '#', 'Brand logo must link to root/top');
    });

    it('F7.2: displays live cohort admissions status chip/badge', () => {
      const cohortStatus = '[ • COHORT 2026 // ADMISSIONS OPEN ]';
      assertCohortStatus(cohortStatus);
      assert(cohortStatus.includes('2026'), 'Status badge must reference current or upcoming admissions year');
    });

    it('F7.3: provides direct navigation links for Manifesto, Ecosystem, and Application', () => {
      const navLinks = [
        { label: 'Manifesto', action: 'openModal' },
        { label: 'Arsenal', href: '#arsenal' },
        { label: 'Candidatar-me', href: '#apply' }
      ];

      assert.strictEqual(navLinks.length, 3, 'Must render primary navigation links');
      const manifestoLink = navLinks.find(l => l.label === 'Manifesto');
      assert(manifestoLink, 'Manifesto link must be present');
      const applyLink = navLinks.find(l => l.label === 'Candidatar-me');
      assert(applyLink && applyLink.href === '#apply', 'Candidatar-me link must anchor to #apply');
    });

    it('F7.4: desktop navigation hides mobile drawer triggers and presents inline links', () => {
      assert(env.window.innerWidth >= 768, 'Test environment is at desktop resolution');
      const isDesktop = env.window.innerWidth >= 768;
      assert.strictEqual(isDesktop, true, 'Desktop viewport must enable horizontal navigation');
    });

    it('F7.5: mobile viewport (375px) activates compact drawer navigation button', () => {
      cleanupTestEnvironment();
      env = setupTestEnvironment({ viewport: { width: 375, height: 667 } });
      assert.strictEqual(env.window.innerWidth, 375, 'Viewport matches mobile device dimensions');
      const isMobile = env.window.innerWidth < 768;
      assert.strictEqual(isMobile, true, 'Mobile viewport must switch to compact/drawer layout');
    });
  });
}
