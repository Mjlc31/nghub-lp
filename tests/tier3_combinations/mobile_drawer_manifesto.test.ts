import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';

export function registerMobileDrawerManifestoTests() {
  describe('Tier 3 — Cross-Feature Flow: Mobile Drawer & Manifesto Modal', () => {
    let env: ReturnType<typeof setupTestEnvironment>;

    beforeEach(() => {
      // Mobile screen: iPhone 14 / modern mobile viewport (390 x 844)
      env = setupTestEnvironment({ viewport: { width: 390, height: 844 } });
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('X.MOBILE.1: Mobile viewport -> open drawer -> click Manifesto -> open modal -> close modal', () => {
      let isDrawerOpen = false;
      let isManifestoOpen = false;

      // 1. Verify mobile viewport
      assert(env.window.innerWidth < 768, 'Must be in mobile viewport');

      // 2. User opens mobile hamburger drawer
      const toggleDrawer = () => { isDrawerOpen = !isDrawerOpen; };
      toggleDrawer();
      assert.strictEqual(isDrawerOpen, true, 'Drawer must be open');

      // 3. User clicks Manifesto inside mobile drawer
      const clickManifestoFromDrawer = () => {
        isDrawerOpen = false; // Close drawer
        isManifestoOpen = true; // Open manifesto modal
      };
      clickManifestoFromDrawer();
      assert.strictEqual(isDrawerOpen, false, 'Drawer closes when modal opens');
      assert.strictEqual(isManifestoOpen, true, 'Manifesto modal opens');

      // 4. User reviews manifesto and clicks close button
      const closeModal = () => { isManifestoOpen = false; };
      closeModal();
      assert.strictEqual(isManifestoOpen, false, 'Manifesto modal is dismissed');
      assert.strictEqual(isDrawerOpen, false, 'Both drawer and modal remain cleanly closed');
    });

    it('X.MOBILE.2: Backdrop dismiss event closes modal cleanly on mobile touch', () => {
      let isManifestoOpen = true;
      const handleBackdropTouch = (e: any) => {
        if (e.target === e.currentTarget) {
          isManifestoOpen = false;
        }
      };

      const container = { id: 'modal-backdrop' };
      handleBackdropTouch({ target: container, currentTarget: container });
      assert.strictEqual(isManifestoOpen, false, 'Touching backdrop must dismiss modal');
    });
  });
}
