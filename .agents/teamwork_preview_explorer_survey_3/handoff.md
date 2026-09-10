# Survey Report: Build, Performance & Quality (Explorer 3)

## Executive Summary

The NG Hub React application is a single-page landing page built with React 19, Vite 6, Tailwind CSS, Framer Motion, Zod v4, and Supabase. While the development server boots quickly (74 ms) and `vite build` passes, the codebase suffers from severe architectural, quality, and performance deficits that conflict directly with production readiness and a premium Silicon Valley standard:

1. **TypeScript Health & Strictness**: The project has `strict: false` by default, missing `"strict": true` in `tsconfig.json`. Crucially, `@types/react` and `@types/react-dom` are **completely missing** from `node_modules` and `package.json`, rendering React components and JSX entirely untyped. Furthermore, `npx tsc --noEmit` fails with exit code 2 due to a lack of file exclusion rules (scanning the legacy archive directory `LANDING-PAGE---NG-main`) and missing Vite ambient environment types (`vite-env.d.ts`), resulting in `Property 'env' does not exist on type 'ImportMeta'`.
2. **Missing Quality Tooling**: ESLint, Prettier, unit testing (Vitest/Jest), and E2E testing (Playwright) are entirely absent. There is no `npm run lint` or `npm test` script. The acceptance criterion requirement (`npm run build` with zero TypeScript or Lint errors) is currently deceptive because `npm run build` only runs `vite build`, bypassing type checking and linting entirely.
3. **Severe Bundle Bloat & Broken Lazy Loading**: The production build produces a massive monolithic JavaScript chunk (`index-CfiruHk4.js` at 645.25 kB minified / 191.85 kB gzip), triggering Vite's `>500 kB` chunk warning. The administrative CMS (`AdminPanel.tsx`), the authentication modal (`Login.tsx`), and the entire Google Gemini SDK (`@google/generative-ai`, 410 kB) are statically imported in `App.tsx`, forcing public visitors to download admin and AI dependencies. Additionally, Framer Motion's `LazyMotion` wrapper is rendered ineffective because nearly every component imports `motion` directly from `'framer-motion'`.
4. **Asset Optimization Emergency (155 MB in `public/`)**: The `public/` directory contains 10 uncompressed camera JPEGs totaling **155 Megabytes** (e.g. `NG-141.jpg` is 17.6 MB, `NG-149.jpg` is 21.0 MB). The hero section and parallax quote load this 17.6 MB image directly, and the gallery renders 24 instances of these images in an infinite animated marquee, leading to catastrophic LCP (Largest Contentful Paint) metrics and extreme memory pressure.
5. **Security, Env & Runtime Risks**: The actual `.env` file containing Supabase credentials is committed to Git (`git ls-files .env` tracks it), while `.env` is omitted from `.gitignore` and no root `.env.example` exists. The application emits a runtime `console.warn("Missing Gemini API Key")` on every page load because `services/gemini.ts` runs at top-level upon importing `AdminPanel`. Furthermore, `?admin=true` in the URL query string grants immediate unauthenticated admin access in `App.tsx`.

---

## 1. Observation

### 1.1 Toolchain & Package Dependencies
- **`package.json` (`/Users/arthurdemoraespd/Documents/nghub-lp/package.json`)**:
  - `scripts`: Only `"dev": "vite"`, `"build": "vite build"`, and `"preview": "vite preview"` exist (lines 6-10). There are no scripts for `lint`, `typecheck`, `test`, or `test:e2e`.
  - `dependencies`:
    - `"@google/generative-ai": "^0.24.1"`
    - `"@supabase/supabase-js": "^2.91.0"`
    - `"framer-motion": "^12.28.1"`
    - `"lucide-react": "^0.562.0"`
    - `"react": "^19.2.3"`
    - `"react-dom": "^19.2.3"`
    - `"zod": "^4.6.1"`
  - `devDependencies`:
    - `"@types/node": "^22.14.0"`
    - `"@vitejs/plugin-react": "^5.0.0"`
    - `"autoprefixer": "^10.4.24"`
    - `"postcss": "^8.5.6"`
    - `"tailwindcss": "^3.4.19"`
    - `"typescript": "~5.8.2"`
    - `"vite": "^6.2.0"`
  - **Defect**: `@types/react` and `@types/react-dom` are completely missing. Inspection of `node_modules/@types` confirmed only `babel__*`, `estree`, `node`, `phoenix`, and `ws` are installed.

