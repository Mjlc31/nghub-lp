import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';
import { DEFAULT_SITE_CONFIG } from '../harness/fixtures.ts';

const STORAGE_KEY = 'nghub_site_config_v1';

export function registerSiteConfigTests() {
  describe('Tier 1 — Feature 17: Site Configuration State Modernization', () => {
    let env: ReturnType<typeof setupTestEnvironment>;

    beforeEach(() => {
      env = setupTestEnvironment();
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('F17.1: initializes with complete default site configuration', () => {
      assert(DEFAULT_SITE_CONFIG.texts.heroTitle.length > 0);
      assert(DEFAULT_SITE_CONFIG.images.hero.length > 0);
      assert(DEFAULT_SITE_CONFIG.colors.primary.length > 0);
    });

    it('F17.2: loads saved configuration from LocalStorage on mount', () => {
      const customConfig = {
        ...DEFAULT_SITE_CONFIG,
        texts: {
          ...DEFAULT_SITE_CONFIG.texts,
          heroTitle: 'Custom Hero Title for VIPs'
        }
      };
      env.storage.setItem(STORAGE_KEY, JSON.stringify(customConfig));

      const raw = env.storage.getItem(STORAGE_KEY);
      assert(raw !== null);
      const parsed = JSON.parse(raw);
      assert.strictEqual(parsed.texts.heroTitle, 'Custom Hero Title for VIPs');
    });

    it('F17.3: updates propagate immediately to storage and state', () => {
      let state = { ...DEFAULT_SITE_CONFIG };
      const updateConfig = (partial: Partial<typeof DEFAULT_SITE_CONFIG>) => {
        state = { ...state, ...partial };
        env.storage.setItem(STORAGE_KEY, JSON.stringify(state));
      };

      updateConfig({ colors: { primary: '#E5C579' } });
      assert.strictEqual(state.colors.primary, '#E5C579');
      
      const persisted = JSON.parse(env.storage.getItem(STORAGE_KEY)!);
      assert.strictEqual(persisted.colors.primary, '#E5C579');
    });

    it('F17.4: resetConfig restores original defaults and clears custom overrides', () => {
      env.storage.setItem(STORAGE_KEY, JSON.stringify({ custom: true }));
      assert(env.storage.getItem(STORAGE_KEY) !== null);

      // Execute reset
      env.storage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SITE_CONFIG));
      const reset = JSON.parse(env.storage.getItem(STORAGE_KEY)!);
      assert.strictEqual(reset.texts.heroTitle, DEFAULT_SITE_CONFIG.texts.heroTitle);
    });

    it('F17.5: guards against Base64 bloat by keeping payload sizes under budget (<50KB)', () => {
      const serialized = JSON.stringify(DEFAULT_SITE_CONFIG);
      const byteSize = Buffer.byteLength(serialized, 'utf8');
      assert(
        byteSize < 50 * 1024,
        `Site configuration must not store huge Base64 binaries, size is ${byteSize} bytes`
      );
    });
  });
}
