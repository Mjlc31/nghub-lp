# Technical Blueprint: Feature 17 — Site Configuration State Modernization

**Author**: `explorer_m3_2` (teamwork_preview_explorer)  
**Date**: 2026-09-10  
**Target Milestone**: Milestone 3 (Feature 17)  
**Status**: COMPLETE / READY FOR IMPLEMENTATION  

---

## 1. Observation

Direct examination of the project files, tests, and runtime behaviors yielded the following concrete observations:

### 1.1 Source Files & Current Implementations

1. **`context/SiteConfigContext.tsx`**:
   - **File Location**: `/Users/arthurdemoraespd/Documents/nghub-lp/context/SiteConfigContext.tsx`
   - **Key Definition** (line 15):
     ```tsx
     const STORAGE_KEY = 'nghub_site_config_v1';
     ```
   - **Hydration Logic** (lines 28–48):
     ```tsx
     const [config, setConfig] = useState<SiteConfig>(() => {
       if (typeof window !== 'undefined') {
         try {
           const saved = localStorage.getItem(STORAGE_KEY);
           if (saved) {
             const parsed = JSON.parse(saved);
             return {
               ...initialConfig,
               ...parsed,
               images: { ...initialConfig.images, ...(parsed.images || {}) },
               texts: { ...initialConfig.texts, ...(parsed.texts || {}) },
               colors: { ...initialConfig.colors, ...(parsed.colors || {}) },
               integration: { ...initialConfig.integration, ...(parsed.integration || {}) }
             };
           }
         } catch (err) {
           console.warn('Failed to parse site config from localStorage:', err);
         }
       }
       return initialConfig;
     });
     ```
     *Observed Defect*: Corrupted or malformed storage is caught with `console.warn`, but the corrupted string is never purged or quarantined. Furthermore, if `parsed.images` contains `{ gallery: null }`, spreading `{ ...initialConfig.images, ...(parsed.images || {}) }` sets `config.images.gallery = null`, which causes runtime crashes in consumers expecting an array (`.map()` or `.length`).
   - **Update Logic & Impure React 19 Setter** (lines 53–84):
     ```tsx
     const updateConfig = useCallback(async (partialOrFull: Partial<SiteConfig> | SiteConfig) => {
       setConfig(prev => {
         const merged: SiteConfig = {
           ...prev,
           ...partialOrFull,
           images: { ...prev.images, ...(partialOrFull.images || {}) },
           texts: { ...prev.texts, ...(partialOrFull.texts || {}) },
           colors: { ...prev.colors, ...(partialOrFull.colors || {}) },
           integration: { ...prev.integration, ...(partialOrFull.integration || {}) }
         };

         // Synchronous LocalStorage write
         try {
           localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
         } catch (e) {
           console.error('LocalStorage write failure:', e);
         }

         // Supabase async persistence stub
         saveSiteConfig(merged).then(({ error }) => {
           if (error) {
             setSaveError('Erro ao sincronizar configurações na nuvem.');
           } else {
             setSaveError(null);
           }
         }).catch(() => {
           setSaveError('Falha de conexão ao salvar na nuvem.');
         });

         return merged;
       });
     }, []);
     ```
     *Observed Defect*: `setConfig(prev => ...)` is an updater function. In React 18/19 (Concurrent rendering and StrictMode), updater functions are executed twice in development and must be pure. Performing synchronous I/O (`localStorage.setItem`) and asynchronous promises calling `setSaveError(...)` inside `setConfig` triggers React warnings ("Cannot update a component while rendering a different component"), duplicates writes, and hides `QuotaExceededError` from the caller.
   - **Destructive Reset Method** (lines 86–97):
     ```tsx
     const resetConfig = useCallback(async () => {
       if (typeof window !== 'undefined' && window.confirm('Restaurar todas as configurações para o padrão de fábrica?')) {
         setConfig(INITIAL_CONFIG as SiteConfig);
         try {
           localStorage.removeItem(STORAGE_KEY);
           await saveSiteConfig(INITIAL_CONFIG as SiteConfig);
         } catch (err) {
           console.error('Failed to reset config in cloud:', err);
         }
         window.location.reload();
       }
     }, []);
     ```
     *Observed Defect*: Hardcoded `window.confirm` and `window.location.reload()` block non-interactive headless testing and trigger an unnecessary full browser reload, breaking seamless single-page application reactivity.

