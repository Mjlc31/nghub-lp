# Technical Blueprint & Handoff Report: Strict TypeScript, Toolchain & Type Safety (Explorer M1-2)

## Executive Summary
This investigation establishes the exact technical blueprint to eliminate all TypeScript compilation failures, configure strict mode (`"strict": true`), introduce comprehensive environment and component type declarations, and implement quality toolchain scripts (`typecheck`, `lint`) across the NG Hub application.

---

## 1. Observation

### 1.1 Verbatim Toolchain & Dependency Inventory
- **File**: `/Users/arthurdemoraespd/Documents/nghub-lp/package.json`
  - React runtime dependencies (lines 16-17):
    ```json
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    ```
  - Installed version in `/Users/arthurdemoraespd/Documents/nghub-lp/node_modules/react/package.json`: `19.2.4`.
  - Current `devDependencies` (lines 20-28):
    ```json
    "devDependencies": {
      "@types/node": "^22.14.0",
      "@vitejs/plugin-react": "^5.0.0",
      "autoprefixer": "^10.4.24",
      "postcss": "^8.5.6",
      "tailwindcss": "^3.4.19",
      "typescript": "~5.8.2",
      "vite": "^6.2.0"
    }
    ```
  - Current `scripts` (lines 6-10):
    ```json
    "scripts": {
      "dev": "vite",
      "build": "vite build",
      "preview": "vite preview"
    }
    ```
  - **Direct Observation**:
    - `@types/react` and `@types/react-dom` are completely absent from `devDependencies` and `node_modules/@types`.
    - `scripts` lacks `"typecheck"` and `"lint"`.
    - `"build"` only executes `vite build`, bypassing typechecking and linter execution entirely.

### 1.2 Verbatim TypeScript Configuration (`tsconfig.json`)
- **File**: `/Users/arthurdemoraespd/Documents/nghub-lp/tsconfig.json` (29 lines total):
  ```json
  {
    "compilerOptions": {
      "target": "ES2022",
      "experimentalDecorators": true,
      "useDefineForClassFields": false,
      "module": "ESNext",
      "lib": [
        "ES2022",
        "DOM",
        "DOM.Iterable"
      ],
      "skipLibCheck": true,
      "types": [
        "node"
      ],
      "moduleResolution": "bundler",
      "isolatedModules": true,
      "moduleDetection": "force",
      "allowJs": true,
      "jsx": "react-jsx",
      "paths": {
        "@/*": [
          "./*"
        ]
      },
      "allowImportingTsExtensions": true,
      "noEmit": true
    }
  }
  ```
  - **Direct Observation**:
    - `"strict": true` is missing.
    - `"include"` array is missing.
    - `"exclude"` array is missing.
    - `"types"` is restricted to `["node"]`, excluding Vite client ambient definitions (`vite/client`).

### 1.3 Verbatim Compiler Execution & Failure Modes
1. **Unconstrained `tsc` execution**:
   - Command: `npx tsc --noEmit`
   - Exit code: `2`
   - Verbatim error:
     ```
     LANDING-PAGE---NG-main/LANDING-PAGE---NG-main/hooks/useAnalytics.ts(2,21): error TS2307: Cannot find module 'react-ga4' or its corresponding type declarations.
     ```
2. **Missing `vite-env.d.ts` environment errors**:
   - When excluding `LANDING-PAGE---NG-main`:
     ```
     services/gemini.ts(3,29): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
     services/supabase.ts(3,34): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
     services/supabase.ts(4,39): error TS2339: Property 'env' does not exist on type 'ImportMeta'.
     ```
