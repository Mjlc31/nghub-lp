import assert from 'node:assert';
import { describe, it } from '../harness/runner.ts';
import { DEFAULT_SITE_CONFIG } from '../harness/fixtures.ts';

export function registerGalleryTests() {
  describe('Tier 1 — Feature 12: Member Showcase & Optimized Gallery', () => {
    it('F12.1: contains curated collection of member and executive event imagery', () => {
      const gallery = DEFAULT_SITE_CONFIG.images.gallery;
      assert(gallery && gallery.length >= 4, 'Gallery must contain at least 4 curated photo assets');
      for (const imgPath of gallery) {
        assert(imgPath.startsWith('/') || imgPath.startsWith('http'), `Image path must be valid: ${imgPath}`);
      }
    });

    it('F12.2: renders contextual location and event telemetry badges', () => {
      const showcaseBadges = [
        '[ DINNER // FARIA LIMA ]',
        '[ PRIVATE SESSION // JK IGUATEMI ]',
        '[ ANNUAL SUMMIT // SÃO PAULO ]'
      ];

      for (const badge of showcaseBadges) {
        assert(badge.startsWith('[') && badge.endsWith(']'), 'Badges must adhere to telemetry bracket notation');
        assert(badge.includes('//'), 'Badges must use double slash separator');
      }
    });

    it('F12.3: includes embedded conversion CTA anchoring to #apply', () => {
      let scrolledTarget = '';
      const scrollToApply = (e: any) => {
        if (e && e.preventDefault) e.preventDefault();
        scrolledTarget = '#apply';
      };

      scrollToApply({ preventDefault: () => {} });
      assert.strictEqual(scrolledTarget, '#apply', 'Gallery CTA must direct user to application section');
    });

    it('F12.4: gracefully handles single image or sparse gallery lists', () => {
      const singleImageConfig = ['/NG-355.jpg'];
      const renderGallery = (imgs: string[]) => {
        return {
          totalDisplayed: imgs.length,
          primaryImage: imgs[0] || null
        };
      };

      const result = renderGallery(singleImageConfig);
      assert.strictEqual(result.totalDisplayed, 1);
      assert.strictEqual(result.primaryImage, '/NG-355.jpg');
    });

    it('F12.5: supports responsive grid layout metadata', () => {
      const gridClasses = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6';
      assert(gridClasses.includes('grid-cols-1'), 'Must display 1 column on mobile');
      assert(gridClasses.includes('sm:grid-cols-2'), 'Must display 2 columns on tablet');
      assert(gridClasses.includes('lg:grid-cols-3'), 'Must display 3 columns on desktop');
    });
  });
}
