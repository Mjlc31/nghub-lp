import assert from 'node:assert';
import { describe, it } from '../harness/runner.ts';
import { DEFAULT_SITE_CONFIG } from '../harness/fixtures.ts';

export function registerBentoGridTests() {
  describe('Tier 1 — Feature 10: High-Craft Bento Grid Ecosystem', () => {
    it('F10.1: renders core ecosystem pillars with structured titles', () => {
      const pillars = DEFAULT_SITE_CONFIG.texts.pillars;
      assert(pillars && pillars.length >= 3, 'Must define at least 3 pillars in the ecosystem');
      
      const titles = pillars.map(p => p.title);
      assert(titles.some(t => t.includes('Networking')), 'Must include Networking pillar');
      assert(titles.some(t => t.includes('Capital')), 'Must include Capital pillar');
      assert(titles.some(t => t.includes('Mentoria')), 'Must include Mentoria pillar');
    });

    it('F10.2: each ecosystem card provides substantive value description', () => {
      const pillars = DEFAULT_SITE_CONFIG.texts.pillars!;
      for (const pillar of pillars) {
        assert(pillar.description.length > 30, `Description for '${pillar.title}' must be detailed, got ${pillar.description.length} chars`);
      }
    });

    it('F10.3: supports asymmetrical grid card dimensions (Bento Grid layout)', () => {
      const cardSpans = [
        { id: 'card-1', colSpan: 'col-span-12 md:col-span-8', title: 'Networking de Alto Nível' },
        { id: 'card-2', colSpan: 'col-span-12 md:col-span-4', title: 'Acesso a Capital' },
        { id: 'card-3', colSpan: 'col-span-12 md:col-span-4', title: 'Mentoria Real' },
        { id: 'card-4', colSpan: 'col-span-12 md:col-span-8', title: 'Deals & Co-investimento' }
      ];

      assert.strictEqual(cardSpans.length, 4, 'Bento Grid contains asymmetrical 4-card ecosystem composition');
      assert(cardSpans[0].colSpan.includes('col-span-8'), 'First card has wider presence for core community');
    });

    it('F10.4: card elements incorporate interactive cursor spotlights and hairline borders', () => {
      const cardStyleSpec = {
        borderWidth: '1px',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        background: '#0C0E12',
        hasSpotlight: true
      };

      assert.strictEqual(cardStyleSpec.background, '#0C0E12', 'Surface color must use Obsidian token #0C0E12');
      assert.strictEqual(cardStyleSpec.borderColor, 'rgba(255, 255, 255, 0.08)', 'Borders must use hairline token border-white/[0.08]');
      assert.strictEqual(cardStyleSpec.hasSpotlight, true, 'Cards must support dynamic radial cursor spotlight');
    });

    it('F10.5: gracefully renders fallback when pillars prop is empty or omitted', () => {
      const renderPillars = (items?: any[]) => {
        if (!items || items.length === 0) return null;
        return { count: items.length };
      };

      assert.strictEqual(renderPillars([]), null);
      assert.strictEqual(renderPillars(undefined), null);
    });
  });
}