3. **Missing React type definitions and strict mode failures**:
   - Verbatim errors:
     ```
     components/ui/Effects.tsx(4,5): error TS7016: Could not find a declaration file for module 'react/jsx-runtime'.
     components/ui/Effects.tsx(6,9): error TS7026: JSX element implicitly has type 'any' because no interface 'JSX.IntrinsicElements' exists.
     components/ui/MarqueeColumn.tsx(1,19): error TS7016: Could not find a declaration file for module 'react'.
     components/ui/MarqueeColumn.tsx(12,5): error TS7031: Binding element 'images' implicitly has an 'any' type.
     components/ui/MarqueeColumn.tsx(15,5): error TS7031: Binding element 'primaryColor' implicitly has an 'any' type.
     components/ui/SectionHeading.tsx(12,5): error TS7031: Binding element 'title' implicitly has an 'any' type.
     components/ui/SectionHeading.tsx(13,5): error TS7031: Binding element 'subtitle' implicitly has an 'any' type.
     components/ui/SectionHeading.tsx(15,5): error TS7031: Binding element 'primaryColor' implicitly has an 'any' type.
     components/ui/WeaponCard.tsx(5,80): error TS7031: Binding element 'icon' implicitly has an 'any' type.
     components/ui/WeaponCard.tsx(5,86): error TS7031: Binding element 'title' implicitly has an 'any' type.
     components/ui/WeaponCard.tsx(5,93): error TS7031: Binding element 'description' implicitly has an 'any' type.
     components/ui/WeaponCard.tsx(5,106): error TS7031: Binding element 'primaryColor' implicitly has an 'any' type.
     index.tsx(1,19): error TS7016: Could not find a declaration file for module 'react'.
     index.tsx(2,22): error TS7016: Could not find a declaration file for module 'react-dom/client'.
     types.ts(1,19): error TS7016: Could not find a declaration file for module 'react'.
     ```

### 1.4 Codebase Component Interface & Prop Discrepancies
- **`components/ui/MarqueeColumn.tsx:11-16`**:
  Uses `export const MarqueeColumn: React.FC<MarqueeColumnProps> = ({ images, direction = 'up', speed = 20, primaryColor }) => {`. Because React types are uninstalled, `React.FC` resolves as `any`, triggering TS7031 on parameter destructuring.
- **`components/ui/SectionHeading.tsx:11-16`**:
  Uses `export const SectionHeading: React.FC<SectionHeadingProps> = ({ title, subtitle, align = 'center', primaryColor }) => (`. Triggers TS7031 on parameter destructuring.
- **`components/ui/WeaponCard.tsx:5`**:
  Uses `export const WeaponCard: React.FC<PillarProps & { primaryColor: string }> = ({ icon, title, description, primaryColor }) => (`. Inline intersection on `React.FC` triggers TS7031.
- **`components/ui/Effects.tsx:12`**:
  `export const AmbientLight = ({ primaryColor }: { primaryColor: string }) => (` uses inline type instead of named interface.
- **`components/admin/ImageControl.tsx:56,65`**:
  `SectionTitle` and `InputGroup` use inline parameter typing (`{ children }: { children?: React.ReactNode }`, `{ label, children }: { label: string, children?: React.ReactNode }`).
- **`components/AdminPanel.tsx:29-34` & `App.tsx:109`**:
  `App.tsx:109` passes `onLogout={handleLogout}` to `<AdminPanel>`, but `AdminPanelProps` does not declare `onLogout`.
- **`components/LeadForm.tsx:136,188`**:
  Uses `catch (error: any)` and `catch (err: any)`. `InputField` (line 21) and `SelectField` (line 61) use inline anonymous prop types.
- **`services/supabase.ts:52,62,70,81,90`**:
  Services return `{ data: any; error: any }`. `saveSiteConfig` has unused parameter `config: SiteConfig`.
- **`hooks/useSiteConfig.ts:49`**:
  Uses `saveSiteConfig(newConfig as any)`.

---

## 2. Logic Chain

1. **Missing `@types/react` & `@types/react-dom` in `package.json` (Observation 1.1)**:
   TypeScript cannot find type definitions for `'react'`, `'react-dom/client'`, and `'react/jsx-runtime'` (TS7016). Consequently, `React.FC`, `React.ReactNode`, and JSX intrinsics (TS7026) are untyped, propagating `any` across every component.
2. **Missing `exclude` in `tsconfig.json` (Observation 1.2 & 1.3.1)**:
   By default, `tsc` scans the root directory and all subdirectories. It crawls `LANDING-PAGE---NG-main` (an unzipped legacy backup), which imports `react-ga4` (uninstalled in the root project), causing `tsc --noEmit` to abort immediately with exit code 2.