2. **`components/AdminPanel.tsx`**:
   - **File Location**: `/Users/arthurdemoraespd/Documents/nghub-lp/components/AdminPanel.tsx` (Note: `PROJECT.md` line 9 mentions `components/admin/AdminPanel.tsx`, but the file resides at `components/AdminPanel.tsx` in the actual repository).
   - **Inverted Browser Check Bug** (lines 45–51):
     ```tsx
     // Monitor storage usage
     const storageUsage = useMemo(() => {
       if (typeof window !== 'undefined') return 0; // BUG: window !== 'undefined' is true in browser!
       const totalString = JSON.stringify(config);
       const size = new Blob([totalString]).size;
       const LIMIT = 4800000;
       return Math.min(100, Math.round((size / LIMIT) * 100));
     }, [config]);
     ```
     *Observed Defect*: The check `if (typeof window !== 'undefined') return 0;` causes `storageUsage` to ALWAYS return 0 in any browser environment! The storage warning bar in `AdminPanel` never reflects actual usage.
   - **Base64 Direct Injection** (lines 59–106):
     `handleSingleImageUpload` and `handleGalleryUpload` invoke `compressImage(file, 'hero')` and store the resulting Base64 string directly in `config.images[key]` and `config.images.gallery`.

3. **`utils/imageUtils.ts`**:
   - **Canvas Compression to Base64** (lines 35–36):
     ```tsx
     const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
     resolve(compressedDataUrl);
     ```
     *Observed Defect*: Each compressed image outputs a Base64 string between 250KB and 600KB. A single gallery of 7 images plus hero and quote images consumes 3.5MB to 5MB, instantly risking `QuotaExceededError` in LocalStorage.

4. **`hooks/useSiteConfig.ts`**:
   - Spreads `{ ...context, setConfig: context.updateConfig }` inline without `useMemo`, creating a new object identity on every call.

### 1.2 Test Suite Contracts & Constraints

1. **`tests/tier1_features/site_config.test.ts` (F17.1–F17.5)**:
   - **F17.1**: Context initializes with complete default site configuration.
   - **F17.2**: Saved configuration in `LocalStorage` with key `nghub_site_config_v1` loads on mount.
   - **F17.3**: Updates propagate immediately to storage and state.
   - **F17.4**: `resetConfig` restores original defaults and clears custom overrides.
   - **F17.5**: **Payload Size Budget**:
     ```ts
     const serialized = JSON.stringify(DEFAULT_SITE_CONFIG);
     const byteSize = Buffer.byteLength(serialized, 'utf8');
     assert(byteSize < 50 * 1024, `Site configuration must not store huge Base64 binaries, size is ${byteSize} bytes`);
     ```
     *Strict Requirement*: LocalStorage payload MUST remain under 50KB. Storing Base64 images directly in LocalStorage is a direct violation of this architectural contract.

2. **`tests/tier2_boundaries/storage_boundaries.test.ts` (B.STORE.1–B.STORE.5)**:
   - **B.STORE.1**: Recovers cleanly from malformed/corrupted JSON string in LocalStorage without throwing.
   - **B.STORE.2**: Catches `QuotaExceededError` without uncaught crashes.
   - **B.STORE.3**: Safely initializes default configuration when LocalStorage returns `null`.
   - **B.STORE.4**: Partial configuration objects merge with defaults without losing missing keys.
   - **B.STORE.5**: Rapid consecutive storage writes preserve most recent state.

3. **`tests/tier3_combinations/config_reactivity_flow.test.ts` (X.CONF.1–X.CONF.2)**:
   - **X.CONF.1**: Modifying texts and primary color propagates reactively to all subscribing components (`Hero`, `Navbar`, `BentoGrid`, `Manifesto`).
   - **X.CONF.2**: Resetting configuration instantly restores defaults without requiring browser refresh.

4. **`tests/harness/challenger_m1.ts` (Tests 2.1–2.7)**:
   - Validates that non-object JSON (`"123"`, `"true"`, `"[1,2,3]"`), empty strings, and corrupted nested objects (e.g. `{ images: null }`, `{ texts: null }`) do not crash the app.

---

## 2. Logic Chain

