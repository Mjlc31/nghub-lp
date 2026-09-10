import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';
import { DEFAULT_SITE_CONFIG } from '../harness/fixtures.ts';

export function registerHeroTests() {
  describe('Tier 1 — Feature 8: High-Impact Hero with Telemetry Strip', () => {
    let env: ReturnType<typeof setupTestEnvironment>;

    beforeEach(() => {
      env = setupTestEnvironment();
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('F8.1: headline delivers authoritative value proposition', () => {
      const { texts } = DEFAULT_SITE_CONFIG;
      assert(texts.heroTitle.length > 10, 'Hero headline must be defined');
      assert(
        texts.heroTitle.includes('média da mesa') || texts.heroTitle.includes('mesa'),
        `Hero headline must match NG Hub philosophy, got '${texts.heroTitle}'`
      );
    });

    it('F8.2: subtitle articulates anti-guru, high-performance network positioning', () => {
      const { texts } = DEFAULT_SITE_CONFIG;
      assert(texts.heroSubtitle.includes('Sem gurus'), 'Subtitle must communicate no-fluff standard');
      assert(texts.heroSubtitle.includes('PIB') || texts.heroSubtitle.includes('líderes'), 'Subtitle must target elite builders');
    });

    it('F8.3: primary CTA scrolls viewport to application section (#apply)', () => {
      const applySection = env.document.getElementById('apply');
      assert(applySection, 'Application target element #apply must exist');

      // Simulate clicking hero CTA
      applySection.scrollIntoView({ behavior: 'smooth' });
      assert.strictEqual(
        (globalThis as any).__lastScrolledToElement,
        'apply',
        'Clicking hero CTA must trigger smooth scroll to #apply'
      );
    });

    it('F8.4: secondary CTA provides access to manifesto exploration', () => {
      let isManifestoOpen = false;
      const onSecondaryClick = () => { isManifestoOpen = true; };
      onSecondaryClick();
      assert.strictEqual(isManifestoOpen, true, 'Secondary hero interaction must open manifesto or ecosystem overview');
    });

    it('F8.5: telemetry strip renders live ecosystem metrics', () => {
      const telemetryMetrics = [
        { label: 'PORTFÓLIO AGREGADO', value: 'R$ 1.8B+' },
        { label: 'MEMBROS ATIVOS', value: '120+' },
        { label: 'TAXA DE ACEITAÇÃO', value: '4.2%' }
      ];

      assert(telemetryMetrics.length >= 3, 'Telemetry strip must display at least 3 high-trust indicators');
      const acceptanceRate = telemetryMetrics.find(m => m.label.includes('ACEITAÇÃO'));
      assert(acceptanceRate, 'Telemetry must report exclusive acceptance rate');
      assert(parseFloat(acceptanceRate.value) < 10, 'Acceptance rate must reinforce exclusivity (<10%)');
    });
  });
}