3. **Missing `types: ["vite/client"]` & `vite-env.d.ts` (Observation 1.2 & 1.3.2)**:
   `services/gemini.ts` and `services/supabase.ts` consume `import.meta.env.*`. In the absence of Vite's ambient client types and a root `vite-env.d.ts`, TypeScript raises TS2339 because the standard `ImportMeta` interface has no `env` member.
4. **Reliance on `React.FC` with Destructuring (Observation 1.4)**:
   Using `const Component: React.FC<Props> = ({ a, b }) => ...` relies on contextually typed parameters from `React.FC`. When `@types/react` is missing or when strict type checking runs without strict function parameter inference, parameter bindings default to implicit `any` (TS7031). Replacing this pattern with explicit typed parameter signatures (`const Component = ({ a, b }: Props): React.JSX.Element => ...`) eliminates TS7031 deterministically and complies with modern React 19 standards.
5. **Missing `onLogout` in `AdminPanelProps` (Observation 1.4)**:
   `App.tsx` line 109 passes `onLogout={handleLogout}`. Once strict mode is active and `@types/react` is installed, TypeScript will raise a prop mismatch error if `onLogout` is omitted from `AdminPanelProps`.
6. **False Sense of Green Builds in `package.json` (Observation 1.1)**:
   `npm run build` currently invokes only `vite build`, which strips TypeScript without type validation via esbuild. Adding `"typecheck": "tsc --noEmit"` and amending `"build": "tsc --noEmit && vite build"` ensures that type regressions fail the CI/build pipeline.

---

## 3. Caveats

1. **Read-Only Explorer Scope**: No project files or source code were edited during this investigation. All blueprints are delivered as complete specifications in this report.
2. **Offline Container Environment**: The sandbox environment lacks public internet egress. When Milestone 1 implementers run `npm install`, npm must either install from existing cache/offline tarballs or add entries to `package.json` directly if `node_modules` is populated.
3. **Co-existence with Milestone 1 Modularization**: The `tsconfig.json` `"include"` pattern specified in this blueprint covers both the current root component layout (`components/**/*`, `hooks/**/*`) and the planned target `src/**/*` layout, ensuring zero compilation disruptions during or after modularization.

---

## 4. Conclusion & Actionable Technical Blueprint

### Blueprint 1: Additions to `package.json`

#### 1.1 Missing `@types` Packages
Add `@types/react` and `@types/react-dom` under `devDependencies`:
```json
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.0.10",
    "@types/react-dom": "^19.0.4",
    "@vitejs/plugin-react": "^5.0.0",
    "autoprefixer": "^10.4.24",
    "eslint": "^9.20.0",
    "@eslint/js": "^9.20.0",
    "typescript-eslint": "^8.24.0",
    "eslint-plugin-react-hooks": "^5.1.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "postcss": "^8.5.6",
    "tailwindcss": "^3.4.19",
    "typescript": "~5.8.2",
    "vite": "^6.2.0"
  }
```

#### 1.2 NPM Scripts Definition
Update `scripts` in `/Users/arthurdemoraespd/Documents/nghub-lp/package.json`:
```json
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "preview": "vite preview"
  }
```

---

### Blueprint 2: Complete `tsconfig.json` Configuration

Replace `/Users/arthurdemoraespd/Documents/nghub-lp/tsconfig.json` with the following complete, strict configuration:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "skipLibCheck": true,
    "types": [
      "node",
      "vite/client"
    ],
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "allowJs": true,
    "esModuleInterop": true,
    "paths": {
      "@/*": [
        "./*",
        "./src/*"
      ]
    }
  },
  "include": [
    "src/**/*",
    "*.ts",
    "*.tsx",
    "components/**/*",
    "config/**/*",
    "hooks/**/*",
    "services/**/*",
    "utils/**/*",
    "vite-env.d.ts"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "LANDING-PAGE---NG-main",
    ".agents",
    "temp_skills"
  ]
}
```

**Key Configuration Details**:
- `"strict": true`: Activates strict null checks, strict function types, and strict property checks.
- `"types": ["node", "vite/client"]`: Restores ambient Vite and Node types.
- `"exclude"`: Quarantines `LANDING-PAGE---NG-main`, `dist`, and agent metadata `.agents`.
- `"include"`: Seamlessly covers files whether in root or inside `src/`.

---

### Blueprint 3: `vite-env.d.ts` Type Declarations

Create `/Users/arthurdemoraespd/Documents/nghub-lp/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_GEMINI_API_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

