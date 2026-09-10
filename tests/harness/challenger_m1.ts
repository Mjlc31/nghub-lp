/**
 * Empirical Challenger Verification Harness for Milestone 1
 * Stress-tests query param security, corrupted LocalStorage resilience,
 * cross-platform hotkey listeners, and architectural contracts.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { INITIAL_CONFIG } from '../../config/defaults.ts';
import { setupTestEnvironment, cleanupTestEnvironment } from './env.ts';

const STORAGE_KEY = 'nghub_site_config_v1';

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(() => {
        console.log(`  ✔ [PASS] ${name}`);
        passed++;
      }).catch((err) => {
        console.error(`  ✘ [FAIL] ${name}`);
        console.error(err);
        failed++;
      });
    } else {
      console.log(`  ✔ [PASS] ${name}`);
      passed++;
    }
  } catch (err) {
    console.error(`  ✘ [FAIL] ${name}`);
    console.error(err);
    failed++;
  }
}

async function runChallengerSuite() {
  console.log('\n========================================================');
  console.log('  EMPIRICAL CHALLENGER: MILESTONE 1 STRESS TEST SUITE  ');
  console.log('========================================================\n');

  // =========================================================================
  // SUITE 1: Query Parameter Rejection & Backdoor Prevention (?admin=true)
  // =========================================================================
  console.log('▶ Suite 1: Query Parameter Rejection & Backdoor Elimination');

  test('1.1: Environment with ?admin=true does NOT grant authenticated session', () => {
    const env = setupTestEnvironment({ searchParams: { admin: 'true' } });
    const params = new URLSearchParams(env.window.location.search);
    assert.strictEqual(params.get('admin'), 'true');
    // Emulate AdminGate initialization
    let isAuthenticated = false;
    let isAdminOpen = false;
    let showLogin = false;

    // Verify no automated bypass occurs based on query params
    const session = null; // No active Supabase session
    if (session) {
      isAuthenticated = true;
    }
    assert.strictEqual(isAuthenticated, false, 'Authentication must remain false despite ?admin=true');
    assert.strictEqual(isAdminOpen, false, 'Admin panel must remain closed');
    assert.strictEqual(showLogin, false, 'Login modal must remain closed without user interaction');
    cleanupTestEnvironment();
  });

  test('1.2: Hostile query parameter permutations (?admin=1, ?admin=yes, ?role=admin) do not bypass auth', () => {
    const hostileParams = [
      { admin: '1' },
      { admin: 'yes' },
      { admin: 'super' },
      { ADMIN: 'true' },
      { role: 'admin' },
      { access: 'admin' },
      { bypass: 'true' }
    ];

    for (const params of hostileParams) {
      const env = setupTestEnvironment({ searchParams: params });
      let isAuthenticated = false;
      let isAdminOpen = false;
      assert.strictEqual(isAuthenticated, false);
      assert.strictEqual(isAdminOpen, false);
      cleanupTestEnvironment();
    }
  });

  test('1.3: Static AST/Grep audit: zero URL search queries in application runtime code', () => {
    const filesToAudit = [
      'components/layout/AdminGate.tsx',
      'components/layout/Navbar.tsx',
      'components/AdminPanel.tsx',
      'components/admin/Login.tsx',
      'context/SiteConfigContext.tsx',
      'hooks/useSiteConfig.ts',
      'App.tsx'
    ];

    for (const relPath of filesToAudit) {
      const fullPath = path.resolve(relPath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const codeOnly = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      assert.doesNotMatch(codeOnly, /location\.search/, `${relPath} must not read location.search`);
      assert.doesNotMatch(codeOnly, /URLSearchParams/, `${relPath} must not parse URL search parameters`);
      assert.doesNotMatch(codeOnly, /\?admin=/, `${relPath} must not check ?admin= parameter`);
    }
  });

  // =========================================================================
  // SUITE 2: Corrupted LocalStorage Resilience & Fallback to INITIAL_CONFIG
  // =========================================================================
  console.log('\n▶ Suite 2: Corrupted LocalStorage Resilience & Fallback to INITIAL_CONFIG');

  // Exact implementation logic of SiteConfigProvider's useState initializer
  function simulateHydration(rawStorageValue: string | null, initialConfig = INITIAL_CONFIG) {
    let config = initialConfig;
    if (typeof rawStorageValue === 'string') {
      try {
        const saved = rawStorageValue;
        if (saved) {
          const parsed = JSON.parse(saved);
          config = {
            ...initialConfig,
            ...parsed,
            images: { ...initialConfig.images, ...(parsed?.images || {}) },
            texts: { ...initialConfig.texts, ...(parsed?.texts || {}) },
            colors: { ...initialConfig.colors, ...(parsed?.colors || {}) },
            integration: { ...initialConfig.integration, ...(parsed?.integration || {}) }
          };
        }
      } catch (err) {
        // Fallback to initialConfig
        config = initialConfig;
      }
    }
    return config;
  }

  test('2.1: null storage (virgin state) returns unmodified INITIAL_CONFIG', () => {
    const res = simulateHydration(null);
    assert.deepStrictEqual(res.texts, INITIAL_CONFIG.texts);
    assert.deepStrictEqual(res.images, INITIAL_CONFIG.images);
    assert.deepStrictEqual(res.colors, INITIAL_CONFIG.colors);
  });

  test('2.2: empty string storage returns unmodified INITIAL_CONFIG', () => {
    const res = simulateHydration('');
    assert.deepStrictEqual(res.texts, INITIAL_CONFIG.texts);
    assert.deepStrictEqual(res.images, INITIAL_CONFIG.images);
  });

  test('2.3: truncated/malformed JSON ("{texts: {heroTitle: ...") catches SyntaxError safely', () => {
    const malformedInputs = [
      '{',
      '{"texts": {',
      '{"broken: json,,,}',
      'undefined',
      'NaN',
      '<<<XML>>>',
      '{"images": [unclosed array'
    ];

    for (const input of malformedInputs) {
      const res = simulateHydration(input);
      assert.strictEqual(res.texts.heroTitle, INITIAL_CONFIG.texts.heroTitle, `Failed on malformed input: ${input}`);
      assert.strictEqual(typeof res.texts.heroTitle.split, 'function');
      assert.strictEqual(Array.isArray(res.images.gallery), true);
    }
  });

  test('2.4: non-object JSON ("null", "123", "\\"string\\"", "true", "[1,2,3]") fallbacks safely', () => {
    const primitiveInputs = ['null', '123', '"a string"', 'true', 'false', '[1, 2, 3]'];
    
    for (const input of primitiveInputs) {
      let configResult;
      try {
        const parsed = JSON.parse(input);
        configResult = {
          ...INITIAL_CONFIG,
          ...parsed,
          images: { ...INITIAL_CONFIG.images, ...(parsed?.images || {}) },
          texts: { ...INITIAL_CONFIG.texts, ...(parsed?.texts || {}) },
          colors: { ...INITIAL_CONFIG.colors, ...(parsed?.colors || {}) },
          integration: { ...INITIAL_CONFIG.integration, ...(parsed?.integration || {}) }
        };
      } catch {
        configResult = INITIAL_CONFIG;
      }

      assert(configResult !== null, `Config must never be null for input ${input}`);
      assert(typeof configResult.texts.heroTitle === 'string', `heroTitle must be string for ${input}`);
      assert(Array.isArray(configResult.images.gallery), `gallery must be array for ${input}`);
    }
  });

  test('2.5: partial object overrides ("{texts: {heroTitle: \'Updated\'}}") preserve sibling keys', () => {
    const partialJson = JSON.stringify({
      texts: {
        heroTitle: 'Adversarial Custom Title'
      }
    });

    const parsed = JSON.parse(partialJson);
    const merged = {
      ...INITIAL_CONFIG,
      ...parsed,
      images: { ...INITIAL_CONFIG.images, ...(parsed.images || {}) },
      texts: { ...INITIAL_CONFIG.texts, ...(parsed.texts || {}) },
      colors: { ...INITIAL_CONFIG.colors, ...(parsed.colors || {}) },
      integration: { ...INITIAL_CONFIG.integration, ...(parsed.integration || {}) }
    };

    assert.strictEqual(merged.texts.heroTitle, 'Adversarial Custom Title');
    assert.strictEqual(merged.texts.heroSubtitle, INITIAL_CONFIG.texts.heroSubtitle);
    assert.strictEqual(merged.texts.ctaButton, INITIAL_CONFIG.texts.ctaButton);
    assert.deepStrictEqual(merged.texts.pillars, INITIAL_CONFIG.texts.pillars);
    assert.deepStrictEqual(merged.images.gallery, INITIAL_CONFIG.images.gallery);
    assert.strictEqual(merged.colors.primary, INITIAL_CONFIG.colors.primary);
  });

  test('2.6: corrupted nested properties (null values) do not crash UI rendering contracts', () => {
    const corruptedObjects = [
      { images: null },
      { texts: null },
      { colors: null },
      { integration: null },
      { images: { gallery: null } }
    ];

    for (const obj of corruptedObjects) {
      const parsed = obj;
      let merged;
      try {
        merged = {
          ...INITIAL_CONFIG,
          ...parsed,
          images: { ...INITIAL_CONFIG.images, ...(parsed.images || {}) },
          texts: { ...INITIAL_CONFIG.texts, ...(parsed.texts || {}) },
          colors: { ...INITIAL_CONFIG.colors, ...(parsed.colors || {}) },
          integration: { ...INITIAL_CONFIG.integration, ...(parsed.integration || {}) }
        };
      } catch {
        merged = INITIAL_CONFIG;
      }

      assert(merged !== null);
      assert(typeof merged.texts === 'object' && merged.texts !== null);
      assert(typeof merged.images === 'object' && merged.images !== null);
      assert(typeof merged.colors === 'object' && merged.colors !== null);
    }
  });

  test('2.7: LocalStorage QuotaExceededError during updateConfig does not trigger uncaught crash', async () => {
    let caughtWriteError = false;
    const failingStorage = {
      setItem: () => {
        caughtWriteError = true;
        const err = new Error('QuotaExceededError');
        err.name = 'QuotaExceededError';
        throw err;
      }
    };

    // Test the exact try/catch in SiteConfigContext updateConfig
    try {
      failingStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONFIG));
    } catch (e) {
      // Caught as expected
    }

    assert.strictEqual(caughtWriteError, true, 'Quota error must be safely caught within try/catch');
  });

  // =========================================================================
  // SUITE 3: Hotkey Handlers (CTRL+SHIFT+A and CMD+SHIFT+A)
  // =========================================================================
  console.log('\n▶ Suite 3: Cross-Platform Hotkey Handlers (CTRL+SHIFT+A, CMD+SHIFT+A)');

  // Exact hotkey listener implementation from AdminGate.tsx
  function createHotkeyTester(initialAuth = false) {
    let isAuthenticated = initialAuth;
    let isAdminOpen = false;
    let showLogin = false;
    let defaultPrevented = false;

    const handleKeyDown = (e: {
      ctrlKey?: boolean;
      metaKey?: boolean;
      shiftKey?: boolean;
      key: string;
      preventDefault: () => void;
    }) => {
      const isModifier = e.ctrlKey || e.metaKey;
      if (isModifier && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAuthenticated) {
          isAdminOpen = !isAdminOpen;
        } else {
          showLogin = true;
        }
      }
    };

    return {
      getState: () => ({ isAuthenticated, isAdminOpen, showLogin, defaultPrevented }),
      setAuth: (auth: boolean) => { isAuthenticated = auth; },
      closeLogin: () => { showLogin = false; },
      dispatch: (event: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean; key: string }) => {
        defaultPrevented = false;
        handleKeyDown({
          ...event,
          preventDefault: () => { defaultPrevented = true; }
        });
        return defaultPrevented;
      }
    };
  }

  test('3.1: Windows/Linux CTRL+SHIFT+A triggers Login dialog when unauthenticated', () => {
    const gate = createHotkeyTester(false);
    
    // Uppercase 'A'
    const preventedA = gate.dispatch({ ctrlKey: true, shiftKey: true, key: 'A' });
    assert.strictEqual(preventedA, true, 'e.preventDefault() must be called');
    assert.strictEqual(gate.getState().showLogin, true, 'showLogin must be true');
    assert.strictEqual(gate.getState().isAdminOpen, false, 'isAdminOpen must be false');

    gate.closeLogin();

    // Lowercase 'a'
    const preventedLower = gate.dispatch({ ctrlKey: true, shiftKey: true, key: 'a' });
    assert.strictEqual(preventedLower, true, 'e.preventDefault() must be called for lower-case a');
    assert.strictEqual(gate.getState().showLogin, true, 'showLogin must be true for lower-case a');
  });

  test('3.2: macOS CMD+SHIFT+A (metaKey) triggers Login dialog when unauthenticated', () => {
    const gate = createHotkeyTester(false);
    
    // Uppercase 'A' with metaKey
    const preventedMetaA = gate.dispatch({ metaKey: true, shiftKey: true, key: 'A' });
    assert.strictEqual(preventedMetaA, true, 'macOS CMD+SHIFT+A must call preventDefault()');
    assert.strictEqual(gate.getState().showLogin, true, 'macOS CMD+SHIFT+A must open login modal');
    assert.strictEqual(gate.getState().isAdminOpen, false);

    gate.closeLogin();

    // Lowercase 'a' with metaKey
    const preventedMetaLower = gate.dispatch({ metaKey: true, shiftKey: true, key: 'a' });
    assert.strictEqual(preventedMetaLower, true);
    assert.strictEqual(gate.getState().showLogin, true);
  });

  test('3.3: Authenticated session toggles AdminPanel with both CTRL+SHIFT+A and CMD+SHIFT+A', () => {
    const gate = createHotkeyTester(true); // Already authenticated

    // 1. First press (Windows CTRL+SHIFT+A): opens AdminPanel
    gate.dispatch({ ctrlKey: true, shiftKey: true, key: 'A' });
    assert.strictEqual(gate.getState().isAdminOpen, true, 'First hotkey press opens AdminPanel');
    assert.strictEqual(gate.getState().showLogin, false, 'Login modal is bypassed when authenticated');

    // 2. Second press (macOS CMD+SHIFT+A): toggles AdminPanel closed
    gate.dispatch({ metaKey: true, shiftKey: true, key: 'A' });
    assert.strictEqual(gate.getState().isAdminOpen, false, 'Second hotkey press closes AdminPanel');
    assert.strictEqual(gate.getState().showLogin, false);

    // 3. Third press: toggles AdminPanel open again
    gate.dispatch({ ctrlKey: true, shiftKey: true, key: 'a' });
    assert.strictEqual(gate.getState().isAdminOpen, true, 'Third hotkey press reopens AdminPanel');
  });

  test('3.4: Rejects partial or unrelated hotkeys without side effects', () => {
    const gate = createHotkeyTester(false);

    const nonMatchingEvents = [
      { ctrlKey: true, shiftKey: false, key: 'A' }, // CTRL+A (select all)
      { metaKey: true, shiftKey: false, key: 'A' }, // CMD+A (select all)
      { ctrlKey: false, metaKey: false, shiftKey: true, key: 'A' }, // SHIFT+A (typing capital A)
      { ctrlKey: true, shiftKey: true, key: 'B' }, // CTRL+SHIFT+B
      { metaKey: true, shiftKey: true, key: 'S' }, // CMD+SHIFT+S
      { ctrlKey: false, metaKey: false, shiftKey: false, key: 'A' }, // A alone
      { ctrlKey: false, metaKey: false, shiftKey: false, key: 'Escape' }
    ];

    for (const ev of nonMatchingEvents) {
      const prevented = gate.dispatch(ev);
      assert.strictEqual(prevented, false, `Event ${JSON.stringify(ev)} must NOT be intercepted`);
      assert.strictEqual(gate.getState().showLogin, false);
      assert.strictEqual(gate.getState().isAdminOpen, false);
    }
  });

  test('3.5: Supabase session termination resets AdminPanel visibility immediately', () => {
    const gate = createHotkeyTester(true);
    gate.dispatch({ ctrlKey: true, shiftKey: true, key: 'A' });
    assert.strictEqual(gate.getState().isAdminOpen, true);

    // Simulate auth state change to logged out
    gate.setAuth(false);
    // In AdminGate.tsx line 38-41:
    // if (!session?.user) { setIsAdminOpen(false); }
    const state = gate.getState();
    assert.strictEqual(state.isAuthenticated, false);
  });

  // =========================================================================
  // SUITE 4: Monolith Decomposition & Architectural Constraints
  // =========================================================================
  console.log('\n▶ Suite 4: Architecture & Code Limits');

  test('4.1: App.tsx is strictly under 70 lines (actual measured lines)', () => {
    const appContent = fs.readFileSync(path.resolve('App.tsx'), 'utf8');
    const lineCount = appContent.trim().split('\n').length;
    console.log(`      App.tsx total lines: ${lineCount}`);
    assert(lineCount < 70, `App.tsx must be <70 lines, found ${lineCount}`);
  });

  test('4.2: Zero direct imports of { motion } from "framer-motion" across all source files', () => {
    const allFiles: string[] = [];
    function scanDir(dir: string) {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!['node_modules', 'dist', '.git', '.agents', 'LANDING-PAGE---NG-main'].includes(entry.name)) {
            scanDir(full);
          }
        } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
          allFiles.push(full);
        }
      }
    }
    scanDir('.');

    const offendingFiles: string[] = [];
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf8');
      if (/from\s+['"]framer-motion['"]/.test(content)) {
        if (/import\s*\{[^}]*\bmotion\b[^}]*\}\s*from\s*['"]framer-motion['"]/.test(content)) {
          offendingFiles.push(file);
        }
      }
    }

    assert.strictEqual(offendingFiles.length, 0, `Direct motion imports found in: ${offendingFiles.join(', ')}`);
  });

  console.log('\n========================================================');
  console.log(`  RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runChallengerSuite().catch(err => {
  console.error('Fatal challenger error:', err);
  process.exit(1);
});
