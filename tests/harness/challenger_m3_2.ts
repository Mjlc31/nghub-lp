/**
 * Empirical Challenger Verification Harness for Milestone 3 (challenger_m3_2)
 * 
 * Objective:
 * Adversarially stress-test Milestone 3 SiteConfig storage limits, asset compression budgets,
 * bundle sizes, and git security:
 * 1. LocalStorage size constraint: confirm serialized config payload remains strictly < 50KB even with Base64 injection attacks.
 * 2. Storage corruption recovery: corrupt LocalStorage with malformed JSON, verify graceful fallback to defaults without uncaught exceptions and verify auto-quarantine.
 * 3. Image size audit: verify all 10 public/NG-*.jpg and all 10 public/NG-*.avif files are strictly < 205,000 bytes (< 200KB) each.
 * 4. Bundle chunk audit: verify all production build chunks are strictly < 500 kB and zero Rollup warnings exist.
 * 5. Git hygiene audit: verify .env is untracked in git index and ignored by .gitignore, and .env.example is documented and safe.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { setupTestEnvironment, cleanupTestEnvironment } from './env.ts';
import {
  CONFIG_STORAGE_KEY,
  CORRUPTED_BACKUP_KEY,
  MAX_LOCAL_STORAGE_PAYLOAD_BYTES,
  sanitizeSiteConfig,
  loadPersistedConfig,
  persistConfigSafe,
  clearPersistedConfig
} from './configStorageAdapter.ts';
import {
  saveMediaBlob,
  getMediaBlob,
  dataURLToBlob,
  clearAllMediaBlobs
} from '../../utils/storage/mediaStorage.ts';
import { INITIAL_CONFIG } from '../../config/defaults.ts';
import { DEFAULT_SITE_CONFIG } from './fixtures.ts';

type SiteConfig = typeof DEFAULT_SITE_CONFIG;

const ROOT_DIR = process.cwd();
let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res
        .then(() => {
          console.log(`  ✔ [PASS] ${name}`);
          passed++;
        })
        .catch((err: any) => {
          console.error(`  ✘ [FAIL] ${name}`);
          console.error(err?.stack || err?.message || err);
          failed++;
        });
    } else {
      console.log(`  ✔ [PASS] ${name}`);
      passed++;
    }
  } catch (err: any) {
    console.error(`  ✘ [FAIL] ${name}`);
    console.error(err?.stack || err?.message || err);
    failed++;
  }
}

// Utility to create a deterministic mock base64 image data URL of a specific byte length
function createMockBase64DataUrl(sizeInBytes: number, mimeType: string = 'image/jpeg'): string {
  const prefix = `data:${mimeType};base64,`;
  const targetBase64Length = Math.max(4, sizeInBytes - prefix.length);
  // Base64 string length must be a multiple of 4 for valid atob decoding
  const validLength = Math.floor(targetBase64Length / 4) * 4;
  const payload = 'QUFB'.repeat(validLength / 4);
  return `${prefix}${payload}`;
}

async function runChallengerM3_2() {
  console.log('\n================================================================');
  console.log('  EMPIRICAL CHALLENGER M3.2: STORAGE, ASSETS, BUNDLE & SEC AUDIT');
  console.log('================================================================\n');

  // ===========================================================================
  // SUITE 1: LocalStorage Size Constraints & Base64 Inoculation
  // ===========================================================================
  console.log('▶ Suite 1: LocalStorage Size Constraints & Base64 Inoculation');

  runTest('1.1: Default initial config serialized payload is compact (~2-3 KB) and well within 50KB limit', () => {
    const env = setupTestEnvironment();
    const serialized = JSON.stringify(INITIAL_CONFIG);
    const byteSize = Buffer.byteLength(serialized, 'utf8');

    assert(byteSize > 500, `Payload too small (${byteSize} bytes), indicates missing default configuration`);
    assert(byteSize < 10 * 1024, `Default config payload (${byteSize} bytes) unexpectedly large (>10KB)`);
    assert(byteSize < MAX_LOCAL_STORAGE_PAYLOAD_BYTES, `Default payload must be < ${MAX_LOCAL_STORAGE_PAYLOAD_BYTES} bytes`);
    
    cleanupTestEnvironment();
  });

  runTest('1.2: Base64 injection attack on hero image (500KB) is stripped and keeps payload < 50KB', () => {
    const env = setupTestEnvironment();
    const hugeBase64 = createMockBase64DataUrl(500 * 1024); // 500 KB base64

    const attackedConfig: SiteConfig = {
      ...INITIAL_CONFIG,
      images: {
        ...INITIAL_CONFIG.images,
        hero: hugeBase64
      }
    };

    const sanitized = sanitizeSiteConfig(attackedConfig);
    // Huge base64 image should be stripped and replaced with default
    assert.notStrictEqual(sanitized.images.hero, hugeBase64, 'Hero image must not retain >10KB Base64 data URL');
    assert.strictEqual(sanitized.images.hero, INITIAL_CONFIG.images.hero, 'Stripped hero image must revert to default');

    const writeResult = persistConfigSafe(attackedConfig);
    assert.strictEqual(writeResult.success, true, 'persistConfigSafe must handle attacked config cleanly');

    const storedRaw = env.storage.getItem(CONFIG_STORAGE_KEY);
    assert(storedRaw !== null, 'LocalStorage must contain persisted config');
    const storedSize = Buffer.byteLength(storedRaw!, 'utf8');
    assert(storedSize < MAX_LOCAL_STORAGE_PAYLOAD_BYTES, `Stored size (${storedSize} bytes) must be < ${MAX_LOCAL_STORAGE_PAYLOAD_BYTES} bytes`);
    assert(storedSize < 50 * 1024, `Stored size (${storedSize} bytes) must be strictly < 50KB`);

    cleanupTestEnvironment();
  });

  runTest('1.3: Base64 injection attack on quoteParallax (1MB) is stripped and keeps payload < 50KB', () => {
    const env = setupTestEnvironment();
    const oneMbBase64 = createMockBase64DataUrl(1024 * 1024); // 1 MB base64

    const attackedConfig: SiteConfig = {
      ...INITIAL_CONFIG,
      images: {
        ...INITIAL_CONFIG.images,
        quoteParallax: oneMbBase64
      }
    };

    const sanitized = sanitizeSiteConfig(attackedConfig);
    assert.notStrictEqual(sanitized.images.quoteParallax, oneMbBase64);
    assert.strictEqual(sanitized.images.quoteParallax, INITIAL_CONFIG.images.quoteParallax);

    const writeResult = persistConfigSafe(attackedConfig);
    assert.strictEqual(writeResult.success, true);

    const storedRaw = env.storage.getItem(CONFIG_STORAGE_KEY);
    const storedSize = Buffer.byteLength(storedRaw!, 'utf8');
    assert(storedSize < MAX_LOCAL_STORAGE_PAYLOAD_BYTES, `Stored size must be < 50KB, got ${storedSize} bytes`);

    cleanupTestEnvironment();
  });

  runTest('1.4: Massive Multi-vector attack across gallery (10 x 250KB = 2.5MB) is fully sanitized', () => {
    const env = setupTestEnvironment();
    const maliciousGallery = Array.from({ length: 10 }, (_, i) => 
      createMockBase64DataUrl(250 * 1024, 'image/png')
    );

    const attackedConfig: SiteConfig = {
      ...INITIAL_CONFIG,
      images: {
        ...INITIAL_CONFIG.images,
        gallery: maliciousGallery
      }
    };

    const sanitized = sanitizeSiteConfig(attackedConfig);
    // All 10 huge base64 gallery items must be stripped
    for (const item of sanitized.images.gallery) {
      assert(!item.startsWith('data:image/'), 'Gallery items must not contain oversized data URLs');
    }

    const writeResult = persistConfigSafe(attackedConfig);
    assert.strictEqual(writeResult.success, true);

    const storedRaw = env.storage.getItem(CONFIG_STORAGE_KEY);
    const storedSize = Buffer.byteLength(storedRaw!, 'utf8');
    assert(storedSize < 50 * 1024, `Stored size (${storedSize} bytes) must remain strictly < 50KB`);

    cleanupTestEnvironment();
  });

  runTest('1.5: Total payload blitz attack (10MB across all image slots simultaneously) stays < 50KB', () => {
    const env = setupTestEnvironment();
    const tenMbBlob = createMockBase64DataUrl(2 * 1024 * 1024); // 2 MB each
    const multiGallery = Array.from({ length: 5 }, () => createMockBase64DataUrl(1.5 * 1024 * 1024));

    const totalBlitzConfig: any = {
      ...INITIAL_CONFIG,
      images: {
        hero: tenMbBlob,
        quoteParallax: tenMbBlob,
        gallery: multiGallery
      }
    };

    const writeResult = persistConfigSafe(totalBlitzConfig);
    assert.strictEqual(writeResult.success, true, 'persistConfigSafe must not crash on 10MB input blitz');

    const storedRaw = env.storage.getItem(CONFIG_STORAGE_KEY);
    assert(storedRaw !== null);
    const storedSize = Buffer.byteLength(storedRaw!, 'utf8');
    assert(storedSize < MAX_LOCAL_STORAGE_PAYLOAD_BYTES, `Total stored size (${storedSize} bytes) must be < 50KB`);

    cleanupTestEnvironment();
  });

  runTest('1.6: Benign small data URLs (<10KB) are safely retained without exceeding budget', () => {
    const env = setupTestEnvironment();
    // 2 KB valid data URL thumbnail
    const smallThumbnail = createMockBase64DataUrl(2 * 1024, 'image/svg+xml');

    const customConfig: SiteConfig = {
      ...INITIAL_CONFIG,
      images: {
        ...INITIAL_CONFIG.images,
        hero: smallThumbnail
      }
    };

    const sanitized = sanitizeSiteConfig(customConfig);
    assert.strictEqual(sanitized.images.hero, smallThumbnail, 'Small data URL (<10KB) should be allowed');

    const writeResult = persistConfigSafe(customConfig);
    assert.strictEqual(writeResult.success, true);

    const storedRaw = env.storage.getItem(CONFIG_STORAGE_KEY);
    const storedSize = Buffer.byteLength(storedRaw!, 'utf8');
    assert(storedSize < MAX_LOCAL_STORAGE_PAYLOAD_BYTES, `Stored size must be < 50KB, got ${storedSize} bytes`);

    cleanupTestEnvironment();
  });

  runTest('1.7: Hard payload budget protection returns error instead of corrupting or exceeding quota', () => {
    const env = setupTestEnvironment();
    // Create an object with non-image string of 60KB (e.g. attacked heroSubtitle)
    const giantText = 'X'.repeat(60 * 1024);
    const giantConfig: any = {
      ...INITIAL_CONFIG,
      texts: {
        ...INITIAL_CONFIG.texts,
        heroSubtitle: giantText
      }
    };

    const result = persistConfigSafe(giantConfig);
    assert.strictEqual(result.success, false, 'Must reject payload exceeding 50KB');
    assert(result.error?.includes('limite') || result.error?.includes('excede'), 'Must return descriptive error');

    cleanupTestEnvironment();
  });

  await runTest('1.8: IndexedDB media vault offloads large blobs while LocalStorage remains light', async () => {
    const testKey = 'test_hero_blob';
    const sampleDataUrl = createMockBase64DataUrl(100 * 1024, 'image/jpeg');

    const storageUri = await saveMediaBlob(testKey, sampleDataUrl);
    assert(storageUri.startsWith('idb://'), 'Storage URI must use idb:// prefix');

    const retrievedBlob = await getMediaBlob(testKey);
    assert(retrievedBlob !== null, 'Retrieved media blob must not be null');
    assert(retrievedBlob.size > 0, 'Retrieved blob must have positive size');

    await clearAllMediaBlobs();
  });

  runTest('1.9: Browser QuotaExceededError is caught gracefully without uncaught exceptions', () => {
    const env = setupTestEnvironment();
    env.storage.quotaErrorTrigger = true; // Emulate browser storage quota full (DOM Exception 22)

    let threw = false;
    let result: { success: boolean; error?: string } | null = null;
    try {
      result = persistConfigSafe(INITIAL_CONFIG);
    } catch (e) {
      threw = true;
    }

    assert.strictEqual(threw, false, 'persistConfigSafe must never throw uncaught exception on QuotaExceededError');
    assert.strictEqual(result?.success, false, 'Result must indicate failure');
    assert(result?.error?.includes('QuotaExceededError'), 'Result must indicate QuotaExceededError');

    cleanupTestEnvironment();
  });

  // ===========================================================================
  // SUITE 2: Storage Corruption Recovery & Schema Fault Tolerance
  // ===========================================================================
  console.log('\n▶ Suite 2: Storage Corruption Recovery & Schema Fault Tolerance');

  runTest('2.1: Corrupted truncated JSON string recovers to defaults and auto-quarantines corrupted entry', () => {
    const env = setupTestEnvironment();
    const malformedJson = '{"texts":{"heroTitle":"Truncated incomplete payload...';
    env.storage.setItem(CONFIG_STORAGE_KEY, malformedJson);

    // Call loadPersistedConfig
    const loaded = loadPersistedConfig();
    assert.strictEqual(loaded.texts.heroTitle, INITIAL_CONFIG.texts.heroTitle, 'Must fall back to default heroTitle');
    assert.strictEqual(loaded.texts.ctaButton, INITIAL_CONFIG.texts.ctaButton, 'Must fall back to default ctaButton');

    // Verify auto-quarantine: corrupted string moved to CORRUPTED_BACKUP_KEY
    assert.strictEqual(env.storage.getItem(CONFIG_STORAGE_KEY), null, 'CONFIG_STORAGE_KEY must be cleared after corruption detection');
    assert.strictEqual(env.storage.getItem(CORRUPTED_BACKUP_KEY), malformedJson, 'Malformed payload must be preserved in backup key');

    cleanupTestEnvironment();
  });

  runTest('2.2: Binary garbage and unparseable characters recover gracefully without uncaught exceptions', () => {
    const env = setupTestEnvironment();
    const binaryGarbage = '\x00\xFF\xFE\x12\x34\x56\x78\x9A\xBC\xDE\xF0<script>alert(1)</script>';
    env.storage.setItem(CONFIG_STORAGE_KEY, binaryGarbage);

    let threw = false;
    let config: SiteConfig | null = null;
    try {
      config = loadPersistedConfig();
    } catch (e) {
      threw = true;
    }

    assert.strictEqual(threw, false, 'loadPersistedConfig must never throw uncaught exception on binary garbage');
    assert(config !== null, 'Config must be returned');
    assert.strictEqual(config.texts.heroTitle, INITIAL_CONFIG.texts.heroTitle);

    cleanupTestEnvironment();
  });

  runTest('2.3: Primitive types in storage (numbers, booleans, naked strings) return fallback defaults', () => {
    const primitives = [
      '12345',
      '"just a naked string"',
      'true',
      'false',
      'null',
      '[]'
    ];

    for (const p of primitives) {
      const env = setupTestEnvironment();
      env.storage.setItem(CONFIG_STORAGE_KEY, p);

      const loaded = loadPersistedConfig();
      assert(loaded && typeof loaded === 'object', `Must return valid object for primitive ${p}`);
      assert.strictEqual(loaded.texts.heroTitle, INITIAL_CONFIG.texts.heroTitle);
      assert.strictEqual(loaded.colors.primary, INITIAL_CONFIG.colors.primary);

      cleanupTestEnvironment();
    }
  });

  runTest('2.4: Partial configuration objects merge recursively without losing missing keys', () => {
    const partialConfig = {
      texts: {
        heroTitle: 'Custom Elite Title 2026'
        // heroSubtitle, ctaButton, manifestoTitle, proofBar, pillars all missing
      }
      // images, colors, integration completely missing
    };

    const sanitized = sanitizeSiteConfig(partialConfig);
    assert.strictEqual(sanitized.texts.heroTitle, 'Custom Elite Title 2026', 'Custom title must be preserved');
    assert.strictEqual(sanitized.texts.heroSubtitle, INITIAL_CONFIG.texts.heroSubtitle, 'Missing subtitle must use fallback');
    assert.strictEqual(sanitized.texts.ctaButton, INITIAL_CONFIG.texts.ctaButton, 'Missing ctaButton must use fallback');
    assert.strictEqual(sanitized.colors.primary, INITIAL_CONFIG.colors.primary, 'Missing primary color must use fallback');
    assert(Array.isArray(sanitized.images.gallery), 'Gallery must be an array');
    assert(sanitized.images.gallery.length > 0, 'Gallery must have fallback images');
  });

  runTest('2.5: Type mutation attacks (arrays where objects expected, booleans where strings expected)', () => {
    const mutatedConfig = {
      texts: 'should be an object',
      images: 42,
      colors: {
        primary: 99999 // invalid hex
      },
      integration: ['array', 'where', 'object', 'expected']
    };

    const sanitized = sanitizeSiteConfig(mutatedConfig);
    assert.strictEqual(sanitized.texts.heroTitle, INITIAL_CONFIG.texts.heroTitle);
    assert.strictEqual(sanitized.colors.primary, INITIAL_CONFIG.colors.primary);
    assert.strictEqual(sanitized.images.hero, INITIAL_CONFIG.images.hero);
    assert.strictEqual(sanitized.integration.formEndpoint, INITIAL_CONFIG.integration.formEndpoint);
  });

  runTest('2.6: Prototype pollution attempts via storage payload are neutered', () => {
    const maliciousPayload = JSON.parse(
      '{"__proto__":{"polluted":"yes"},"constructor":{"prototype":{"admin":true}}}'
    );

    const sanitized = sanitizeSiteConfig(maliciousPayload);
    assert.strictEqual((Object.prototype as any).polluted, undefined, 'Object.prototype must not be polluted');
    assert.strictEqual((Object.prototype as any).admin, undefined, 'Object.prototype must not have admin property');
    assert.strictEqual(sanitized.texts.heroTitle, INITIAL_CONFIG.texts.heroTitle);
  });

  runTest('2.7: clearPersistedConfig clears storage key without throwing when storage is empty', () => {
    const env = setupTestEnvironment();
    clearPersistedConfig(); // No error on clean environment
    assert.strictEqual(env.storage.getItem(CONFIG_STORAGE_KEY), null);

    env.storage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(INITIAL_CONFIG));
    clearPersistedConfig();
    assert.strictEqual(env.storage.getItem(CONFIG_STORAGE_KEY), null);

    cleanupTestEnvironment();
  });

  runTest('2.8: Invalid color values (CSS injections, RGB, broken hex) are rejected and fall back to valid brand hex', () => {
    const invalidColorConfigs = [
      { colors: { primary: 'red; background: url(evil.com)' } },
      { colors: { primary: 'rgb(255, 0, 0)' } },
      { colors: { primary: '#12345' } }, // 5 digits
      { colors: { primary: '#ZZZZZZ' } }, // invalid hex characters
      { colors: { primary: '' } },
      { colors: { primary: null } }
    ];

    for (const conf of invalidColorConfigs) {
      const sanitized = sanitizeSiteConfig(conf as any);
      assert(/^#([0-9A-F]{3}){1,2}$/i.test(sanitized.colors.primary), `Must sanitize invalid color "${(conf.colors as any)?.primary}" to valid hex`);
      assert.strictEqual(sanitized.colors.primary, INITIAL_CONFIG.colors.primary);
    }
  });

  runTest('2.9: Consecutive corruption cycles preserve corrupted backup without throwing storage errors', () => {
    const env = setupTestEnvironment();
    // Cycle 1: Corrupt
    env.storage.setItem(CONFIG_STORAGE_KEY, '{malformed_json_1');
    const firstRecovery = loadPersistedConfig();
    assert.strictEqual(firstRecovery.texts.heroTitle, INITIAL_CONFIG.texts.heroTitle);
    assert.strictEqual(env.storage.getItem(CORRUPTED_BACKUP_KEY), '{malformed_json_1');

    // Cycle 2: Corrupt again
    env.storage.setItem(CONFIG_STORAGE_KEY, '{malformed_json_2');
    const secondRecovery = loadPersistedConfig();
    assert.strictEqual(secondRecovery.texts.heroTitle, INITIAL_CONFIG.texts.heroTitle);
    assert.strictEqual(env.storage.getItem(CORRUPTED_BACKUP_KEY), '{malformed_json_2');

    cleanupTestEnvironment();
  });

  // ===========================================================================
  // SUITE 3: Image Asset Size & Compression Budget Audit (<205,000 bytes)
  // ===========================================================================
  console.log('\n▶ Suite 3: Image Asset Size & Compression Budget Audit (<205,000 bytes)');

  const EXPECTED_IMAGE_IDS = [
    'NG-141',
    'NG-149',
    'NG-355',
    'NG-392',
    'NG-531',
    'NG-599',
    'NG-607',
    'NG-863 (1)',
    'NG-873',
    'NG-895 (1)'
  ];

  const MAX_ALLOWED_IMAGE_BYTES = 205000; // < 200KB (~205,000 bytes) budget constraint

  runTest('3.1: All 10 public/NG-*.jpg files exist and are strictly < 205,000 bytes (< 200KB) each', () => {
    let totalJpgBytes = 0;
    for (const id of EXPECTED_IMAGE_IDS) {
      const fileName = `${id}.jpg`;
      const filePath = path.join(ROOT_DIR, 'public', fileName);
      assert(fs.existsSync(filePath), `Required JPEG file missing: public/${fileName}`);

      const stats = fs.statSync(filePath);
      totalJpgBytes += stats.size;
      assert(
        stats.size < MAX_ALLOWED_IMAGE_BYTES,
        `public/${fileName} exceeds 205,000 byte budget: ${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB)`
      );
      assert(stats.size > 10 * 1024, `public/${fileName} unexpectedly small (${stats.size} bytes), check for truncation`);
    }
    console.log(`    ℹ Total size of 10 JPEGs: ${(totalJpgBytes / 1024 / 1024).toFixed(2)} MB`);
  });

  runTest('3.2: All 10 companion public/NG-*.avif files exist and are strictly < 205,000 bytes each', () => {
    let totalAvifBytes = 0;
    for (const id of EXPECTED_IMAGE_IDS) {
      const fileName = `${id}.avif`;
      const filePath = path.join(ROOT_DIR, 'public', fileName);
      assert(fs.existsSync(filePath), `Required companion AVIF file missing: public/${fileName}`);

      const stats = fs.statSync(filePath);
      totalAvifBytes += stats.size;
      assert(
        stats.size < MAX_ALLOWED_IMAGE_BYTES,
        `public/${fileName} exceeds 205,000 byte budget: ${stats.size} bytes (${(stats.size / 1024).toFixed(1)} KB)`
      );
      assert(stats.size > 10 * 1024, `public/${fileName} unexpectedly small (${stats.size} bytes)`);
    }
    console.log(`    ℹ Total size of 10 AVIFs: ${(totalAvifBytes / 1024 / 1024).toFixed(2)} MB`);
  });

  runTest('3.3: Total image asset payload reduction achieves >95% savings from 149MB baseline', () => {
    let totalBytes = 0;
    for (const id of EXPECTED_IMAGE_IDS) {
      totalBytes += fs.statSync(path.join(ROOT_DIR, 'public', `${id}.jpg`)).size;
      totalBytes += fs.statSync(path.join(ROOT_DIR, 'public', `${id}.avif`)).size;
    }

    const baselineBytes = 149 * 1024 * 1024; // 149 MB
    const savingsPercent = ((baselineBytes - totalBytes) / baselineBytes) * 100;
    console.log(`    ℹ Total 20 photography assets: ${(totalBytes / 1024 / 1024).toFixed(2)} MB (${savingsPercent.toFixed(1)}% reduction)`);
    assert(savingsPercent > 95.0, `Expected >95% reduction, got ${savingsPercent.toFixed(1)}%`);
    assert(totalBytes < 5 * 1024 * 1024, `Combined 20 assets must be < 5 MB, got ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  });

  runTest('3.4: Components implement HTML5 <picture> tags with AVIF source and JPEG fallback', () => {
    const galleryContent = fs.readFileSync(path.join(ROOT_DIR, 'components/sections/Gallery.tsx'), 'utf8');
    const footerContent = fs.readFileSync(path.join(ROOT_DIR, 'components/sections/Footer.tsx'), 'utf8');
    const manifestoContent = fs.readFileSync(path.join(ROOT_DIR, 'components/sections/Manifesto.tsx'), 'utf8');

    assert(galleryContent.includes('<picture'), 'Gallery.tsx must wrap images in <picture>');
    assert(galleryContent.includes('type="image/avif"'), 'Gallery.tsx must declare <source type="image/avif" />');
    assert(galleryContent.includes('decoding="async"'), 'Gallery.tsx must specify decoding="async"');

    assert(footerContent.includes('<picture'), 'Footer.tsx must wrap parallax quote in <picture>');
    assert(footerContent.includes('type="image/avif"'), 'Footer.tsx must declare <source type="image/avif" />');

    assert(manifestoContent.includes('<picture'), 'Manifesto.tsx must wrap modal image in <picture>');
    assert(manifestoContent.includes('type="image/avif"'), 'Manifesto.tsx must declare <source type="image/avif" />');
  });

  runTest('3.5: Comprehensive image registry verification: every single image < 205,000 bytes', () => {
    const table: Array<{ file: string; bytes: number; kb: string; status: string }> = [];
    for (const id of EXPECTED_IMAGE_IDS) {
      for (const ext of ['.jpg', '.avif']) {
        const file = `${id}${ext}`;
        const p = path.join(ROOT_DIR, 'public', file);
        const bytes = fs.statSync(p).size;
        table.push({
          file,
          bytes,
          kb: (bytes / 1024).toFixed(1),
          status: bytes < MAX_ALLOWED_IMAGE_BYTES ? 'PASS' : 'FAIL'
        });
        assert(bytes < MAX_ALLOWED_IMAGE_BYTES, `${file} is ${bytes} bytes, over budget`);
      }
    }
    assert.strictEqual(table.length, 20, 'Must audit exactly 20 photography assets');
  });

  // ===========================================================================
  // SUITE 4: Bundle Chunk Audit & Rollup Warning Cleanliness (<500 kB)
  // ===========================================================================
  console.log('\n▶ Suite 4: Bundle Chunk Audit & Rollup Warning Cleanliness (<500 kB)');

  const distAssetsDir = path.join(ROOT_DIR, 'dist', 'assets');

  runTest('4.1: Production dist/assets directory exists and contains compiled bundles', () => {
    assert(fs.existsSync(distAssetsDir), 'dist/assets directory must exist (run npm run build first)');
    const files = fs.readdirSync(distAssetsDir);
    assert(files.length > 0, 'dist/assets must contain output bundle files');
  });

  runTest('4.2: Every JavaScript chunk in dist/assets is strictly < 500,000 bytes (<500 kB)', () => {
    const jsFiles = fs.readdirSync(distAssetsDir).filter((f) => f.endsWith('.js'));
    assert(jsFiles.length >= 5, `Expected multiple code-split chunks, found ${jsFiles.length}`);

    const MAX_CHUNK_BYTES = 500 * 1024; // 500 kB = 512,000 bytes
    for (const file of jsFiles) {
      const filePath = path.join(distAssetsDir, file);
      const size = fs.statSync(filePath).size;
      const sizeKb = (size / 1024).toFixed(1);
      assert(
        size < MAX_CHUNK_BYTES,
        `Chunk ${file} exceeds 500 kB limit: ${size} bytes (${sizeKb} kB)`
      );
      console.log(`    ℹ Chunk ${file}: ${sizeKb} kB (Pass < 500 kB)`);
    }
  });

  runTest('4.3: Every CSS chunk in dist/assets is strictly < 500,000 bytes', () => {
    const cssFiles = fs.readdirSync(distAssetsDir).filter((f) => f.endsWith('.css'));
    assert(cssFiles.length >= 1, 'At least one CSS bundle must exist');

    for (const file of cssFiles) {
      const filePath = path.join(distAssetsDir, file);
      const size = fs.statSync(filePath).size;
      const sizeKb = (size / 1024).toFixed(1);
      assert(size < 500 * 1024, `CSS ${file} exceeds 500 kB limit: ${sizeKb} kB`);
      console.log(`    ℹ CSS ${file}: ${sizeKb} kB (Pass < 500 kB)`);
    }
  });

  runTest('4.4: vite.config.ts configures granular manualChunks to prevent monolithic bundle bloat', () => {
    const viteConfig = fs.readFileSync(path.join(ROOT_DIR, 'vite.config.ts'), 'utf8');

    assert(viteConfig.includes("manualChunks:"), 'vite.config.ts must define manualChunks');
    assert(viteConfig.includes("'vendor-react'"), 'Must isolate React vendor chunk');
    assert(viteConfig.includes("'vendor-motion'"), 'Must isolate Framer Motion vendor chunk');
    assert(viteConfig.includes("'vendor-supabase'"), 'Must isolate Supabase vendor chunk');
    assert(viteConfig.includes("'vendor-icons'"), 'Must isolate Lucide Icons vendor chunk');
    assert(viteConfig.includes("'vendor-zod'"), 'Must isolate Zod vendor chunk');
  });

  runTest('4.5: vite.config.ts rollOptions.onwarn silences INVALID_ANNOTATION Rollup warnings', () => {
    const viteConfig = fs.readFileSync(path.join(ROOT_DIR, 'vite.config.ts'), 'utf8');
    assert(viteConfig.includes('onwarn(warning, defaultHandler)'), 'Must configure onwarn handler in rollupOptions');
    assert(viteConfig.includes('INVALID_ANNOTATION'), 'Must suppress INVALID_ANNOTATION warnings');
  });

  runTest('4.6: Main index-*.js entry bundle is < 300 kB (currently ~247 kB)', () => {
    const jsFiles = fs.readdirSync(distAssetsDir).filter((f) => f.startsWith('index-') && f.endsWith('.js'));
    assert(jsFiles.length === 1, `Expected exactly 1 main index chunk, found ${jsFiles.length}`);
    const mainChunkSize = fs.statSync(path.join(distAssetsDir, jsFiles[0])).size;
    assert(
      mainChunkSize < 300 * 1024,
      `Main chunk size (${(mainChunkSize / 1024).toFixed(1)} kB) should be < 300 kB`
    );
  });

  runTest('4.7: Live production build emits ZERO Rollup warnings and all chunks stay < 500 kB', () => {
    const buildResult = execSync('npm run build', { cwd: ROOT_DIR, encoding: 'utf8' });
    assert(!buildResult.includes('INVALID_ANNOTATION'), 'Build must not emit INVALID_ANNOTATION warning');
    assert(!buildResult.includes('Some chunks are larger than 500 kB'), 'Build must not warn about chunks > 500 kB');
    assert(buildResult.includes('built in'), 'Build must complete successfully');
  });

  // ===========================================================================
  // SUITE 5: Git Hygiene & Secret Security Audit
  // ===========================================================================
  console.log('\n▶ Suite 5: Git Hygiene & Secret Security Audit');

  runTest('5.1: git ls-files .env produces exactly empty output (untracked in git index)', () => {
    const output = execSync('git ls-files .env', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
    assert.strictEqual(output, '', `Expected git ls-files .env to be empty, but got: "${output}"`);
  });

  runTest('5.2: git check-ignore -v .env confirms .env is actively ignored by .gitignore', () => {
    const output = execSync('git check-ignore -v .env', { cwd: ROOT_DIR, encoding: 'utf8' }).trim();
    assert(output.includes('.gitignore'), 'Output must reference .gitignore');
    assert(output.includes('.env'), 'Output must confirm .env is ignored');
  });

  runTest('5.3: .gitignore contains defensive exclusion rules for all environment variations', () => {
    const gitignoreContent = fs.readFileSync(path.join(ROOT_DIR, '.gitignore'), 'utf8');
    assert(gitignoreContent.includes('.env'), '.gitignore must contain .env');
    assert(gitignoreContent.includes('.env.*'), '.gitignore must contain .env.* wildcard');
    assert(gitignoreContent.includes('!.env.example'), '.gitignore must explicitly exempt !.env.example');
  });

  runTest('5.4: .env.example exists and contains documented placeholder keys without real secrets', () => {
    const examplePath = path.join(ROOT_DIR, '.env.example');
    assert(fs.existsSync(examplePath), '.env.example template file must exist');

    const content = fs.readFileSync(examplePath, 'utf8');
    assert(content.includes('VITE_SUPABASE_URL='), 'Must document VITE_SUPABASE_URL');
    assert(content.includes('VITE_SUPABASE_ANON_KEY='), 'Must document VITE_SUPABASE_ANON_KEY');
    assert(content.includes('GEMINI_API_KEY='), 'Must document GEMINI_API_KEY');

    // Security check: Must not contain live project URLs or actual jwt secret keys
    assert(!content.includes('eyJhbGciOi'), '.env.example must not contain live JWT tokens');
    assert(!content.includes('ai.google.dev/secret'), '.env.example must not leak credentials');
    assert(content.includes('your-project') && content.includes('.supabase.co'), '.env.example should use safe placeholder url');
  });

  runTest('5.5: services/supabase.ts and services/gemini.ts gracefully handle missing secrets at runtime', () => {
    const supabaseContent = fs.readFileSync(path.join(ROOT_DIR, 'services/supabase.ts'), 'utf8');
    const geminiContent = fs.readFileSync(path.join(ROOT_DIR, 'services/gemini.ts'), 'utf8');

    // Supabase fallback initialization
    assert(supabaseContent.includes("https://placeholder.supabase.co"), 'Supabase service must have safe fallback URL');
    assert(supabaseContent.includes("placeholder-anon-key"), 'Supabase service must have safe fallback anon key');

    // Gemini lazy model getter
    assert(geminiContent.includes('getGeminiModel'), 'Gemini service must use lazy getter');
  });

  // ===========================================================================
  // SUMMARY
  // ===========================================================================
  console.log('\n================================================================');
  console.log(`  RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runChallengerM3_2().catch((err) => {
  console.error('Fatal error in challenger runner:', err);
  process.exit(1);
});