From the direct observations above, the logical progression dictates:

1. **Observation 1.1 (Base64 storage) + 1.2 (F17.5 budget <50KB) + Browser LocalStorage 5MB origin limit**:
   - Base64 encoding inflates binary size by 33%.
   - Multiple compressed JPEG images stored as data URLs in `SiteConfig` produce a JSON string exceeding 4MB to 6MB.
   - Browsers synchronously block the main thread when parsing or serializing multi-megabyte strings in LocalStorage, inducing significant Input Delay (INP) and Largest Contentful Paint (LCP) lag.
   - When LocalStorage reaches 5,242,880 bytes, `localStorage.setItem` throws `DOMException: QuotaExceededError`.
   - *Therefore*: Base64 binaries must NEVER be saved into LocalStorage. Large binaries must be offloaded from the LocalStorage configuration payload into a high-capacity, asynchronous client storage medium (IndexedDB) or remote storage (Supabase Storage bucket).

2. **Observation 1.1 (Updater Side-Effects) + React 19 Concurrency Rules**:
   - In React 19, functional state updaters `setConfig(prev => ...)` must be pure mathematical projections of `(prevState) => nextState`.
   - Writing to `localStorage`, dispatching network requests (`saveSiteConfig`), or updating other state (`setSaveError`) inside `setConfig(prev => ...)` causes double-execution in Strict Mode and runtime warnings.
   - *Therefore*: All side effects (`safeStorageSet`, `saveSiteConfig`, `setSaveError`) must be moved outside the state updater callback.

3. **Observation 1.1 (Inverted condition in AdminPanel) + lines 45–51**:
   - `if (typeof window !== 'undefined') return 0;` means whenever the code runs in the browser, storage usage is 0%.
   - *Therefore*: Change to `if (typeof window === 'undefined') return 0;`, and calculate true LocalStorage + IndexedDB consumption.

4. **Observation 1.1 & 1.2 (Challenger 2.6 & Corrupted JSON)**:
   - When LocalStorage contains corrupted JSON or invalid data shapes (e.g., `gallery: null`), naive shallow object spreading results in runtime errors (`TypeError: Cannot read properties of null`).
   - *Therefore*: A robust schema sanitizer `sanitizeSiteConfig(raw, fallback)` must be introduced. If parsing fails, the corrupted entry in LocalStorage should be cleaned up or safely backed up, rather than leaving a poison pill in the client's storage.

5. **Observation 1.1 (window.confirm & reload) + 1.2 (X.CONF.2 test)**:
   - Calling `window.location.reload()` and blocking `window.confirm` breaks the clean single-page reactivity tested in `X.CONF.2`.
   - *Therefore*: `resetConfig` must reset state purely via React state and LocalStorage deletion, with an optional confirmation handled at the UI layer (in `AdminPanel.tsx`).

---

## 3. Caveats

1. **IndexedDB Availability & Private Browsing**:
   - While modern Safari, Chrome, and Firefox support IndexedDB in private browsing, some restrictive environments (e.g. WebViews with disk access blocked or embedded iframes) may throw errors on `indexedDB.open()`. The IndexedDB utility must have an in-memory `Map` fallback so the app continues functioning seamlessly without throwing uncaught exceptions.
2. **Offline vs Online Cloud Sync**:
   - Milestone 3 Feature 15 & 16 focus on Supabase integration. When Supabase credentials are missing (as in a local preview or offline test), `saveSiteConfig` must silently resolve `{ error: null }` as a stub without throwing errors.
3. **Asset References**:
   - The default configuration in `config/defaults.ts` uses local static files (`/NG-141.jpg`, `/NG-355.jpg`, etc.). These are lightweight string paths (<30 bytes) and must remain the default.
4. **No Direct Source Code Edits in this Turn**:
   - In accordance with the READ-ONLY Explorer constraint, no source code has been altered. This blueprint provides the complete drop-in specifications and code replacement blocks for the implementer agent.

---

## 4. Conclusion & Technical Blueprint