### 1.2 TypeScript Configuration (`tsconfig.json`)
- **File**: `/Users/arthurdemoraespd/Documents/nghub-lp/tsconfig.json`
- **Settings**:
  - `"target": "ES2022"`, `"module": "ESNext"`, `"moduleResolution": "bundler"`, `"jsx": "react-jsx"`, `"isolatedModules": true`, `"noEmit": true`.
  - `"strict": true` is **absent**.
  - `"types": ["node"]` (lines 13-15) explicitly limits types to Node.js, omitting `"vite/client"`.
  - `"include"` and `"exclude"` are **absent**.

### 1.3 Vite Configuration (`vite.config.ts`)
- **File**: `/Users/arthurdemoraespd/Documents/nghub-lp/vite.config.ts`
- Lines 13-16:
  ```ts
  define: {
    'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
  }
  ```
- **Defect**: Uses legacy `process.env` definitions rather than Vite standard `import.meta.env.VITE_*`. There is no `build.rollupOptions.output.manualChunks` configuration, no bundle visualization, and no chunk size optimization.

### 1.4 Verification of Build & Type Checking Commands
- **Command: `npm run build`**:
  - Exited with code 0 in 1.60s.
  - Verbatim Output:
    ```
    vite v6.4.1 building for production...
    Browserslist: browsers data (caniuse-lite) is 8 months old.
    node_modules/zod/v4/core/util.js (400:0): A comment ... contains an annotation that Rollup cannot interpret...
    node_modules/zod/v4/core/regexes.js (72:0): A comment ... contains an annotation that Rollup cannot interpret...
    ✓ 2252 modules transformed.
    dist/index.html                           2.19 kB │ gzip:   0.88 kB
    dist/assets/index-B2im8f1O.css           38.71 kB │ gzip:   6.91 kB
    dist/assets/SectionHeading-BU2qgseb.js    0.95 kB │ gzip:   0.52 kB
    dist/assets/Gallery-C2ERo2Aj.js           2.61 kB │ gzip:   1.22 kB
    dist/assets/Arsenal-xo5wFZAY.js           2.64 kB │ gzip:   1.35 kB
    dist/assets/Footer-Pn14VO0h.js            2.76 kB │ gzip:   1.30 kB
    dist/assets/index-CfiruHk4.js           645.25 kB │ gzip: 191.85 kB

    (!) Some chunks are larger than 500 kB after minification.
    ```
- **Command: `npx tsc --noEmit`**:
  - Exited with code 2 (FAILED).
  - Verbatim Error:
    ```
    LANDING-PAGE---NG-main/LANDING-PAGE---NG-main/hooks/useAnalytics.ts(2,21): error TS2307: Cannot find module 'react-ga4' or its corresponding type declarations.
    ```
- **Command: `npx tsc --noEmit` on root files**:
  - Exited with code 2 (FAILED).
  - Verbatim Errors:
    ```
    services/gemini.ts(3,29): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
    services/supabase.ts(3,34): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
    services/supabase.ts(4,39): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
    ```
- **Command: `npx tsc --noEmit --strict` on root files**:
  - Exited with code 2 (FAILED).
  - Verbatim Errors:
    - `error TS7016: Could not find a declaration file for module 'react'. ... Try npm i --save-dev @types/react`
    - `error TS7016: Could not find a declaration file for module 'react-dom/client'. ... Try npm i --save-dev @types/react-dom`
    - `error TS7026: JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.`
    - `components/ui/MarqueeColumn.tsx(12,5): error TS7031: Binding element 'images' implicitly has an 'any' type.`
    - `components/ui/SectionHeading.tsx(12,5): error TS7031: Binding element 'title' implicitly has an 'any' type.`
    - `components/ui/WeaponCard.tsx(5,80): error TS7031: Binding element 'icon' implicitly has an 'any' type.`