---

### Blueprint 4: Component Prop Interfaces & Implicit `any` Resolutions

#### 4.1 `components/ui/MarqueeColumn.tsx`
Replace lines 4-16 with explicit parameter typing:
```tsx
import React from 'react';
import { motion } from 'framer-motion';

export interface MarqueeColumnProps {
  images: string[];
  direction?: 'up' | 'down';
  speed?: number;
  primaryColor: string;
}

export const MarqueeColumn = ({
  images,
  direction = 'up',
  speed = 20,
  primaryColor
}: MarqueeColumnProps): React.JSX.Element => {
  const displayImages = [...images, ...images, ...images];
  // ... rest of component
```

#### 4.2 `components/ui/SectionHeading.tsx`
Replace lines 4-16 with explicit parameter typing:
```tsx
import React from 'react';
import { motion } from 'framer-motion';

export interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
  primaryColor: string;
}

export const SectionHeading = ({
  title,
  subtitle,
  align = 'center',
  primaryColor
}: SectionHeadingProps): React.JSX.Element => (
  // ... rest of component
```

#### 4.3 `components/ui/WeaponCard.tsx`
Define explicit `WeaponCardProps` and replace lines 3-6:
```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { PillarProps } from '../../types';

export interface WeaponCardProps extends PillarProps {
  primaryColor: string;
}

export const WeaponCard = ({
  icon,
  title,
  description,
  primaryColor
}: WeaponCardProps): React.JSX.Element => (
  // ... rest of component
```

#### 4.4 `components/ui/Effects.tsx`
Add named `AmbientLightProps` interface:
```tsx
import React from 'react';

export interface AmbientLightProps {
  primaryColor: string;
}

export const GlobalEffects = (): React.JSX.Element => (
  <>
    <div className="bg-noise" />
    <div className="vignette-overlay" />
  </>
);

export const AmbientLight = ({ primaryColor }: AmbientLightProps): React.JSX.Element => (
  <div className="absolute top-0 left-0 right-0 h-[100vh] overflow-hidden pointer-events-none z-0">
    <div
      className="absolute top-[-20%] left-[20%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full blur-[100px] md:blur-[150px]"
      style={{ backgroundColor: primaryColor, opacity: 0.05 }}
    />
    <div className="absolute top-[20%] right-[-10%] w-[250px] md:w-[500px] h-[250px] md:h-[500px] bg-blue-900/10 rounded-full blur-[100px] md:blur-[150px]" />
  </div>
);
```

#### 4.5 `components/admin/ImageControl.tsx`
Add explicit interfaces for `SectionTitle` and `InputGroup`:
```tsx
export interface SectionTitleProps {
  children?: React.ReactNode;
}

export const SectionTitle = ({ children }: SectionTitleProps): React.JSX.Element => (
  <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
    <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] shrink-0">
      {children}
    </h4>
    <div className="h-[1px] flex-1 bg-white/10" />
  </div>
);

export interface InputGroupProps {
  label: string;
  children?: React.ReactNode;
}

export const InputGroup = ({ label, children }: InputGroupProps): React.JSX.Element => (
  <div className="space-y-2 mb-4">
    <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium block">{label}</label>
    {children}
  </div>
);
```

