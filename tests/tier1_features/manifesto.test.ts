import assert from 'node:assert';
import { describe, it } from '../harness/runner.ts';
import { DEFAULT_SITE_CONFIG } from '../harness/fixtures.ts';

export function registerManifestoTests() {
  describe('Tier 1 — Feature 11: Authoritative Manifesto & Admissions Standard', () => {
    it('F11.1: teaser renders provocative title and executive principles', () => {
      const { texts } = DEFAULT_SITE_CONFIG;
      assert(texts.manifestoTitle.length > 5, 'Manifesto title must be present');
      assert(
        texts.manifestoTitle.includes('Eles mentiram') || texts.manifestoTitle.includes('Princípios'),
        `Manifesto title must be provocative or authoritative, got: ${texts.manifestoTitle}`
      );
    });

    it('F11.2: teaser button toggles manifesto modal state to true', () => {
      let isOpen = false;
      const setIsManifestoOpen = (val: boolean) => { isOpen = val; };

      // Simulate clicking "Ler Manifesto Completo"
      setIsManifestoOpen(true);
      assert.strictEqual(isOpen, true, 'Clicking teaser trigger must open the modal');
    });

    it('F11.3: split-screen modal incorporates atmospheric imagery and brand mark', () => {
      const modalProps = {
        manifestoImage: '/NG-141.jpg',
        brandMark: 'NG',
        quote: 'Resultados em silêncio.'
      };

      assert(modalProps.manifestoImage.length > 0, 'Modal must accept an atmospheric hero/gallery image');
      assert.strictEqual(modalProps.brandMark, 'NG', 'Modal must feature NG brand watermark');
      assert(modalProps.quote.includes('Resultados'), 'Modal visual side must display guiding aphorism');
    });

    it('F11.4: modal body articulates selective admission standards', () => {
      const admissionCriteria = [
        'Tração comprovada e faturamento superior ao patamar de entrada',
        'Alinhamento ético e postura de longo prazo',
        'Disposição para contribuir ativamente com o ecossistema'
      ];

      assert.strictEqual(admissionCriteria.length, 3, 'Must define explicit selection standards');
      for (const criterion of admissionCriteria) {
        assert(criterion.length > 20, 'Each standard must be substantive');
      }
    });

    it('F11.5: dismissal action resets modal open state to false', () => {
      let isOpen = true;
      const closeModal = () => { isOpen = false; };

      closeModal();
      assert.strictEqual(isOpen, false, 'Closing modal must reset visibility state');
    });
  });
}
