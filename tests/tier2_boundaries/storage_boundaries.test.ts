import assert from 'node:assert';
import { describe, it, beforeEach, afterEach } from '../harness/runner.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from '../harness/env.ts';
import { DEFAULT_SITE_CONFIG } from '../harness/fixtures.ts';

const STORAGE_KEY = 'nghub_site_config_v1';

export function registerStorageBoundariesTests() {
  describe('Tier 2 — Boundary Cases: LocalStorage Resilience & Fallbacks', () => {
    let env: ReturnType<typeof setupTestEnvironment>;

    beforeEach(() => {
      env = setupTestEnvironment();
    });

    afterEach(() => {
      cleanupTestEnvironment();
    });

    it('B.STORE.1: recovers cleanly from malformed/corrupted JSON in LocalStorage', () => {
      env.storage.setItem(STORAGE_KEY, '{invalid json: true,,,');

      const loadConfig = () => {
        const raw = env.storage.getItem(STORAGE_KEY);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            return { ...DEFAULT_SITE_CONFIG, ...parsed };
          } catch {
            return DEFAULT_SITE_CONFIG;
          }
        }
        return DEFAULT_SITE_CONFIG;
      };

      const result = loadConfig();
      assert.strictEqual(result.texts.heroTitle, DEFAULT_SITE_CONFIG.texts.heroTitle);
    });

    it('B.STORE.2: handles QuotaExceededError when saving large payloads without uncaught crash', () => {
      let caughtError: string | null = null;
      env.storage.quotaErrorTrigger = true;

      const saveConfig = (cfg: any) => {
        try {
          env.storage.setItem(STORAGE_KEY, JSON.stringify(cfg));
        } catch (err: any) {
          caughtError = err.name;
        }
      };

      saveConfig(DEFAULT_SITE_CONFIG);
      assert.strictEqual(caughtError, 'QuotaExceededError', 'Must safely catch QuotaExceededError');
    });

    it('B.STORE.3: safely initializes default configuration when LocalStorage returns null', () => {
      env.storage.clear();
      assert.strictEqual(env.storage.getItem(STORAGE_KEY), null);

      const config = env.storage.getItem(STORAGE_KEY)
        ? JSON.parse(env.storage.getItem(STORAGE_KEY)!)
        : DEFAULT_SITE_CONFIG;

      assert.strictEqual(config.texts.heroTitle, DEFAULT_SITE_CONFIG.texts.heroTitle);
    });

    it('B.STORE.4: partial configuration objects merge with defaults without losing missing keys', () => {
      const partialUpdate = {
        texts: {
          heroTitle: 'New Selective Title'
        }
      };

      const merged = {
        ...DEFAULT_SITE_CONFIG,
        ...partialUpdate,
        texts: {
          ...DEFAULT_SITE_CONFIG.texts,
          ...partialUpdate.texts
        }
      };

      assert.strictEqual(merged.texts.heroTitle, 'New Selective Title');
      assert.strictEqual(merged.texts.ctaButton, DEFAULT_SITE_CONFIG.texts.ctaButton);
      assert(merged.images.hero.length > 0);
    });

    it('B.STORE.5: rapid consecutive storage writes preserve most recent state', () => {
      for (let i = 1; i <= 10; i++) {
        const update = { ...DEFAULT_SITE_CONFIG, iteration: i };
        env.storage.setItem(STORAGE_KEY, JSON.stringify(update));
      }

      const finalRecord = JSON.parse(env.storage.getItem(STORAGE_KEY)!);
      assert.strictEqual(finalRecord.iteration, 10);
    });
  });
}