### 1.5 Static Analysis of Public Assets (`/Users/arthurdemoraespd/Documents/nghub-lp/public`)
- Directory listing and sizes:
  - `NG-141.jpg`: 17,601,922 bytes (17.6 MB)
  - `NG-149.jpg`: 21,030,174 bytes (21.0 MB)
  - `NG-355.jpg`: 16,632,394 bytes (16.6 MB)
  - `NG-392.jpg`: 15,830,037 bytes (15.8 MB)
  - `NG-531.jpg`: 17,533,470 bytes (17.5 MB)
  - `NG-599.jpg`: 17,091,361 bytes (17.1 MB)
  - `NG-607.jpg`: 14,618,127 bytes (14.6 MB)
  - `NG-863 (1).jpg`: 8,643,285 bytes (8.6 MB)
  - `NG-873.jpg`: 11,002,895 bytes (11.0 MB)
  - `NG-895 (1).jpg`: 15,111,137 bytes (15.1 MB)
- **Total Asset Weight**: **155,064,802 bytes (~155 MB)**.
- All 155 MB are copied verbatim into `dist/` upon build.
- `index.html` references `<meta property="og:image" content="/og-image.jpg" />`, but `/og-image.jpg` does not exist in `public/`.

### 1.6 Component Code & Architecture Analysis
- **`App.tsx`**:
  - Line 7: `import { AdminPanel } from './components/AdminPanel';` (static import)
  - Line 8: `import { Login } from './components/admin/Login';` (static import)
  - Lines 41-45:
    ```ts
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAuthenticated(true);
      setIsAdminOpen(true);
    }
    ```
  - Lines 91-216: Wraps the app in `<LazyMotion features={domAnimation}>`, but child components bypass it.
- **`services/gemini.ts`**:
  - Lines 3-11:
    ```ts
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    let genAI: GoogleGenerativeAI | null = null;
    if (API_KEY) {
      genAI = new GoogleGenerativeAI(API_KEY);
    } else {
      console.warn("Missing Gemini API Key");
    }
    ```
    Because `AdminPanel` imports `gemini.ts`, this warning executes on initial render for all visitors.
- **`services/supabase.ts`**:
  - Lines 81-83: `getSiteConfig` returns `{ data: null, error: null }` (mocked stub).
  - Lines 90-92: `saveSiteConfig` returns `{ error: null }` (mocked stub).
- **`hooks/useSiteConfig.ts`**:
  - Lines 15-20: Supabase loading is completely commented out (`const remoteConfig = null;`), falling back solely to `localStorage`.
- **`components/sections/Hero.tsx`**:
  - Line 67: `<img src={images.hero} ... />` renders `/NG-141.jpg` (17.6 MB) with no responsive `srcset`, no WebP format, and no dimension hints.
- **`components/sections/Footer.tsx`**:
  - Line 15: `onError={(e) => e.currentTarget.src = 'https://placehold.co/1920x1080/1a1a1a/FFF?text=No+Image'}` relies on an unpinned third-party image service.
  - Line 16: Uses `fixed top-0 left-0 h-screen w-screen pointer-events-none` inside a section.
- **Framer Motion Imports**:
  - `Footer.tsx` (line 2), `AdminPanel.tsx` (line 3), `Login.tsx` (line 2), `Manifesto.tsx` (line 2), `MarqueeColumn.tsx` (line 2), `WeaponCard.tsx` (line 2), and `SectionHeading.tsx` (line 2) all import `{ motion }` directly from `'framer-motion'`, bypassing `LazyMotion` and inflating the main bundle.

