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

  const obj = raw as Record<string, unknown>;

  // 1. Sanitize Texts
  const rawTexts = obj.texts && typeof obj.texts === 'object' && !Array.isArray(obj.texts)
    ? (obj.texts as Record<string, unknown>)
    : {};

  const texts: SiteConfig['texts'] = {
    heroTitle: typeof rawTexts.heroTitle === 'string' && rawTexts.heroTitle.trim() ? rawTexts.heroTitle : fallback.texts.heroTitle,
    heroSubtitle: typeof rawTexts.heroSubtitle === 'string' && rawTexts.heroSubtitle.trim() ? rawTexts.heroSubtitle : fallback.texts.heroSubtitle,
    ctaButton: typeof rawTexts.ctaButton === 'string' && rawTexts.ctaButton.trim() ? rawTexts.ctaButton : fallback.texts.ctaButton,
    manifestoTitle: typeof rawTexts.manifestoTitle === 'string' && rawTexts.manifestoTitle.trim() ? rawTexts.manifestoTitle : fallback.texts.manifestoTitle,
    proofBar: Array.isArray(rawTexts.proofBar) && rawTexts.proofBar.length > 0
      ? (rawTexts.proofBar.filter((item: unknown) => typeof item === 'string') as string[])
      : fallback.texts.proofBar || [],
    pillars: Array.isArray(rawTexts.pillars) && rawTexts.pillars.length > 0
      ? ((rawTexts.pillars as Array<{ title?: unknown; description?: unknown }>)
          .filter((p) => p && typeof p === 'object' && typeof p.title === 'string' && typeof p.description === 'string') as Array<{ title: string; description: string }>)
      : fallback.texts.pillars || []
  };

  // 2. Sanitize Images (Strip huge Base64 strings to enforce F17.5)
  const rawImages = obj.images && typeof obj.images === 'object' && !Array.isArray(obj.images)
    ? (obj.images as Record<string, unknown>)
    : {};
  
  const sanitizeImageString = (val: unknown, fallbackVal: string): string => {
    if (typeof val !== 'string' || !val.trim()) return fallbackVal;
    // Strip Base64 strings exceeding 10KB from LocalStorage to prevent quota blowout
    if (val.startsWith('data:image/') && val.length > 10 * 1024) {
      return fallbackVal;
    }
    return val;
  };

  const galleryList = Array.isArray(rawImages.gallery)
    ? (rawImages.gallery
        .filter((item: unknown) => typeof item === 'string' && (item as string).trim())
        .map((img: unknown) => {
          const str = img as string;
          return str.startsWith('data:image/') && str.length > 10 * 1024 ? null : str;
        })
        .filter(Boolean) as string[])
    : fallback.images.gallery;

  const images: SiteConfig['images'] = {
    hero: sanitizeImageString(rawImages.hero, fallback.images.hero),
    heroVideo: typeof rawImages.heroVideo === 'string' ? rawImages.heroVideo : fallback.images.heroVideo,
    quoteParallax: sanitizeImageString(rawImages.quoteParallax, fallback.images.quoteParallax),
    gallery: galleryList.length > 0 ? galleryList : fallback.images.gallery
  };

  // 3. Sanitize Colors
  const rawColors = obj.colors && typeof obj.colors === 'object' && !Array.isArray(obj.colors)
    ? (obj.colors as Record<string, unknown>)
    : {};
  const colors: SiteConfig['colors'] = {
    primary: typeof rawColors.primary === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(rawColors.primary)
      ? rawColors.primary
      : fallback.colors.primary
  };

  // 4. Sanitize Integration
  const rawIntegration = obj.integration && typeof obj.integration === 'object' && !Array.isArray(obj.integration)
    ? (obj.integration as Record<string, unknown>)
    : {};
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
    const byteSize = typeof Blob !== 'undefined'
      ? new Blob([serialized]).size
      : Buffer.byteLength(serialized, 'utf8');

    if (byteSize > MAX_LOCAL_STORAGE_PAYLOAD_BYTES) {
      console.warn(`[SiteConfig] LocalStorage budget exceeded (${byteSize} bytes > ${MAX_LOCAL_STORAGE_PAYLOAD_BYTES} bytes).`);
      return { success: false, error: 'Tamanho da configuração excede o limite do navegador.' };
    }

    localStorage.setItem(CONFIG_STORAGE_KEY, serialized);
    return { success: true };
  } catch (err: unknown) {
    const errorObj = err as { name?: string; code?: number };
    if (errorObj?.name === 'QuotaExceededError' || errorObj?.code === 22) {
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
