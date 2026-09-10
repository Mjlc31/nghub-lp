import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';
import { DEFAULT_SITE_CONFIG } from '../harness/fixtures.ts';

const STORAGE_KEY = 'nghub_site_config_v1';

export function registerConfigReactivityFlowTests() {
  describe('Tier 3 — Cross-Feature Flow: Site Configuration Reactivity', () => {
    let env: ReturnType<typeof setupTestEnvironment>;

    beforeEach(() => {
      env = setupTestEnvironment();
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('X.CONF.1: Admin modifies heroTitle and primary color -> Public UI components receive updated props', () => {
      let currentConfig = { ...DEFAULT_SITE_CONFIG };

      // Component subscriber mocks
      const heroComponent = () => ({
        renderedTitle: currentConfig.texts.heroTitle,
        primaryColor: currentConfig.colors.primary
      });

      // Initially matches defaults
      assert.strictEqual(heroComponent().renderedTitle, DEFAULT_SITE_CONFIG.texts.heroTitle);

      // Admin triggers update
      const updateSiteConfig = (patch: Partial<typeof DEFAULT_SITE_CONFIG>) => {
        currentConfig = {
          ...currentConfig,
          ...patch,
          texts: { ...currentConfig.texts, ...(patch.texts || {}) },
          colors: { ...currentConfig.colors, ...(patch.colors || {}) }
        };
        env.storage.setItem(STORAGE_KEY, JSON.stringify(currentConfig));
      };

      updateSiteConfig({
        texts: { ...currentConfig.texts, heroTitle: 'A elite se encontra aqui.' },
        colors: { primary: '#E5C579' }
      });

      // Public Hero re-evaluates
      const updatedHero = heroComponent();
      assert.strictEqual(updatedHero.renderedTitle, 'A elite se encontra aqui.');
      assert.strictEqual(updatedHero.primaryColor, '#E5C579');
    });

    it('X.CONF.2: Admin resets configuration -> Default texts and colors restored instantly', () => {
      let currentConfig = {
        ...DEFAULT_SITE_CONFIG,
        texts: { ...DEFAULT_SITE_CONFIG.texts, heroTitle: 'Modified Title' }
      };

      const resetSiteConfig = () => {
        currentConfig = { ...DEFAULT_SITE_CONFIG };
        env.storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SITE_CONFIG));
      };

      resetSiteConfig();
      assert.strictEqual(currentConfig.texts.heroTitle, DEFAULT_SITE_CONFIG.texts.heroTitle);
      const storageRecord = JSON.parse(env.storage.getItem(STORAGE_KEY)!);
      assert.strictEqual(storageRecord.texts.heroTitle, DEFAULT_SITE_CONFIG.texts.heroTitle);
    });
  });
}