The modernized Site Configuration architecture comprises four cohesive layers:
1. **`utils/storage/mediaStorage.ts`**: Asynchronous IndexedDB storage engine for media blobs with memory fallback.
2. **`utils/storage/configStorage.ts`**: Quota-safe LocalStorage serializer with defensive schema validation, corrupted key quarantine, and <50KB payload enforcement.
3. **`context/SiteConfigContext.tsx`**: React 19 pure state machine with decoupled side effects, real-time reactivity, and selector hooks.
4. **`components/AdminPanel.tsx`**: Updated media handlers that route image files to `mediaStorage`, fix the inverted `storageUsage` gauge, and support seamless cloud sync.

### 4.1 Layer 1: IndexedDB Media Vault (`utils/storage/mediaStorage.ts`)

Create a dedicated client-side media storage utility:

```typescript
/**
 * utils/storage/mediaStorage.ts
 * High-capacity client-side blob storage powered by IndexedDB with in-memory fallback.
 * Eliminates the 5MB Base64 LocalStorage quota exhaustion risk.
 */

const DB_NAME = 'nghub_media_db';
const STORE_NAME = 'media_blobs';
const DB_VERSION = 1;

// In-memory fallback for environments where IndexedDB is blocked
const memoryStore = new Map<string, Blob>();

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in current environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Store an image Blob or File in IndexedDB
 * @param key unique identifier (e.g. "hero", "quoteParallax", "gallery_123")
 * @param blob image data
 */
export async function saveMediaBlob(key: string, blob: Blob): Promise<string> {
  try {
    const db = await openMediaDB();
    return await new Promise<string>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, key);
      req.onsuccess = () => resolve(`idb://${key}`);
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Graceful fallback to memory store
    memoryStore.set(key, blob);
    return `idb://${key}`;
  }
}

/**
 * Retrieve an image Blob from IndexedDB
 */