### 1.7 Git and Secret Tracking
- **Git Status**:
  - `git ls-files .env` returns `.env`.
  - `.gitignore` lines 10-14 list `node_modules`, `dist`, `dist-ssr`, `*.local`. `.env` is NOT ignored.
  - `.env` contains live Supabase connection parameters (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - Root directory has no `.env.example`.

---

## 2. Logic Chain

1. **Missing `@types/react` → False Sense of Type Safety**:
   Because `@types/react` and `@types/react-dom` are omitted, TypeScript falls back to treating `react` and `react/jsx-runtime` as `any` under `strict: false`. Any component property mismatches, hook misuse, or invalid JSX elements go completely undetected during build. Once `strict: true` is enabled, the compiler fails with dozens of TS7016 and TS7026 errors.

2. **Unconfigured `tsconfig.json` & Missing Types → Broken `tsc`**:
   `tsconfig.json` lacks `"exclude": ["node_modules", "dist", "LANDING-PAGE---NG-main"]`. When `tsc --noEmit` runs, it scans the archived codebase in `LANDING-PAGE---NG-main`, which attempts to import `react-ga4` (an uninstalled library), crashing the build. Additionally, because `"types": ["node"]` overrides default type inclusions and `vite-env.d.ts` is missing, `import.meta.env` has no type declarations, generating TS2339 errors on root service files.

3. **Static Imports of Admin Modules → Main Bundle Bloat & Unwanted Console Warnings**:
   In `App.tsx`, `AdminPanel` and `Login` are statically imported. `AdminPanel` imports `gemini.ts`, which imports `@google/generative-ai`. Consequently, 410 kB of Gemini SDK code and 22.4 kB of admin code are compiled directly into `index-CfiruHk4.js` (totaling 645.25 kB). Furthermore, evaluating `gemini.ts` on page load immediately triggers `console.warn("Missing Gemini API Key")` for every public user.

4. **155 MB of Uncompressed Photos → Catastrophic Real-World Performance**:
   Ten raw photographic files totaling 155 MB exist in `public/` and are copied directly into `dist/`. The LCP image for the Hero section (`/NG-141.jpg`) is 17.6 MB. On mobile or typical broadband connections, downloading this single image introduces multi-second delays. The gallery triples these images and animates them continuously, forcing the browser to decode gigabytes of texture memory, leading to frame drops and high battery drain.

5. **`?admin=true` Parameter → Broken Authorization Model**:
   `App.tsx` reads `window.location.search` and unconditionally sets `isAuthenticated(true)` and `setIsAdminOpen(true)` if `?admin=true` is present. This bypasses Supabase authentication entirely on the client, exposing admin controls to anyone who appends the query parameter.

6. **Untracked Environment Configuration → Deployment Fragility & Security Leak**:
   Committing `.env` to Git leaks project endpoints and keys to source control. Because `.env.example` is absent, new developers or CI/CD pipelines have no template for configuring required environment variables.

---

## 3. Caveats

1. **Air-Gapped Sandbox Network**: Outbound external network access is blocked in this container environment. Remote HTTP calls (e.g. Supabase API resolution to `lefcrjhxpanuorogqlzb.supabase.co`) fail with DNS `ENOTFOUND`. The active operational status of the remote Supabase project could not be tested over the wire, but code analysis of client operations was completed in full.
2. **Read-Only Investigation Scope**: Per agent instructions, no source code or configuration files were modified during this investigation. All findings reflect the exact current state of the repository.
3. **Legacy Archive (`LANDING-PAGE---NG-main`)**: This folder appears to be an unzipped source backup. While ignored by Git, it resides in the workspace and directly breaks `tsc --noEmit`. Deleting or excluding this folder in `tsconfig.json` is necessary.

---

## 4. Conclusion

The application is functional in development mode but is far from production-ready. To achieve the required "Silicon Valley" standard of excellence and satisfy the project's acceptance criteria, the following structured refactoring must take place:

### Actionable Overhaul Roadmap

#### A. Toolchain & Strict Type Safety
1. Install missing type definitions: `npm i -D @types/react@^19.0.0 @types/react-dom@^19.0.0`.
2. Add `vite-env.d.ts` to the project root with `/// <reference types="vite/client" />` and explicit typing for `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_GEMINI_API_KEY`.
3. Update `tsconfig.json`:
   - Enable `"strict": true`.
   - Update `"types": ["node", "vite/client"]`.
   - Add `"include": ["*.ts", "*.tsx", "components/**/*", "services/**/*", "hooks/**/*", "utils/**/*", "vite-env.d.ts"]`.
   - Add `"exclude": ["node_modules", "dist", "LANDING-PAGE---NG-main"]`.
4. Update `package.json` scripts:
   - `"build": "tsc -b && vite build"`
   - `"typecheck": "tsc --noEmit"`
   - `"lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"`

#### B. Linting & Quality Infrastructure
1. Install ESLint flat config packages: `npm i -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh`.
2. Configure `eslint.config.js` to enforce React 19 rules, hook dependencies, and prevent untyped `any` leaks.

#### C. Code Splitting & Bundle Optimization
1. In `App.tsx`, convert `AdminPanel` and `Login` to dynamic `React.lazy` imports wrapped in `<Suspense fallback={null}>`.
2. Ensure `services/gemini.ts` is only dynamically imported when an admin explicitly triggers an AI action in `AdminPanel`.
3. Remove the top-level `console.warn("Missing Gemini API Key")` execution on module evaluation; guard it inside function invocations.
4. Normalize all Framer Motion components to use `m` from `'framer-motion'` instead of `motion` to leverage `LazyMotion` properly.
5. In `vite.config.ts`, configure `build.rollupOptions.output.manualChunks`:
   ```ts
   manualChunks: {
     'vendor-react': ['react', 'react-dom'],
     'vendor-motion': ['framer-motion'],
     'vendor-supabase': ['@supabase/supabase-js'],
     'vendor-zod': ['zod']
   }
   ```
   This will bring the initial landing page bundle well below 150 kB minified.

#### D. Asset Optimization & Web Vitals
1. Compress and convert all 10 images in `public/` into optimized modern WebP/AVIF formats.
   - Resize hero and gallery images to appropriate display dimensions (e.g. 1920px max width for desktop, 800px for mobile).
   - Expected size reduction: from **155 MB down to < 2.5 MB total** (98% reduction).
2. Fix filenames: Rename `NG-863 (1).jpg` and `NG-895 (1).jpg` to remove spaces and parentheses (e.g., `ng-863.webp`, `ng-895.webp`).
3. Create a dedicated `og-image.jpg` (1200x630px) in `public/` to fix OpenGraph social link previews.
4. Self-host or optimize Google Fonts (`Inter`, `Cinzel`, `Playfair Display`) or migrate to modern system/tech typography (such as Geist / Inter / SF Pro) as required by the aesthetic redesign.

#### E. Test Infrastructure (E2E & Unit)
1. **Unit Testing**:
   - Install `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, and `jsdom`.
   - Add unit tests for `LeadForm.tsx` (Zod validation, Portuguese error messages, submission state) and `formatUtils.ts` (phone number masking).
2. **E2E Testing**:
   - Install `@playwright/test`.
   - Create tests covering the full user flow: Page render, Section navigation, Lead form submission success, and Admin panel modal authentication.

#### F. Security & Configuration
1. Remove `.env` from Git tracking (`git rm --cached .env`) and add `.env`, `.env.*.local` to `.gitignore`.
2. Create `.env.example` documenting `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_GEMINI_API_KEY`.
3. Eliminate the insecure `?admin=true` backdoor from `App.tsx` and enforce genuine Supabase auth sessions for administrative functions.

---

## 5. Verification Method

To independently reproduce and verify the findings in this report, execute the following commands in the workspace root (`/Users/arthurdemoraespd/Documents/nghub-lp`):

1. **Verify Bundle Size & Warnings**:
   ```bash
   npm run build
   ```
   *Expected Output*: Vite builds `dist/assets/index-CfiruHk4.js` at 645.25 kB and warns that chunks exceed 500 kB.

2. **Verify TypeScript Failure on Codebase**:
   ```bash
   npx tsc --noEmit
   ```
   *Expected Output*: Exits with code 2, failing on `LANDING-PAGE---NG-main/.../useAnalytics.ts` with `error TS2307: Cannot find module 'react-ga4'`.

3. **Verify Missing React Types & Strict Mode Violations**:
   ```bash
   npx tsc --noEmit --strict --target ES2022 --module ESNext --moduleResolution bundler --jsx react-jsx --skipLibCheck App.tsx index.tsx
   ```
   *Expected Output*: Fails with `error TS7016: Could not find a declaration file for module 'react'` and `error TS7026: JSX element implicitly has type 'any'`.

4. **Verify Missing Types in `node_modules`**:
   ```bash
   ls node_modules/@types
   ```
   *Expected Output*: Contains only `node`, `ws`, `phoenix`, `babel__*`, `estree`. `@types/react` is missing.

5. **Verify Huge Asset Sizes in `public/`**:
   ```bash
   ls -lh public/*.jpg
   ```
   *Expected Output*: Shows 10 files ranging between 8.6 MB and 21.0 MB each (~155 MB total).

6. **Verify Git Tracking of `.env`**:
   ```bash
   git ls-files .env
   ```
   *Expected Output*: Prints `.env`, proving the secret file is currently tracked by Git.

7. **Verify Invalidation Condition**:
   This report will be considered resolved and invalidated once:
   - `npm run build` runs `tsc -b && vite build` and exits with code 0 without chunk warnings.
   - All 155 MB of raw photos are replaced by compressed WebP/AVIF images (< 3 MB total).
   - `@types/react` is installed and `tsc --noEmit --strict` passes with 0 errors.
   - Vitest and Playwright test suites execute and pass.
