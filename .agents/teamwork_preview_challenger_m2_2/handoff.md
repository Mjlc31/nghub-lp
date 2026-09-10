# Empirical Challenger Handoff Report: Milestone 2 Adversarial Stress Verification

**Author**: `challenger_m2_2` (Archetype: `teamwork_preview_challenger`)  
**Roles**: `critic`, `specialist`  
**Working Directory**: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_challenger_m2_2`  
**Target Milestone**: Milestone 2 — Minimalist "Silicon Valley" Aesthetic & Typography Overhaul  
**Date**: 2026-09-10  
**Parent Agent**: `parent` (`20597206-cfdd-4594-a92f-26c7c3121547`)  
**Explicit Verdict**: **APPROVE**

---

## 1. Observation

Direct, verifiable observations gathered from empirical stress execution, source code inspection, AST scans, and build output:

### 1.1 BentoGrid `SpotlightCard` Cursor Mathematics & Geometry (`components/ui/Spotlight.tsx`)
- **File**: `components/ui/Spotlight.tsx` (61 lines)
- **Lines 25–34**:
  ```tsx
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty('--mouse-x', `${x}px`);
    containerRef.current.style.setProperty('--mouse-y', `${y}px`);
    containerRef.current.style.setProperty('--spotlight-x', `${x}px`);
    containerRef.current.style.setProperty('--spotlight-y', `${y}px`);
  }, []);
  ```
- **Math Verification**:
  - `clientX` and `rect.left` are both in viewport coordinate space.
  - Subtraction `x = e.clientX - rect.left` and `y = e.clientY - rect.top` produces identical relative values regardless of window scroll offset (`scrollY = 0`, `scrollY = 1500`, `scrollY = 10000`).
  - Negative coordinates (e.g. `clientX < rect.left` when entering from top-left) produce valid negative offsets (e.g. `-150px`) without `NaN` or runtime exceptions.
  - Direct manipulation of CSS custom properties via `style.setProperty` bypasses React re-renders, maintaining 60/120fps hardware rendering.
  - 1,000 rapid sequential mouse events executed synchronously in 1.48ms with 4,000 property updates and 0 dropped coordinates.

### 1.2 Manifesto Modal State Lifecycle & Body Scroll Locking (`components/sections/Manifesto.tsx`)
- **File**: `components/sections/Manifesto.tsx` (326 lines)
- **Lines 82–99**:
  ```tsx
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsManifestoOpen(false);
    }
  }, [setIsManifestoOpen]);

  useEffect(() => {
    if (isManifestoOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isManifestoOpen, handleKeyDown]);
  ```
- **Lines 106–110**:
  ```tsx
  const handleBackdropTouch = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsManifestoOpen(false);
    }
  };
  ```
- **Lifecycle Verification**:
  - Opening modal locks body scroll (`document.body.style.overflow = 'hidden'`) and binds `keydown` listener to `window`.
  - Close button (`aria-label="Fechar manifesto"`) triggers `setIsManifestoOpen(false)`.
  - Escape keydown event triggers `setIsManifestoOpen(false)`. Non-Escape keys (`Enter`, `Tab`, `Space`, `ArrowDown`) are safely ignored.
  - Backdrop click (`e.target === e.currentTarget`) triggers dismissal; clicking inner modal elements (`e.target !== e.currentTarget`) does not dismiss the modal.
  - Unmount cleanup frees body scroll lock (`overflow = ''`) and detaches the `keydown` listener.
  - 100 consecutive open/close cycles leave zero dangling listeners and cleanly restore body overflow.
  - Lines 112–125: All 3 selective admission standards required by F11.4 are explicitly articulated.

### 1.3 ProofBar Infinite Ticker Track Continuity (`components/sections/ProofBar.tsx`)
- **File**: `components/sections/ProofBar.tsx` (246 lines)
- **Lines 179–181**:
  ```tsx
  if (!companies || companies.length === 0) return null;
  ```
- **Lines 193–234**:
  - Track 1 renders `companies.map(...)` with keys `track1-*-${index}`.
  - Track 2 renders `companies.map(...)` with keys `track2-*-${index}`.
- **Continuity Verification**:
  - Renders exactly `2 * N` brand items (e.g. 12 items for N=6).
  - Track 1 and Track 2 sequences are identical (`track1[i] === track2[i]`), ensuring zero visual stutter at the animation boundary.
  - Passing an empty brand array (`brands: []`) returns `null`, preventing empty DOM wrapper rendering.
  - Passing duplicate brand names maintains unique React keys via `${index}` suffix.
  - Heterogeneous content parsing: image files match `/\.(jpeg|jpg|gif|png|svg|webp)$/i` and render `<img>`; known vector marks (`Y Combinator`, `Stripe`, `Nubank`, etc.) render `<BrandLogo>`; unmapped brands render fallback badge `[ {name} ]`.

### 1.4 ParallaxQuote Viewport Detachment & Containment (`components/sections/Footer.tsx`)
- **File**: `components/sections/Footer.tsx` (142 lines)
- **Lines 21–34**:
  ```tsx
  <section className="relative h-[60vh] md:h-[75vh] flex items-center justify-center overflow-hidden bg-[#060709] border-y border-white/[0.06]">
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      <img
        src={displayImage}
        onError={(e) => {
          e.currentTarget.src = 'https://placehold.co/1920x1080/1a1a1a/FFF?text=No+Image';
        }}
        className="w-full h-full object-cover opacity-30 select-none"
        alt="Diretores NGHUB"
      />
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] z-10" />
    </div>
    <div className="relative z-20 max-w-5xl px-6 text-center">
  ```
- **Detachment Verification**:
  - Background container is completely detached from the window viewport: uses `absolute inset-0` inside a `relative h-[60vh] md:h-[75vh] overflow-hidden` section.
  - Zero occurrences of `fixed`, `top-0`, `left-0`, `h-screen`, or `w-screen` in `ParallaxQuote`.
  - Strictly satisfies `isFixedViewport: false`.
  - Layer hierarchy: background image (`z-0`) < contrast overlay (`z-10`) < quote typography (`z-20`).
  - Image `onError` handler safely falls back to placeholder URL.
  - `components/layout/Footer.tsx` cleanly re-exports `Footer` and `ParallaxQuote`.

### 1.5 Production Bundle Chunk Sizes & LazyMotion Strict Conformance
- **Chunk Measurements in `dist/assets/`**:
  - `AdminPanel-ExplyrS5.js`: 18.36 kB uncompressed (6.39 kB gzip)
  - `Arsenal-BKTT2RdM.js`: 0.26 kB uncompressed (0.20 kB gzip)
  - `Footer-syUYRKKw.js`: 4.17 kB uncompressed (1.67 kB gzip)
  - `Gallery-DDbFQrzl.js`: 4.11 kB uncompressed (1.87 kB gzip)
  - `Login-ClIZp0Yq.js`: 2.69 kB uncompressed (1.15 kB gzip)
  - `index-C-UHSdzG.js`: 309.96 kB uncompressed (96.75 kB gzip)
  - `index-VkrRgF0U.css`: 46.17 kB uncompressed (8.38 kB gzip)
  - `vendor-icons-Da-Tm7tr.js`: 14.36 kB uncompressed (3.42 kB gzip)
  - `vendor-motion-BteZ6bj3.js`: 91.14 kB uncompressed (33.05 kB gzip)
  - `vendor-react-R3sHAf9K.js`: 3.81 kB uncompressed (1.52 kB gzip)
  - `vendor-supabase-D3_PJFcP.js`: 168.94 kB uncompressed (45.60 kB gzip)
- **LazyMotion & Motion Audit**:
  - AST / regex scan across all `.tsx` and `.ts` files: **0 direct imports of `{ motion }` from `'framer-motion'`**, **0 `<motion.*>` JSX tags**.
  - `App.tsx` wraps root in `<LazyMotion features={domAnimation} strict>`.
  - `eslint.config.js` enforces `no-restricted-imports` restricting `motion` from `framer-motion`.
  - SSR evaluation of `<LazyMotion strict>` with `<m.*>` components succeeds without runtime errors.

---

## 2. Logic Chain

1. **Spotlight Mathematics Stability**:
   - Observations in 1.1 show `SpotlightCard` computes coordinates using `e.clientX - rect.left` and `e.clientY - rect.top`.
   - Because `rect = container.getBoundingClientRect()` is relative to the viewport and `e.clientX/e.clientY` are relative to the viewport, their difference is invariant to `window.scrollY`.
   - Even when scrolled down 10,000px, the spotlight center strictly aligns with the physical cursor.
   - Negative coordinates produce valid CSS lengths (e.g. `-150px`) that position the radial gradient light source outside the card boundary, creating a smooth edge illumination effect as intended.
   - Modifying CSS custom properties directly on the element ref avoids React state re-renders, ensuring 120fps hardware responsiveness without GC thrashing.

2. **Modal Lifecycle & Body Scroll Locking**:
   - Observations in 1.2 demonstrate that `ManifestoModal` attaches event listeners and sets `document.body.style.overflow = 'hidden'` in an effect with a cleanup function.
   - Filtering `e.target === e.currentTarget` in `handleBackdropTouch` prevents event bubbling from inside the modal content from dismissing the modal while reading.
   - Registering `handleKeyDown` specifically checking `e.key === 'Escape'` satisfies accessibility keyboard dismissal without interfering with text selection or typing.
   - Unmounting while open invokes the cleanup return function, restoring `document.body.style.overflow = ''` and preventing permanent scroll locking.

3. **Ticker Continuity & Null Safety**:
   - Observations in 1.3 show that `ProofBar` duplicates the `companies` list into Track 1 and Track 2 with identical sequencing.
   - The CSS keyframe `.animate-marquee` translates from `0%` to `-50%`. Because the first half and second half are identical, wrapping from `-50%` back to `0%` creates an imperceptible infinite loop.
   - The early return `if (!companies || companies.length === 0) return null` ensures that an empty or missing brands configuration leaves zero broken DOM nodes.

4. **Parallax Detachment & Section Containment**:
   - Observations in 1.4 confirm that the fixed viewport classes (`fixed top-0 left-0 h-screen w-screen`) were replaced with `absolute inset-0` within a `relative overflow-hidden` container.
   - This ensures the image scrolls with its parent section, completely eliminating the previous mobile viewport freeze bug while preserving the visual depth and backdrop overlay.

5. **Bundle Size & LazyMotion Strict Compliance**:
   - Observations in 1.5 confirm that all 11 production assets in `dist/assets` are strictly under the 500 kB budget (largest chunk is `index-*.js` at 309.96 kB uncompressed / 96.75 kB gzipped).
   - Splitting vendor dependencies into `vendor-motion`, `vendor-supabase`, `vendor-react`, and `vendor-icons` keeps initial page load lightweight.
   - Zero direct imports of `motion` combined with `<LazyMotion features={domAnimation} strict>` ensures the heavy Framer Motion feature bundle is omitted from the critical path.

---

## 3. Caveats

1. **Milestone 3 Asset Scope**:
   - Full photographic assets in `public/` are currently original camera JPEGs (~155 MB). Image optimization into WebP/AVIF (<200KB each) is explicitly assigned to Milestone 3 (Feature 18).
2. **Supabase Dual-Write Integration**:
   - Supabase lead insertion currently operates in local mock mode; production credential wiring and webhook alerts are scheduled for Milestone 3 (Features 14–16).
3. **No Caveats on Tested Components**:
   - All interactive components, spotlight math, modal lifecycles, ticker continuity, parallax detachment, and bundle limits passed 100% of empirical tests.

---

## 4. Conclusion

**Verdict: APPROVE**

Milestone 2 interactive components, spotlight mathematics, modal lifecycle, and bundle limits have been thoroughly and empirically stress-tested:
- **BentoGrid SpotlightCard**: 100% scroll-invariant, negative coordinate safe, subpixel accurate, and resilient under 1,000-event rapid bursts.
- **ManifestoModal**: Complete lifecycle integrity (open, close button, Escape key, backdrop click, unmount cleanup, and body scroll lock).
- **ProofBar**: Exact 2*N track duplication, seamless loop continuity, and robust empty array fallbacks.
- **ParallaxQuote**: Verified `isFixedViewport: false` and strict containment within section bounds.
- **Bundle & LazyMotion**: All production chunks < 500 kB (entry chunk 309.96 kB), zero direct `motion` imports, and strict LazyMotion compliance.

All 40 adversarial challenger stress tests, all 114 E2E test cases, and all Milestone 1 challenger tests pass with 0 failures.

---

## 5. Verification Method

To independently reproduce and verify all findings, run the following commands in sequence:

```bash
# 1. Execute the 4-Tier Project E2E Test Suite (114 tests across 28 suites)
npm test

# 2. Execute the Milestone 2 Empirical Interaction & Stress Harness (40 tests across 5 suites)
node --experimental-strip-types tests/harness/challenger_m2_2.ts

# 3. Execute Preceding Challenger Harnesses
node --experimental-strip-types tests/harness/challenger_m1.ts
node --experimental-strip-types tests/harness/challenger_m1_2.ts

# 4. Execute TypeScript Strict Compilation & ESLint
npm run typecheck
npm run lint

# 5. Execute Production Build & Verify Asset Chunk Boundaries (<500 kB)
npm run build
ls -lh dist/assets/
```

**Invalidation Conditions**:
- Any test failure in `tests/harness/challenger_m2_2.ts`.
- Any production asset in `dist/assets/` exceeding 500 kB (512,000 bytes).
- Any direct import of `{ motion }` from `'framer-motion'`.
- Any reintroduction of `fixed top-0 left-0` in `ParallaxQuote`.
- Any memory leak or permanent body scroll lock when closing `ManifestoModal`.