export async function getMediaBlob(key: string): Promise<Blob | null> {
  const cleanKey = key.replace(/^idb:\/\//, '');
  if (memoryStore.has(cleanKey)) {
    return memoryStore.get(cleanKey)!;
  }

  try {
    const db = await openMediaDB();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cleanKey);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

/**
 * Delete a media blob by key
 */
export async function deleteMediaBlob(key: string): Promise<void> {
  const cleanKey = key.replace(/^idb:\/\//, '');
  memoryStore.delete(cleanKey);

  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(cleanKey);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore cleanup error
  }
}

/**
 * Clear all media blobs from IndexedDB
 */
export async function clearAllMediaBlobs(): Promise<void> {
  memoryStore.clear();
  try {
    const db = await openMediaDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore cleanup error
  }
}
```

---

### 4.2 Layer 2: Quota-Safe LocalStorage & Schema Sanitizer (`utils/storage/configStorage.ts`)

Create a defensive schema validator and storage manager:

```typescript
/**
 * utils/storage/configStorage.ts
 * Defensive schema validation, corrupted storage recovery, and quota-safe LocalStorage writes.
 */
import { SiteConfig } from '../../types';
import { INITIAL_CONFIG } from '../../config/defaults';

export const CONFIG_STORAGE_KEY = 'nghub_site_config_v1';
export const CORRUPTED_BACKUP_KEY = 'nghub_site_config_corrupted_v1';
export const MAX_LOCAL_STORAGE_PAYLOAD_BYTES = 50 * 1024; // 50 KB budget (F17.5)

/**
 * Deep, resilient merge and validation against SiteConfig interface contract
 */
export function sanitizeSiteConfig(raw: unknown, fallback: SiteConfig = INITIAL_CONFIG as SiteConfig): SiteConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return fallback;
  }

  const obj = raw as Record<string, any>;

  // 1. Sanitize Texts
  const rawTexts = obj.texts && typeof obj.texts === 'object' && !Array.isArray(obj.texts) ? obj.texts : {};
  const texts: SiteConfig['texts'] = {
    heroTitle: typeof rawTexts.heroTitle === 'string' && rawTexts.heroTitle.trim() ? rawTexts.heroTitle : fallback.texts.heroTitle,
    heroSubtitle: typeof rawTexts.heroSubtitle === 'string' && rawTexts.heroSubtitle.trim() ? rawTexts.heroSubtitle : fallback.texts.heroSubtitle,
    ctaButton: typeof rawTexts.ctaButton === 'string' && rawTexts.ctaButton.trim() ? rawTexts.ctaButton : fallback.texts.ctaButton,
    manifestoTitle: typeof rawTexts.manifestoTitle === 'string' && rawTexts.manifestoTitle.trim() ? rawTexts.manifestoTitle : fallback.texts.manifestoTitle,
    proofBar: Array.isArray(rawTexts.proofBar) && rawTexts.proofBar.length > 0
      ? rawTexts.proofBar.filter((item: unknown) => typeof item === 'string')
      : fallback.texts.proofBar || [],
    pillars: Array.isArray(rawTexts.pillars) && rawTexts.pillars.length > 0
      ? rawTexts.pillars.filter((p: unknown) => p && typeof p === 'object' && typeof (p as any).title === 'string' && typeof (p as any).description === 'string')
      : fallback.texts.pillars || []
  };

  // 2. Sanitize Images (Strip huge Base64 strings to enforce F17.5)
  const rawImages = obj.images && typeof obj.images === 'object' && !Array.isArray(obj.images) ? obj.images : {};
  
  const sanitizeImageString = (val: unknown, fallbackVal: string): string => {
    if (typeof val !== 'string' || !val.trim()) return fallbackVal;
    // Strip Base64 strings exceeding 10KB from LocalStorage to prevent quota blowout
    if (val.startsWith('data:image/') && val.length > 10 * 1024) {
      return fallbackVal;
    }
    return val;
  };

  const galleryList = Array.isArray(rawImages.gallery)
    ? rawImages.gallery
        .filter((item: unknown) => typeof item === 'string' && item.trim())
        .map((img: string) => (img.startsWith('data:image/') && img.length > 10 * 1024 ? null : img))
        .filter(Boolean) as string[]
    : fallback.images.gallery;

  const images: SiteConfig['images'] = {
    hero: sanitizeImageString(rawImages.hero, fallback.images.hero),
    heroVideo: typeof rawImages.heroVideo === 'string' ? rawImages.heroVideo : fallback.images.heroVideo,
    quoteParallax: sanitizeImageString(rawImages.quoteParallax, fallback.images.quoteParallax),
    gallery: galleryList.length > 0 ? galleryList : fallback.images.gallery
  };

  // 3. Sanitize Colors
  const rawColors = obj.colors && typeof obj.colors === 'object' && !Array.isArray(obj.colors) ? obj.colors : {};
  const colors: SiteConfig['colors'] = {
    primary: typeof rawColors.primary === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(rawColors.primary)
      ? rawColors.primary
      : fallback.colors.primary
  };

  // 4. Sanitize Integration
  const rawIntegration = obj.integration && typeof obj.integration === 'object' && !Array.isArray(obj.integration) ? obj.integration : {};
  const integration: SiteConfig['integration'] = {
    formEndpoint: typeof rawIntegration.formEndpoint === 'string' ? rawIntegration.formEndpoint : fallback.integration.formEndpoint
  };

  return {
    images,
    texts,
    colors,
    integration
  };
}

/**
 * Safely load configuration from LocalStorage with auto-quarantine for corrupted data
 */
export function loadPersistedConfig(fallback: SiteConfig = INITIAL_CONFIG as SiteConfig): SiteConfig {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    return sanitizeSiteConfig(parsed, fallback);
  } catch (err) {
    console.warn('[SiteConfig] Corrupted LocalStorage detected. Quarantining and resetting to defaults.', err);
    try {
      const corrupted = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (corrupted) {
        localStorage.setItem(CORRUPTED_BACKUP_KEY, corrupted);
      }
      localStorage.removeItem(CONFIG_STORAGE_KEY);
    } catch {
      // Storage access blocked or quota exceeded
    }
    return fallback;
  }
}

/**
 * Safely persist configuration to LocalStorage, handling QuotaExceededError and enforcing payload budget (<50KB)
 */
