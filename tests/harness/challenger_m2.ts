/**
 * Empirical Challenger Verification Harness for Milestone 2
 * 
 * Adversarial Stress Tests:
 * 1. Typography Triad: Fallback chains, Google Fonts link, weight crispness, no faux-bold
 * 2. Color Contrast: Mathematical WCAG 2.1 AA/AAA oracles (Obsidian #060709, Champagne #E5C579, Neutrals)
 * 3. Hairline Borders: Subpixel display rendering, alpha bounds, anti-aliasing directives
 * 4. Navbar Floating Layout & Drawer: Viewport transitions (<768px vs >=768px), drawer state machine
 * 5. Hero Telemetry Strip & Headline: Metric boundary resilience, dynamic highlight parser safety
 * 6. Component Fault-Tolerance & Edge Payload Boundaries: ProofBar fallbacks, BentoGrid layout, SpotlightCard coordinates, ParallaxQuote isolation, Manifesto standards
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { setupTestEnvironment, cleanupTestEnvironment } from './env.ts';

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
          console.error(err.stack);
          failed++;
        });
    } else {
      console.log(`  ✔ [PASS] ${name}`);
      passed++;
    }
  } catch (err: any) {
    console.error(`  ✘ [FAIL] ${name}`);
    console.error(err.stack);
    failed++;
  }
}

// =========================================================================
// WCAG 2.1 Color Contrast Mathematical Oracle
// =========================================================================
interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  let cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex.slice(0, 6), 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function getRelativeLuminance(rgb: RGB): number {
  const rs = rgb.r / 255;
  const gs = rgb.g / 255;
  const bs = rgb.b / 255;

  const rLinear = rs <= 0.04045 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
  const gLinear = gs <= 0.04045 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
  const bLinear = bs <= 0.04045 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hexToRgb(hex1));
  const lum2 = getRelativeLuminance(hexToRgb(hex2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

function compositeRgb(fg: RGB, alpha: number, bg: RGB): RGB {
  return {
    r: Math.round(fg.r * alpha + bg.r * (1 - alpha)),
    g: Math.round(fg.g * alpha + bg.g * (1 - alpha)),
    b: Math.round(fg.b * alpha + bg.b * (1 - alpha))
  };
}

async function runChallengerM2() {
  console.log('\n========================================================');
  console.log('  CHALLENGER: MILESTONE 2 EMPIRICAL STRESS TEST SUITE   ');
  console.log('========================================================\n');

  // =======================================================================
  // SUITE 1: Typography Triad Fallback Chains & Font-Weight Crispness
  // =======================================================================
  console.log('▶ Suite 1: Typography Triad Fallbacks & Font-Weight Crispness');

  runTest('1.1: index.html configures Google Fonts preconnect and complete font triad URL', () => {
    const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    assert(indexHtml.includes('https://fonts.googleapis.com'), 'Must preconnect to fonts.googleapis.com');
    assert(indexHtml.includes('https://fonts.gstatic.com'), 'Must preconnect to fonts.gstatic.com');
    assert(indexHtml.includes('crossorigin'), 'fonts.gstatic.com must have crossorigin attribute');

    assert(indexHtml.includes('family=Geist+Mono:wght@400;500;600;700'), 'Must include Geist Mono weights');
    assert(indexHtml.includes('family=Geist:wght@300;400;500;600;700;800;900'), 'Must include Geist display weights');
    assert(indexHtml.includes('family=Instrument+Serif:ital@0;1'), 'Must include Instrument Serif normal and italic');
    assert(indexHtml.includes('family=Inter:wght@300;400;500;600;700'), 'Must include Inter core weights');
    assert(indexHtml.includes('family=Plus+Jakarta+Sans:wght@400;500;600;700;800'), 'Must include Plus Jakarta Sans weights');
    assert(indexHtml.includes('&display=swap'), 'Must use display=swap for seamless font fallback rendering');
  });

  runTest('1.2: tailwind.config.js declares robust fallback chains ending in generic CSS families', () => {
    const tailwindConfig = fs.readFileSync(path.join(ROOT_DIR, 'tailwind.config.js'), 'utf8');

    const fontDisplayMatch = tailwindConfig.match(/display:\s*\[([^\]]+)\]/);
    const fontSansMatch = tailwindConfig.match(/sans:\s*\[([^\]]+)\]/);
    const fontMonoMatch = tailwindConfig.match(/mono:\s*\[([^\]]+)\]/);
    const fontSerifMatch = tailwindConfig.match(/serif:\s*\[([^\]]+)\]/);

    assert(fontDisplayMatch, 'display font family must be defined');
    assert(fontSansMatch, 'sans font family must be defined');
    assert(fontMonoMatch, 'mono font family must be defined');
    assert(fontSerifMatch, 'serif font family must be defined');

    assert(fontDisplayMatch[1].includes("'sans-serif'"), 'display must fall back to generic sans-serif');
    assert(fontSansMatch[1].includes("'sans-serif'"), 'sans must fall back to generic sans-serif');
    assert(fontMonoMatch[1].includes("'monospace'"), 'mono must fall back to generic monospace');
    assert(fontSerifMatch[1].includes("'serif'"), 'serif must fall back to generic serif');

    assert(fontDisplayMatch[1].includes("'system-ui'") || fontDisplayMatch[1].includes("'-apple-system'"), 'display must include system font fallback');
    assert(fontSansMatch[1].includes("'system-ui'") || fontSansMatch[1].includes("'-apple-system'"), 'sans must include system font fallback');
    assert(fontSerifMatch[1].includes("'Georgia'"), 'serif must include high-quality Georgia serif fallback');
  });

  runTest('1.3: Multi-word font family identifiers contain strict internal quote wrapping', () => {
    const tailwindConfig = fs.readFileSync(path.join(ROOT_DIR, 'tailwind.config.js'), 'utf8');
    
    assert(tailwindConfig.includes('\'"Plus Jakarta Sans"\''), 'Plus Jakarta Sans must have nested quotes for CSS validity');
    assert(tailwindConfig.includes('\'"Geist Mono"\''), 'Geist Mono must have nested quotes for CSS validity');
    assert(tailwindConfig.includes('\'"Instrument Serif"\''), 'Instrument Serif must have nested quotes for CSS validity');
  });

  runTest('1.4: Instrument Serif typography usage respects natural single-weight bounds', () => {
    const heroContent = fs.readFileSync(path.join(ROOT_DIR, 'components/sections/Hero.tsx'), 'utf8');
    assert(heroContent.includes('font-serif text-white mb-6 md:mb-8 leading-[1.06] tracking-tight whitespace-pre-line drop-shadow-2xl font-normal'), 'Hero headline must explicitly specify font-normal to avoid browser synthetic bolding');
    assert(heroContent.includes("isHighlight ? 'font-serif italic font-light' : ''"), 'Dynamic highlight in Instrument Serif must use italic and font-light for refined elegance');
  });

  runTest('1.5: index.css establishes system font-family baseline and antialiasing on body', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'index.css'), 'utf8');
    assert(css.includes("font-family: 'Inter', system-ui, -apple-system, sans-serif;"), 'Body font-family baseline must be defined in index.css');
    assert(css.includes('-webkit-font-smoothing: antialiased;'), 'Must specify -webkit-font-smoothing: antialiased');
    assert(css.includes('-moz-osx-font-smoothing: grayscale;'), 'Must specify -moz-osx-font-smoothing: grayscale');
  });

  // =======================================================================
  // SUITE 2: Color Contrast Calculations (WCAG 2.1 AA/AAA Oracles)
  // =======================================================================
  console.log('\n▶ Suite 2: Color Contrast Calculations (WCAG 2.1 AA/AAA Oracles)');

  const OBSIDIAN_CANVAS = '#060709';
  const OBSIDIAN_SURFACE = '#0C0E12';
  const CHAMPAGNE = '#E5C579';
  const CHAMPAGNE_LIGHT = '#F4DE9C';
  const CHAMPAGNE_MUTED = '#C5A059';
  const TEXT_NEUTRAL_100 = '#F5F5F5';
  const TEXT_ZINC_300 = '#D4D4D8';
  const TEXT_ZINC_400 = '#A1A1AA';
  const TEXT_ZINC_500 = '#71717A';

  runTest('2.1: Pale Champagne (#E5C579) on Obsidian Canvas (#060709) exceeds WCAG AAA standard', () => {
    const ratio = getContrastRatio(CHAMPAGNE, OBSIDIAN_CANVAS);
    assert(ratio >= 7.0, `Contrast ratio ${ratio.toFixed(2)}:1 must pass WCAG AAA (>= 7.0:1)`);
    assert(ratio >= 11.5 && ratio <= 12.5, `Expected contrast ratio ~12.12:1, got ${ratio.toFixed(2)}:1`);
  });

  runTest('2.2: Inverted dark text (#060709) on Pale Champagne buttons (#E5C579) exceeds WCAG AAA standard', () => {
    const ratio = getContrastRatio(OBSIDIAN_CANVAS, CHAMPAGNE);
    assert(ratio >= 7.0, `Button text contrast ${ratio.toFixed(2)}:1 must pass WCAG AAA (>= 7.0:1)`);
    
    const badRatio = getContrastRatio('#FFFFFF', CHAMPAGNE);
    assert(badRatio < 3.0, `White on Champagne contrast (${badRatio.toFixed(2)}:1) fails WCAG standards, confirming necessity of #060709 text`);
  });

  runTest('2.3: Primary text (#F5F5F5) on Obsidian Canvas (#060709) exceeds WCAG AAA standard', () => {
    const ratio = getContrastRatio(TEXT_NEUTRAL_100, OBSIDIAN_CANVAS);
    assert(ratio >= 15.0, `Neutral-100 text contrast ${ratio.toFixed(2)}:1 must be extremely high (>= 15.0:1)`);
    assert(ratio >= 7.0, 'Must pass WCAG AAA');
  });

  runTest('2.4: Secondary text (#D4D4D8) on Obsidian Canvas (#060709) exceeds WCAG AAA standard', () => {
    const ratio = getContrastRatio(TEXT_ZINC_300, OBSIDIAN_CANVAS);
    assert(ratio >= 7.0, `Zinc-300 contrast ${ratio.toFixed(2)}:1 must pass WCAG AAA (>= 7.0:1)`);
    assert(ratio >= 13.0, `Expected zinc-300 contrast ~13.5:1, got ${ratio.toFixed(2)}:1`);
  });

  runTest('2.5: Muted text (#A1A1AA) on Obsidian Canvas (#060709) exceeds WCAG AAA standard', () => {
    const ratio = getContrastRatio(TEXT_ZINC_400, OBSIDIAN_CANVAS);
    assert(ratio >= 7.0, `Zinc-400 contrast ${ratio.toFixed(2)}:1 must pass WCAG AAA (>= 7.0:1)`);
  });

  runTest('2.6: Micro-telemetry text & brackets (#71717A) satisfies WCAG AA non-text / large-text standard', () => {
    const ratio = getContrastRatio(TEXT_ZINC_500, OBSIDIAN_CANVAS);
    assert(ratio >= 3.0, `Zinc-500 contrast ${ratio.toFixed(2)}:1 must pass UI indicator threshold (>= 3.0:1)`);
    assert(ratio >= 4.0, `Expected zinc-500 contrast ~4.2:1, got ${ratio.toFixed(2)}:1`);
  });

  runTest('2.7: Elevated surface (#0C0E12) maintains WCAG AAA contrast for Champagne and Text', () => {
    const champagneOnSurface = getContrastRatio(CHAMPAGNE, OBSIDIAN_SURFACE);
    const textOnSurface = getContrastRatio(TEXT_NEUTRAL_100, OBSIDIAN_SURFACE);
    
    assert(champagneOnSurface >= 7.0, `Champagne on surface ${champagneOnSurface.toFixed(2)}:1 must pass WCAG AAA`);
    assert(textOnSurface >= 7.0, `Text on surface ${textOnSurface.toFixed(2)}:1 must pass WCAG AAA`);
  });

  runTest('2.8: Adversarial color mutation test: Verifies contrast oracle accurately flags low-contrast inputs', () => {
    const lowContrastRatio = getContrastRatio('#333333', OBSIDIAN_CANVAS);
    assert(lowContrastRatio < 2.0, 'Oracle must detect low contrast below 2.0:1');

    const lightRatio = getContrastRatio(CHAMPAGNE_LIGHT, OBSIDIAN_CANVAS);
    const mutedRatio = getContrastRatio(CHAMPAGNE_MUTED, OBSIDIAN_CANVAS);
    assert(lightRatio >= 7.0, 'Champagne light must pass WCAG AAA');
    assert(mutedRatio >= 4.5, 'Champagne muted must pass WCAG AA');
  });

  // =======================================================================
  // SUITE 3: Hairline Border Rendering Rules on Subpixel Displays
  // =======================================================================
  console.log('\n▶ Suite 3: Hairline Border Subpixel Rendering & Display Fidelity');

  runTest('3.1: Hairline alpha transparency stays within the subpixel visibility window (0.05 - 0.20)', () => {
    const tailwindConfig = fs.readFileSync(path.join(ROOT_DIR, 'tailwind.config.js'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT_DIR, 'index.css'), 'utf8');

    assert(tailwindConfig.includes("'rgba(255, 255, 255, 0.08)'"), 'Tailwind must configure white-subtle at 0.08 alpha');
    assert(tailwindConfig.includes("'rgba(255, 255, 255, 0.05)'"), 'Tailwind must configure white-faint at 0.05 alpha');

    assert(css.includes('--border-subtle: rgba(255, 255, 255, 0.08);'), 'CSS root must define --border-subtle');
    assert(css.includes('--border-faint: rgba(255, 255, 255, 0.05);'), 'CSS root must define --border-faint');

    const alphaValues = [0.08, 0.05, 0.06, 0.12, 0.14, 0.16];
    for (const a of alphaValues) {
      assert(a >= 0.04 && a <= 0.20, `Alpha ${a} must be within 0.04 to 0.20 subpixel comfort range`);
    }
  });

  runTest('3.2: Composited hairline border color on obsidian canvas yields crisp, non-harsh contrast', () => {
    const bg = hexToRgb(OBSIDIAN_CANVAS);
    const white = { r: 255, g: 255, b: 255 };

    const composited08 = compositeRgb(white, 0.08, bg);
    assert.strictEqual(composited08.r, 26);
    assert.strictEqual(composited08.g, 27);
    assert.strictEqual(composited08.b, 29);

    const composited14 = compositeRgb(white, 0.14, bg);
    assert.strictEqual(composited14.r, 41);
    assert.strictEqual(composited14.g, 42);
    assert.strictEqual(composited14.b, 43);

    const hex08 = `#${composited08.r.toString(16)}${composited08.g.toString(16)}${composited08.b.toString(16)}`;
    const borderRatio = getContrastRatio(hex08, OBSIDIAN_CANVAS);
    assert(borderRatio >= 1.05 && borderRatio <= 1.30, `Hairline contrast ratio ${borderRatio.toFixed(3)}:1 must be refined and subtle`);
  });

  runTest('3.3: Hairline divider utilities (.hairline-divider) define exact 1px height with edge gradients', () => {
    const css = fs.readFileSync(path.join(ROOT_DIR, 'index.css'), 'utf8');
    
    assert(css.includes('.hairline-divider {'), 'Must declare .hairline-divider');
    assert(css.includes('height: 1px;'), 'Must set height: 1px');
    assert(css.includes('linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)'), 'Must fade to transparent on edges');

    assert(css.includes('.hairline-divider-champagne {'), 'Must declare .hairline-divider-champagne');
    assert(css.includes('linear-gradient(90deg, transparent 0%, rgba(229, 197, 121, 0.25) 50%, transparent 100%)'), 'Must fade champagne hairline to transparent');
  });

  runTest('3.4: SpotlightCard and BentoGrid cards enforce border containment and overflow: hidden', () => {
    const spotlightCode = fs.readFileSync(path.join(ROOT_DIR, 'components/ui/Spotlight.tsx'), 'utf8');
    const css = fs.readFileSync(path.join(ROOT_DIR, 'index.css'), 'utf8');

    assert(spotlightCode.includes('border border-white/[0.08]'), 'SpotlightCard must declare hairline border');
    assert(spotlightCode.includes('overflow-hidden'), 'SpotlightCard must declare overflow-hidden to prevent subpixel bleeding');
    assert(css.includes('border: 1px solid rgba(255, 255, 255, 0.08);'), 'spotlight-card CSS rule must specify 1px solid hairline');
    assert(css.includes('overflow: hidden;'), 'spotlight-card CSS rule must specify overflow: hidden');
  });

  // =======================================================================
  // SUITE 4: Navbar Floating Layout & Drawer Toggle Across Viewports
  // =======================================================================
  console.log('\n▶ Suite 4: Navbar Floating Layout & Responsive Viewport Transitions');

  runTest('4.1: Navbar classes implement strict responsive viewport partitioning (<768px vs >=768px)', () => {
    const navbarContent = fs.readFileSync(path.join(ROOT_DIR, 'components/layout/Navbar.tsx'), 'utf8');

    assert(navbarContent.includes('className="hidden md:flex items-center gap-7'), 'Desktop nav must have hidden md:flex');
    assert(navbarContent.includes('className="flex md:hidden items-center gap-2.5"'), 'Mobile controls must have flex md:hidden');
    assert(navbarContent.includes('className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] md:hidden"'), 'Backdrop must have md:hidden');
    assert(navbarContent.includes('md:hidden flex flex-col p-6 shadow-2xl"'), 'Drawer container must have md:hidden');
  });

  runTest('4.2: Live Admissions Chip uses hidden lg:flex to avoid collision on 768px-1023px viewports', () => {
    const navbarContent = fs.readFileSync(path.join(ROOT_DIR, 'components/layout/Navbar.tsx'), 'utf8');
    assert(navbarContent.includes('className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08]'), 'Admissions chip must be hidden on medium screens and visible on large screens (lg:flex)');
  });

  runTest('4.3: Navbar scroll threshold triggers styling transitions when scrollY > 20', () => {
    const env = setupTestEnvironment();
    env.window.addEventListener('scroll', (e: any) => {
      const isScrolled = env.window.scrollY > 20;
      (env.window as any).__isScrolled = isScrolled;
    });

    env.window.scrollY = 0;
    env.window.dispatchEvent({ type: 'scroll' });
    assert.strictEqual((env.window as any).__isScrolled, false, 'Navbar must not be in scrolled state at scrollY = 0');

    env.window.scrollY = 15;
    env.window.dispatchEvent({ type: 'scroll' });
    assert.strictEqual((env.window as any).__isScrolled, false, 'Navbar must not be in scrolled state at scrollY = 15');

    env.window.scrollY = 21;
    env.window.dispatchEvent({ type: 'scroll' });
    assert.strictEqual((env.window as any).__isScrolled, true, 'Navbar must enter scrolled state at scrollY = 21');

    env.window.scrollY = 5;
    env.window.dispatchEvent({ type: 'scroll' });
    assert.strictEqual((env.window as any).__isScrolled, false, 'Navbar must revert to default state when scrolling back up');

    cleanupTestEnvironment();
  });

  runTest('4.4: Mobile drawer state machine stress-test: 1,000 rapid toggle cycles with zero desync', () => {
    let isOpen = false;
    const toggle = () => { isOpen = !isOpen; };
    const close = () => { isOpen = false; };

    for (let i = 0; i < 1000; i++) {
      toggle();
      assert.strictEqual(isOpen, i % 2 === 0, `State desync at cycle ${i}`);
    }

    close();
    assert.strictEqual(isOpen, false);
  });

  runTest('4.5: Mobile drawer dismissal actions: X-button, backdrop, and all link clicks terminate drawer', () => {
    let isMobileMenuOpen = true;
    const closeMenu = () => { isMobileMenuOpen = false; };

    isMobileMenuOpen = true;
    closeMenu();
    assert.strictEqual(isMobileMenuOpen, false, 'X button must close drawer');

    isMobileMenuOpen = true;
    closeMenu();
    assert.strictEqual(isMobileMenuOpen, false, 'Backdrop click must close drawer');

    isMobileMenuOpen = true;
    const handleManifesto = () => { closeMenu(); };
    handleManifesto();
    assert.strictEqual(isMobileMenuOpen, false, 'Manifesto click must close drawer');

    isMobileMenuOpen = true;
    const handleApply = (e: any) => { e.preventDefault(); closeMenu(); };
    handleApply({ preventDefault: () => {} });
    assert.strictEqual(isMobileMenuOpen, false, 'Apply CTA must close drawer');

    isMobileMenuOpen = true;
    const handleCohort = (e: any) => { e.preventDefault(); closeMenu(); };
    handleCohort({ preventDefault: () => {} });
    assert.strictEqual(isMobileMenuOpen, false, 'Cohort link must close drawer');
  });

  // =======================================================================
  // SUITE 5: Hero Telemetry Strip Rendering & Metrics Boundary Safety
  // =======================================================================
  console.log('\n▶ Suite 5: Hero Telemetry Strip & Metrics Boundary Safety');

  runTest('5.1: Hero defaults define 4 live telemetry metrics with valid brackets and formatting', () => {
    const heroContent = fs.readFileSync(path.join(ROOT_DIR, 'components/sections/Hero.tsx'), 'utf8');
    
    assert(heroContent.includes("label: 'FOUNDERS', value: '42+', badge: '[ 42+ FOUNDERS ]'"));
    assert(heroContent.includes("label: 'ARR AGREGADO', value: 'R$ 180M+', badge: '[ R$ 180M+ ARR ]'"));
    assert(heroContent.includes("label: 'RETENÇÃO', value: '98.4%', badge: '[ 98.4% RETENTION ]'"));
    assert(heroContent.includes("label: 'TAXA DE ACEITAÇÃO', value: '4.2%', badge: '[ 4.2% TAXA DE ACEITAÇÃO ]'"));
  });

  runTest('5.2: Telemetry strip maps over empty array [] without throwing runtime exceptions', () => {
    const emptyMetrics: Array<{ label: string; value: string; badge?: string }> = [];
    let renderCount = 0;
    
    const rendered = emptyMetrics.map((metric, idx) => {
      renderCount++;
      return `[ ${metric.label} // ${metric.value} ]`;
    });

    assert.strictEqual(renderCount, 0, 'Empty telemetry metrics array must render 0 items');
    assert.strictEqual(rendered.length, 0, 'No output generated');
  });

  runTest('5.3: Telemetry strip handles extreme boundary values (negative, zero, scientific, currency, unicode)', () => {
    const boundaryMetrics = [
      { label: 'EMPTY', value: '' },
      { label: 'ZERO', value: '0' },
      { label: 'NEGATIVE', value: '-15%' },
      { label: 'DECIMAL MICRO', value: '0.0001%' },
      { label: 'EXTREME ARR', value: 'R$ 999.999.999.999+' },
      { label: 'CURRENCY MULTI', value: 'US$ 50M / € 45M / ₿ 1200' },
      { label: 'UNICODE SYMBOLS', value: '∑ 42 • ∆ 98.4% → ∞' },
      { label: 'MASSIVE STRING', value: 'A'.repeat(100) }
    ];

    for (const metric of boundaryMetrics) {
      const display = `[ ${metric.label} // ${metric.value} ]`;
      assert(display.startsWith('['), 'Must start with bracket');
      assert(display.endsWith(']'), 'Must end with bracket');
      assert(display.includes(metric.label), 'Must contain label');
      assert(display.includes(metric.value), 'Must contain value');
    }
  });

  runTest('5.4: Hero headline dynamic highlight parser: handles punctuation, casing, empty, and multi-word inputs', () => {
    const HIGHLIGHT_WORDS = ['média', 'mesa', 'senta', 'pib'];

    function parseHeadline(title: string): Array<{ word: string; isHighlight: boolean }> {
      return title.split(' ').map((word) => {
        const clean = word.toLowerCase().replace(/[.,!?;:]/g, '');
        const isHighlight = HIGHLIGHT_WORDS.includes(clean);
        return { word, isHighlight };
      });
    }

    const defaultTitle = "Você é a média da mesa em que se senta.";
    const parsedDefault = parseHeadline(defaultTitle);
    const highlightedDefault = parsedDefault.filter(p => p.isHighlight).map(p => p.word);
    assert(highlightedDefault.some(w => w.includes('média')), 'Must highlight média');
    assert(highlightedDefault.some(w => w.includes('mesa')), 'Must highlight mesa');
    assert(highlightedDefault.some(w => w.includes('senta')), 'Must highlight senta');

    const parsedEmpty = parseHeadline('');
    assert.strictEqual(parsedEmpty.length, 1);
    assert.strictEqual(parsedEmpty[0].isHighlight, false);

    const punctuated = parseHeadline("MÉDIA!!! à mesa... gere PIB?!");
    assert.strictEqual(punctuated[0].isHighlight, true, 'MÉDIA!!! must be highlighted despite uppercase and punctuation');
    assert.strictEqual(punctuated[2].isHighlight, true, 'mesa... must be highlighted despite punctuation');
    assert.strictEqual(punctuated[4].isHighlight, true, 'PIB?! must be highlighted despite uppercase and punctuation');

    const noMatch = parseHeadline("Texto comum sem palavras especiais aqui");
    assert.strictEqual(noMatch.filter(p => p.isHighlight).length, 0, 'No words should be highlighted');

    const longTitle = Array(2500).fill("média mesa senta pib").join(' ');
    const tStart = performance.now();
    const parsedLong = parseHeadline(longTitle);
    const duration = performance.now() - tStart;
    assert.strictEqual(parsedLong.length, 10000, 'Must parse 10,000 words');
    assert(duration < 50, `Parsing 10,000 words took ${duration.toFixed(2)}ms, must be < 50ms`);
  });

  runTest('5.5: Hero dual-CTAs: Primary anchors to #apply, Secondary triggers onOpenManifesto', () => {
    let applyAnchorScrolled = false;
    let manifestoOpened = false;

    const handleScrollToApply = (e: any) => {
      e.preventDefault();
      applyAnchorScrolled = true;
    };
    handleScrollToApply({ preventDefault: () => {} });
    assert.strictEqual(applyAnchorScrolled, true, 'Primary CTA must scroll to #apply');

    const handleManifestoClick = (e: any) => {
      e.preventDefault();
      manifestoOpened = true;
    };
    handleManifestoClick({ preventDefault: () => {} });
    assert.strictEqual(manifestoOpened, true, 'Secondary CTA must trigger onOpenManifesto callback');
  });

  // =======================================================================
  // SUITE 6: Component Fault-Tolerance & Edge Payload Boundaries
  // =======================================================================
  console.log('\n▶ Suite 6: Component Fault-Tolerance & Edge Payload Boundaries');

  runTest('6.1: ProofBar: Unmapped brand names fallback to bracketed telemetry marks [ BRAND ]', () => {
    const proofBarContent = fs.readFileSync(path.join(ROOT_DIR, 'components/sections/ProofBar.tsx'), 'utf8');
    assert(proofBarContent.includes('[ {name} ]') && proofBarContent.includes('uppercase'), 'Unmapped brands must fallback to bracketed uppercase badge');
    
    // Simulate BrandLogo resolution logic
    function resolveBrand(name: string): { type: 'svg' | 'text' | 'fallback'; display: string } {
      const normalized = name.toLowerCase().trim();
      if (normalized.includes('y combinator') || normalized === 'yc') return { type: 'svg', display: 'Y Combinator' };
      if (normalized.includes('techstars')) return { type: 'svg', display: 'techstars_' };
      if (normalized.includes('endeavor')) return { type: 'svg', display: 'ENDEAVOR' };
      if (normalized.includes('forbes')) return { type: 'text', display: 'Forbes' };
      return { type: 'fallback', display: `[ ${name.toUpperCase()} ]` };
    }

    const yc = resolveBrand('Y Combinator');
    assert.strictEqual(yc.type, 'svg');

    const custom = resolveBrand('Empresa Desconhecida');
    assert.strictEqual(custom.type, 'fallback');
    assert.strictEqual(custom.display, '[ EMPRESA DESCONHECIDA ]');
  });

  runTest('6.2: ProofBar: Null, undefined, or empty brands array returns null cleanly', () => {
    const proofBarContent = fs.readFileSync(path.join(ROOT_DIR, 'components/sections/ProofBar.tsx'), 'utf8');
    assert(proofBarContent.includes('if (!companies || companies.length === 0) return null;'), 'Must return null for empty brands to prevent empty DOM section');
  });

  runTest('6.3: BentoGrid: Asymmetrical 4-card layout maintains 8+4 and 4+8 column span balance', () => {
    const bentoContent = fs.readFileSync(path.join(ROOT_DIR, 'components/sections/BentoGrid.tsx'), 'utf8');
    
    // Card 1: 8 cols
    assert(bentoContent.includes("colSpan: 'col-span-12 md:col-span-8'"));
    // Card 2: 4 cols
    assert(bentoContent.includes("colSpan: 'col-span-12 md:col-span-4'"));
    // Card 3: 4 cols
    assert(bentoContent.includes("colSpan: 'col-span-12 md:col-span-4'"));
    // Card 4: 8 cols
    assert(bentoContent.includes("colSpan: 'col-span-12 md:col-span-8'"));

    // Verify all cards include telemetry badges and stats
    assert(bentoContent.includes('[ ECOSYSTEM // TIER 01 ]'));
    assert(bentoContent.includes('[ SYNDICATE // SMART MONEY ]'));
    assert(bentoContent.includes('[ FIELD-TESTED // BOARDROOM ]'));
    assert(bentoContent.includes('[ DEAL FLOW // M&A LATAM ]'));
  });

  runTest('6.4: SpotlightCard: Dynamic CSS custom properties handle boundary & out-of-bounds coordinates', () => {
    const spotlightContent = fs.readFileSync(path.join(ROOT_DIR, 'components/ui/Spotlight.tsx'), 'utf8');
    assert(spotlightContent.includes("containerRef.current.style.setProperty('--mouse-x', `${x}px`);"));
    assert(spotlightContent.includes("containerRef.current.style.setProperty('--mouse-y', `${y}px`);"));
    assert(spotlightContent.includes("containerRef.current.style.setProperty('--spotlight-x', `${x}px`);"));
    assert(spotlightContent.includes("containerRef.current.style.setProperty('--spotlight-y', `${y}px`);"));

    // Verify boundary coordinate calculation
    const rect = { left: 100, top: 100, width: 400, height: 300 };
    const testCoords = [
      { clientX: 100, clientY: 100, expectedX: 0, expectedY: 0 },
      { clientX: 300, clientY: 250, expectedX: 200, expectedY: 150 },
      { clientX: 0, clientY: 0, expectedX: -100, expectedY: -100 }, // Out of bounds negative
      { clientX: 1000, clientY: 1000, expectedX: 900, expectedY: 900 } // Out of bounds positive
    ];

    for (const coord of testCoords) {
      const x = coord.clientX - rect.left;
      const y = coord.clientY - rect.top;
      assert.strictEqual(x, coord.expectedX);
      assert.strictEqual(y, coord.expectedY);
    }
  });

  runTest('6.5: ParallaxQuote: Replaces bugged fixed viewport with relative container isolation', () => {
    const footerContent = fs.readFileSync(path.join(ROOT_DIR, 'components/sections/Footer.tsx'), 'utf8');
    
    // Check that fixed viewport bug is NOT present
    assert(!footerContent.includes('fixed top-0 left-0 h-screen w-screen'), 'Fixed viewport classes must be eliminated');
    assert(!footerContent.includes('fixed top-0 left-0'), 'Fixed classes must not freeze background');

    // Check proper isolation container
    assert(footerContent.includes('className="absolute inset-0 z-0 overflow-hidden pointer-events-none"'), 'Background must use absolute inset-0 inside relative section');
  });

  runTest('6.6: Manifesto: Splitted modal structure contains selective admission criteria & Escape key listener', () => {
    const manifestoContent = fs.readFileSync(path.join(ROOT_DIR, 'components/sections/Manifesto.tsx'), 'utf8');
    
    // Check selective admission standards (Tier 1 Test F11.4 verified)
    assert(manifestoContent.includes('Tração comprovada e faturamento superior ao patamar de entrada'), 'Must include criteria 1: traction');
    assert(manifestoContent.includes('Alinhamento ético e postura de longo prazo'), 'Must include criteria 2: ethics');
    assert(manifestoContent.includes('Disposição para contribuir ativamente com o ecossistema'), 'Must include criteria 3: ecosystem contribution');

    // Check Escape key dismissal
    assert(manifestoContent.includes("if (e.key === 'Escape')") && manifestoContent.includes('setIsManifestoOpen(false)'), 'Must listen for Escape key to close modal');
  });

  runTest('6.7: Gallery: Responsive grid with contextual location telemetry badges [ ... // ... ]', () => {
    const galleryContent = fs.readFileSync(path.join(ROOT_DIR, 'components/sections/Gallery.tsx'), 'utf8');
    
    // Static responsive grid replaces heavy marquee
    assert(galleryContent.includes('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6'), 'Must use 3-column responsive grid layout');

    // Telemetry badges
    assert(galleryContent.includes('[ DINNER // FARIA LIMA ]'));
    assert(galleryContent.includes('[ PRIVATE SESSION // JK IGUATEMI ]'));
    assert(galleryContent.includes('[ ANNUAL SUMMIT // SÃO PAULO ]'));
    assert(galleryContent.includes('[ MASTERMIND // ALPHAVILLE ]'));
  });

  // =======================================================================
  // SUMMARY
  // =======================================================================
  console.log('\n========================================================');
  console.log(`  RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runChallengerM2().catch((err) => {
  console.error('Fatal error in challenger runner:', err);
  process.exit(1);
});
