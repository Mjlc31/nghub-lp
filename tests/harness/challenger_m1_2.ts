/**
 * Empirical Challenger 2 Verification Harness for Milestone 1
 * Stress-tests:
 * 1. TypeScript strict compilation & ESLint zero warnings
 * 2. Production dist/ chunk boundary sizing (<500 kB)
 * 3. LazyMotion strict mode compliance and runtime exception resistance
 * 4. App.tsx line count budget (<70 lines) & clean modularization
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { LazyMotion, domAnimation, m } from 'framer-motion';

const ROOT_DIR = process.cwd();
let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✔ [PASS] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✘ [FAIL] ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

console.log('\n========================================================');
console.log('  CHALLENGER 2: MILESTONE 1 EMPIRICAL VERIFICATION      ');
console.log('========================================================\n');

// =========================================================================
// SUITE 1: Toolchain & Strict TypeScript Compilation
// =========================================================================
console.log('▶ Suite 1: TypeScript Strictness & ESLint Toolchain Hygiene');

runTest('1.1: tsconfig.json enforces "strict": true with necessary boundary exclusions', () => {
  const tsconfig = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'tsconfig.json'), 'utf8'));
  assert.strictEqual(tsconfig.compilerOptions.strict, true, '"strict" must be true');
  assert.strictEqual(tsconfig.compilerOptions.noEmit, true, '"noEmit" must be true');
  assert(tsconfig.exclude.includes('LANDING-PAGE---NG-main'), 'Must exclude legacy untracked folder');
  assert(tsconfig.exclude.includes('node_modules'), 'Must exclude node_modules');
  assert(tsconfig.exclude.includes('dist'), 'Must exclude dist');
});

runTest('1.2: npm run typecheck (tsc --noEmit) executes with 0 errors', () => {
  const output = execSync('npm run typecheck', { cwd: ROOT_DIR, encoding: 'utf8' });
  assert(!output.includes('error TS'), 'Output must not contain any TypeScript compilation errors');
});

runTest('1.3: npm run lint (eslint .) executes with 0 errors and 0 warnings', () => {
  const output = execSync('npm run lint', { cwd: ROOT_DIR, encoding: 'utf8' });
  assert(!output.includes('error'), 'ESLint output must not contain errors');
  assert(!output.includes('warning'), 'ESLint output must not contain warnings');
});

// =========================================================================
// SUITE 2: Production Dist Chunk Boundaries (<500 kB)
// =========================================================================
console.log('\n▶ Suite 2: Production Build & Chunk Size Thresholds (<500 kB)');

const assetsDir = path.join(ROOT_DIR, 'dist', 'assets');
assert(fs.existsSync(assetsDir), 'dist/assets directory must exist from build');
const assetFiles = fs.readdirSync(assetsDir);

runTest('2.1: dist/ contains built JavaScript, CSS, and HTML artifacts', () => {
  const jsFiles = assetFiles.filter(f => f.endsWith('.js'));
  const cssFiles = assetFiles.filter(f => f.endsWith('.css'));
  assert(jsFiles.length >= 5, 'Must have partitioned chunk outputs');
  assert(cssFiles.length >= 1, 'Must contain compiled CSS bundle');
  assert(fs.existsSync(path.join(ROOT_DIR, 'dist', 'index.html')), 'dist/index.html must exist');
});

runTest('2.2: Every single chunk in dist/assets is strictly under 500 kB (512,000 bytes)', () => {
  const threshold = 500 * 1024; // 512,000 bytes
  for (const file of assetFiles) {
    const stat = fs.statSync(path.join(assetsDir, file));
    assert(stat.size < threshold, `Chunk ${file} (${stat.size} bytes) exceeds 500 kB threshold`);
  }
});

runTest('2.3: Main entry chunk is under 350 kB (<60% of budget)', () => {
  const entryChunk = assetFiles.find(f => f.startsWith('index-') && f.endsWith('.js'));
  assert(entryChunk, 'Main entry chunk (index-*.js) must exist');
  const stat = fs.statSync(path.join(assetsDir, entryChunk));
  const sizeKB = stat.size / 1024;
  assert(stat.size < 350 * 1024, `Main entry chunk is ${sizeKB.toFixed(2)} kB, must be < 350 kB`);
});

runTest('2.4: AdminPanel and Login are split into lazy-loaded chunks', () => {
  const adminChunk = assetFiles.find(f => f.startsWith('AdminPanel-') && f.endsWith('.js'));
  const loginChunk = assetFiles.find(f => f.startsWith('Login-') && f.endsWith('.js'));
  assert(adminChunk, 'AdminPanel must be isolated in its own code-split chunk');
  assert(loginChunk, 'Login modal must be isolated in its own code-split chunk');
});

runTest('2.5: Vendor dependencies (Supabase, Framer Motion, Icons) are modularly partitioned', () => {
  const motionChunk = assetFiles.find(f => f.startsWith('vendor-motion-') && f.endsWith('.js'));
  const supabaseChunk = assetFiles.find(f => f.startsWith('vendor-supabase-') && f.endsWith('.js'));
  const iconsChunk = assetFiles.find(f => f.startsWith('vendor-icons-') && f.endsWith('.js'));
  assert(motionChunk, 'vendor-motion chunk must be partitioned');
  assert(supabaseChunk, 'vendor-supabase chunk must be partitioned');
  assert(iconsChunk, 'vendor-icons chunk must be partitioned');
});

// =========================================================================
// SUITE 3: LazyMotion Strict Mode & Runtime Tree-Shaking
// =========================================================================
console.log('\n▶ Suite 3: LazyMotion Strict Mode & Tree-Shaking Compliance');

runTest('3.1: App.tsx wraps application root in <LazyMotion features={domAnimation} strict>', () => {
  const appContent = fs.readFileSync(path.join(ROOT_DIR, 'App.tsx'), 'utf8');
  assert(appContent.includes('<LazyMotion features={domAnimation} strict>'), 'Must configure LazyMotion with domAnimation and strict');
});

runTest('3.2: Zero direct imports of { motion } from "framer-motion" across all source files', () => {
  function scanDir(dir: string): string[] {
    let results: string[] = [];
    for (const item of fs.readdirSync(dir)) {
      if (['node_modules', 'dist', 'LANDING-PAGE---NG-main', '.agents', 'temp_skills'].includes(item)) continue;
      const full = path.join(dir, item);
      if (fs.statSync(full).isDirectory()) {
        results = results.concat(scanDir(full));
      } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
        results.push(full);
      }
    }
    return results;
  }

  const files = scanDir(ROOT_DIR);
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    const importMatches = content.match(/import\s+{([^}]*)}\s+from\s+['"]framer-motion['"]/g) || [];
    for (const match of importMatches) {
      const named = match.slice(match.indexOf('{') + 1, match.indexOf('}'));
      assert(!/\bmotion\b/.test(named), `Prohibited motion import in ${file}: ${match}`);
    }
    const tagMatches = content.match(/<motion\.[a-zA-Z0-9]+/g) || [];
    assert.strictEqual(tagMatches.length, 0, `Prohibited <motion.*> tag in ${file}`);
  }
});

runTest('3.3: Runtime SSR evaluation of <LazyMotion strict> with <m.*> components succeeds without exception', () => {
  const tree = React.createElement(
    LazyMotion,
    { features: domAnimation, strict: true },
    React.createElement(
      m.div,
      { initial: { opacity: 0 }, animate: { opacity: 1 } },
      React.createElement(m.h1, null, 'Test Headline'),
      React.createElement(m.p, null, 'Test Paragraph'),
      React.createElement(m.button, null, 'CTA Button')
    )
  );

  const html = renderToString(tree);
  assert(html.includes('Test Headline'), 'Rendered HTML must include child elements');
});

runTest('3.4: ESLint rule "no-restricted-imports" actively forbids motion imports', () => {
  const eslintConfig = fs.readFileSync(path.join(ROOT_DIR, 'eslint.config.js'), 'utf8');
  assert(eslintConfig.includes('no-restricted-imports'), 'ESLint config must declare no-restricted-imports');
  assert(eslintConfig.includes("'framer-motion'"), 'Rule must target framer-motion');
  assert(eslintConfig.includes("'motion'"), 'Rule must restrict motion import');
});

// =========================================================================
// SUITE 4: App.tsx Monolith Modularization & Architectural Integrity
// =========================================================================
console.log('\n▶ Suite 4: App.tsx Modularization & Line Count Budget');

runTest('4.1: App.tsx line count is strictly under 70 lines (target budget)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'App.tsx'), 'utf8');
  const lines = content.split('\n').length;
  console.log(`     Measured App.tsx lines: ${lines}`);
  assert(lines < 70, `App.tsx has ${lines} lines, exceeding 70-line ceiling`);
});

runTest('4.2: App.tsx eliminates 8-layer prop drilling via SiteConfigProvider and Context hooks', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'App.tsx'), 'utf8');
  assert(!content.includes('config={config}'), 'App.tsx must not pass config prop');
  assert(!content.includes('colors={config.colors}'), 'App.tsx must not pass colors prop');
  assert(!content.includes('images={config.images}'), 'App.tsx must not pass images prop');
  assert(!content.includes('texts={config.texts}'), 'App.tsx must not pass texts prop');
  assert(content.includes('<SiteConfigProvider>'), 'App.tsx must wrap app with SiteConfigProvider');
});

runTest('4.3: App.tsx lazy-loads below-the-fold components (Arsenal, Gallery, Footer)', () => {
  const content = fs.readFileSync(path.join(ROOT_DIR, 'App.tsx'), 'utf8');
  assert(content.includes("React.lazy(() => import('./components/sections/Arsenal')"), 'Arsenal must be lazy loaded');
  assert(content.includes("React.lazy(() => import('./components/sections/Gallery')"), 'Gallery must be lazy loaded');
  assert(content.includes("React.lazy(() => import('./components/sections/Footer')"), 'Footer must be lazy loaded');
});

console.log('\n========================================================');
console.log(`  RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
console.log('========================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