export function persistConfigSafe(config: SiteConfig): { success: boolean; error?: string } {
  if (typeof window === 'undefined') return { success: true };

  try {
    const sanitized = sanitizeSiteConfig(config);
    const serialized = JSON.stringify(sanitized);

    // Guard against payload explosion
    const byteSize = new Blob([serialized]).size;
    if (byteSize > MAX_LOCAL_STORAGE_PAYLOAD_BYTES) {
      console.warn(`[SiteConfig] LocalStorage budget exceeded (${byteSize} bytes > ${MAX_LOCAL_STORAGE_PAYLOAD_BYTES} bytes).`);
      return { success: false, error: 'Tamanho da configuração excede o limite do navegador.' };
    }

    localStorage.setItem(CONFIG_STORAGE_KEY, serialized);
    return { success: true };
  } catch (err: any) {
    if (err?.name === 'QuotaExceededError' || err?.code === 22) {
      console.error('[SiteConfig] LocalStorage QuotaExceededError encountered.');
      return { success: false, error: 'QuotaExceededError: Limite de armazenamento local excedido.' };
    }
    console.error('[SiteConfig] Unexpected LocalStorage write failure:', err);
    return { success: false, error: 'Erro inesperado ao salvar no armazenamento local.' };
  }
}

/**
 * Clear persisted configuration from LocalStorage
 */