#### 4.6 `components/AdminPanel.tsx`
1. Add `onLogout` and complete `SiteConfig` in `AdminPanelProps`:
```tsx
export interface AdminPanelProps {
  config: SiteConfig;
  onUpdate: (newConfig: SiteConfig) => void;
  onReset?: () => void;
  hasSaveError?: boolean;
  onLogout?: () => void | Promise<void>;
}
```
2. Add explicit interface for `AIButton`:
```tsx
export interface AIButtonProps {
  field: keyof SiteConfig['texts'];
  context: string;
}

const AIButton = ({ field, context }: AIButtonProps): React.JSX.Element => (
  <button
    onClick={() => generateTextWithAI(field, context)}
    disabled={!!isGeneratingAI}
    className="absolute top-0 right-0 p-2 text-ng-gold/70 hover:text-ng-gold transition-colors disabled:opacity-50"
    title="Gerar com IA"
  >
    {isGeneratingAI === field ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
  </button>
);
```

#### 4.7 `components/LeadForm.tsx`
1. Define explicit field interfaces:
```tsx
export interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  name: string;
  type?: string;
  required?: boolean;
}

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  name: string;
  required?: boolean;
}
```
2. Replace untyped catch blocks with Zod and Error type narrowing:
```tsx
// Line 136:
try {
  leadSchema.parse(formData);
} catch (error) {
  if (error instanceof z.ZodError) {
    setErrorMessage(error.issues[0]?.message || 'Preencha todos os campos obrigatórios');
    setStatus('error');
    return;
  }
}

// Line 188:
} catch (err) {
  const message = err instanceof Error ? err.message : 'Erro de conexão';
  console.error(message);
  setStatus('error');
  setErrorMessage('Erro de conexão. Verifique sua internet ou tente novamente.');
}
```

#### 4.8 `types.ts` & `services/supabase.ts`
1. Unify project types in `/Users/arthurdemoraespd/Documents/nghub-lp/types.ts`:
```ts
import React from 'react';

export interface Lead {
  id?: string;
  created_at?: string;
  full_name: string;
  whatsapp: string;
  instagram: string;
  niche: string;
  revenue_range: string;
  biggest_challenge: string;
  status?: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
  notes?: string;
}

export interface PillarProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface StatProps {
  value: string;
  label: string;
}

export interface SiteConfig {
  id?: number;
  images: {
    hero: string;
    heroVideo?: string;
    quoteParallax: string;
    gallery: string[];
  };
  texts: {
    heroTitle: string;
    heroSubtitle: string;
    ctaButton: string;
    manifestoTitle: string;
    proofBar: string[];
    pillars: Array<{
      title: string;
      description: string;
    }>;
  };
  colors: {
    primary: string;
  };
  integration: {
    formEndpoint: string;
  };
}
```
2. In `services/supabase.ts`, replace `any` with typed Supabase responses:
```ts
import { createClient, PostgrestError } from '@supabase/supabase-js';
import { Lead, SiteConfig } from '../types';

export const submitLead = async (
  leadData: Omit<Lead, 'id' | 'created_at' | 'status'>
): Promise<{ data: unknown; error: PostgrestError | null }> => {
  return await supabase
    .from('leads')
    .insert([{ ...leadData, status: 'new' }]);
};

export const getLeads = async (): Promise<{ data: Lead[] | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateLeadStatus = async (
  id: string,
  status: NonNullable<Lead['status']>
): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id);
  return { error };
};
```

---

### Blueprint 5: ESLint Configuration (`eslint.config.js`)

Create `/Users/arthurdemoraespd/Documents/nghub-lp/eslint.config.js`:
```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'LANDING-PAGE---NG-main',
      '.agents',
      'temp_skills'
    ]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ]
    },
  }
);
```

---

## 5. Verification Method

To verify the implementation of this blueprint once applied by Milestone 1 implementers:

1. **Verify Typechecking**:
   ```bash
   npm run typecheck
   ```
   *Expected Result*: Exits with code 0. Zero compiler errors.
2. **Verify Linting**:
   ```bash
   npm run lint
   ```
   *Expected Result*: Exits with code 0. Zero warnings or errors.
3. **Verify Production Build under Strict Mode**:
   ```bash
   npm run build
   ```
   *Expected Result*: Runs `tsc --noEmit && vite build`, completes successfully with exit code 0.
4. **Invalidation Condition**:
   This technical blueprint is invalidated if `tsc --noEmit` fails on any file in `src/` or root components with `error TS*` when executed under `"strict": true`.