export function clearPersistedConfig(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
  } catch (err) {
    console.warn('[SiteConfig] Failed to clear LocalStorage:', err);
  }
}
```

---

### 4.3 Layer 3: Modernized React 19 Context (`context/SiteConfigContext.tsx`)

Refactor `SiteConfigContext.tsx` with pure state updates, memoized selectors, and decoupled side-effects:

```typescript
/**
 * context/SiteConfigContext.tsx
 * Modernized Site Configuration React Context.
 * - Pure React 19 state updater pattern (no I/O inside setConfig updater).
 * - Guaranteed non-blocking fallback for corrupted storage.
 * - Quota-safe persistence with Base64 offload.
 * - Immediate component reactivity across the landing page.
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { INITIAL_CONFIG } from '../config/defaults';
import { saveSiteConfig } from '../services/supabase';
import { SiteConfig } from '../types';
import { loadPersistedConfig, persistConfigSafe, clearPersistedConfig, sanitizeSiteConfig } from '../utils/storage/configStorage';
import { clearAllMediaBlobs } from '../utils/storage/mediaStorage';

export interface SiteConfigContextValue {
  config: SiteConfig;
  updateConfig: (partialOrFull: Partial<SiteConfig> | SiteConfig) => Promise<void>;
  resetConfig: () => Promise<void>;
  isLoaded: boolean;
  saveError: string | null;
  setSaveError: (error: string | null) => void;
  // Compatibility alias
  setConfig: (partialOrFull: Partial<SiteConfig> | SiteConfig) => Promise<void>;
}

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

export interface SiteConfigProviderProps {
  children: React.ReactNode;
  initialConfig?: SiteConfig;
}

export const SiteConfigProvider: React.FC<SiteConfigProviderProps> = ({
  children,
  initialConfig = INITIAL_CONFIG as SiteConfig
}) => {
  // Lazy initial state hydration with zero render lag
  const [config, setConfigState] = useState<SiteConfig>(() => {
    return loadPersistedConfig(initialConfig);
  });

  const [saveError, setSaveError] = useState<string | null>(null);
  const isLoaded = true;

  // Modernized, pure updateConfig callback
  const updateConfig = useCallback(async (partialOrFull: Partial<SiteConfig> | SiteConfig) => {
    // 1. Calculate next state deterministically
    const merged: SiteConfig = {
      ...config,
      ...partialOrFull,
      images: { ...config.images, ...(partialOrFull.images || {}) },
      texts: { ...config.texts, ...(partialOrFull.texts || {}) },
      colors: { ...config.colors, ...(partialOrFull.colors || {}) },
      integration: { ...config.integration, ...(partialOrFull.integration || {}) }
    };

    const sanitized = sanitizeSiteConfig(merged, initialConfig);

    // 2. Pure React state update (triggers instant UI re-render)
    setConfigState(sanitized);

    // 3. Decoupled, quota-safe LocalStorage persistence (OUTSIDE setConfig)
    const storageResult = persistConfigSafe(sanitized);
    if (!storageResult.success && storageResult.error) {
      setSaveError(storageResult.error);
    } else {
      setSaveError(null);
    }

    // 4. Asynchronous Cloud Persistence (Supabase)
    try {
      const { error } = await saveSiteConfig(sanitized);
      if (error) {
        setSaveError('Erro ao sincronizar configurações na nuvem.');
      }
    } catch {
      setSaveError('Falha de conexão ao salvar na nuvem.');
    }
  }, [config, initialConfig]);

  // Non-blocking, instant resetConfig (no window.location.reload() or blocking alerts)
  const resetConfig = useCallback(async () => {
    // 1. Reset React state immediately
    setConfigState(INITIAL_CONFIG as SiteConfig);
    setSaveError(null);

    // 2. Clear LocalStorage and IndexedDB media blobs
    clearPersistedConfig();
    await clearAllMediaBlobs();

    // 3. Reset Cloud record if connected
    try {
      await saveSiteConfig(INITIAL_CONFIG as SiteConfig);
    } catch (err) {
      console.warn('[SiteConfig] Cloud reset failed:', err);
    }
  }, []);

  const value = useMemo<SiteConfigContextValue>(() => ({
    config,
    updateConfig,
    resetConfig,
    isLoaded,
    saveError,
    setSaveError,
    setConfig: updateConfig
  }), [config, updateConfig, resetConfig, isLoaded, saveError]);

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = (): SiteConfigContextValue => {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a <SiteConfigProvider>');
  }
  return context;
};

// Granular selector hooks with strict memoization
export const useSiteColors = () => useSiteConfig().config.colors;
export const useSiteTexts = () => useSiteConfig().config.texts;
export const useSiteImages = () => useSiteConfig().config.images;
```

---

### 4.4 Layer 4: AdminPanel Integration & Media Offloading (`components/AdminPanel.tsx`)

In `components/AdminPanel.tsx`:
1. **Fix the Inverted Storage Gauge Bug** (line 46):
   ```tsx
   // Replace:
   if (typeof window !== 'undefined') return 0;
   // With:
   if (typeof window === 'undefined') return 0;
   ```
2. **Offload Media Uploads to IndexedDB**:
   When the user selects an image file for `hero`, `quoteParallax`, or `gallery`:
   - Store the compressed blob/data URL in IndexedDB via `saveMediaBlob(key, file)`.
   - In `SiteConfig.images`, store an Object URL or public path/media key (`idb://hero` or `URL.createObjectURL(blob)` for local preview, or remote URL when uploaded to Supabase Storage).
   - This ensures the JSON string in LocalStorage remains strictly **<10KB**, satisfying test `F17.5` and eliminating the 5MB quota exhaustion risk completely.
3. **UI Confirmation for Reset**:
   In `AdminPanel.tsx`, wrap `onReset` with a sleek confirmation modal or inline state instead of invoking native `window.confirm` inside the Context provider.

---

## 5. Verification Method

To independently verify the implementation once executed:

### 5.1 Automated E2E Test Verification

Run the project test command:
```bash
npm test
```
Or run the explicit E2E runner:
```bash
npm run test:e2e
```
Or direct Node.js invocation:
```bash
node --experimental-strip-types tests/index.ts
```

All 114 tests across 28 suites must pass with **100% success**, specifically:
- `tests/tier1_features/site_config.test.ts` (F17.1 to F17.5)
- `tests/tier2_boundaries/storage_boundaries.test.ts` (B.STORE.1 to B.STORE.5)
- `tests/tier3_combinations/config_reactivity_flow.test.ts` (X.CONF.1 and X.CONF.2)

### 5.2 Adversarial Challenger Suites

Execute the empirical stress testing suites:
```bash
node --experimental-strip-types tests/harness/challenger_m1.ts
node --experimental-strip-types tests/harness/challenger_m1_2.ts
node --experimental-strip-types tests/harness/challenger_m2.ts
node --experimental-strip-types tests/harness/challenger_m2_2.ts
```

### 5.3 Typecheck and Lint Hygiene

Execute compiler and linter verifications:
```bash
npm run typecheck
npm run lint
```
Both commands must exit with code `0`, reporting zero TypeScript errors and zero ESLint warnings.

### 5.4 Invalidation Conditions

The blueprint or implementation is invalidated if any of the following occur:
1. `JSON.stringify(config)` in LocalStorage exceeds 50KB (`51,200 bytes`).
2. An uploaded image file causes a synchronous `QuotaExceededError` that crashes the application or halts state updates.
3. `SiteConfigProvider` executes side effects inside `setConfig(prev => ...)` causing React StrictMode duplicate execution or warnings.
4. Setting corrupted/null data in LocalStorage causes `Gallery.tsx` or `Hero.tsx` to throw `TypeError: Cannot read properties of null`.
