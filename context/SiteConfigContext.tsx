/**
 * context/SiteConfigContext.tsx
 * Modernized Site Configuration React Context.
 * - Pure React 19 state updater pattern (no I/O inside setConfig updater).
 * - Guaranteed non-blocking fallback for corrupted storage.
 * - Quota-safe persistence with Base64 offloaded to IndexedDB (<50KB LocalStorage).
 * - Instant reset without window.location.reload().
 * - Immediate component reactivity across the landing page.
 */
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { INITIAL_CONFIG } from '../config/defaults';
import { saveSiteConfig } from '../services/supabase';
import { SiteConfig } from '../types';
import {
  loadPersistedConfig,
  persistConfigSafe,
  clearPersistedConfig,
  sanitizeSiteConfig
} from '../utils/storage/configStorage';
import {
  clearAllMediaBlobs,
  saveMediaBlob,
  getMediaDataURL
} from '../utils/storage/mediaStorage';

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

  // Hydrate any offloaded media blobs on initial mount
  useEffect(() => {
    let cancelled = false;
    const hydrateMedia = async () => {
      let changed = false;
      const updatedImages = { ...config.images };

      if (typeof updatedImages.hero === 'string' && updatedImages.hero.startsWith('idb://')) {
        const dataUrl = await getMediaDataURL(updatedImages.hero);
        if (dataUrl && !cancelled) {
          updatedImages.hero = dataUrl;
          changed = true;
        }
      }

      if (typeof updatedImages.quoteParallax === 'string' && updatedImages.quoteParallax.startsWith('idb://')) {
        const dataUrl = await getMediaDataURL(updatedImages.quoteParallax);
        if (dataUrl && !cancelled) {
          updatedImages.quoteParallax = dataUrl;
          changed = true;
        }
      }

      if (Array.isArray(updatedImages.gallery)) {
        const newGallery = await Promise.all(
          updatedImages.gallery.map(async (item) => {
            if (typeof item === 'string' && item.startsWith('idb://')) {
              const dataUrl = await getMediaDataURL(item);
              if (dataUrl) {
                changed = true;
                return dataUrl;
              }
            }
            return item;
          })
        );
        updatedImages.gallery = newGallery;
      }

      if (changed && !cancelled) {
        setConfigState(prev => ({ ...prev, images: updatedImages }));
      }
    };

    hydrateMedia();
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Modernized, pure updateConfig callback
  const updateConfig = useCallback(async (partialOrFull: Partial<SiteConfig> | SiteConfig) => {
    // 1. Offload any Base64 data URLs to IndexedDB for high-capacity client storage
    const incomingImages = partialOrFull.images;
    if (incomingImages) {
      if (typeof incomingImages.hero === 'string' && incomingImages.hero.startsWith('data:image/')) {
        saveMediaBlob('hero', incomingImages.hero).catch(() => {});
      }
      if (typeof incomingImages.quoteParallax === 'string' && incomingImages.quoteParallax.startsWith('data:image/')) {
        saveMediaBlob('quoteParallax', incomingImages.quoteParallax).catch(() => {});
      }
      if (Array.isArray(incomingImages.gallery)) {
        incomingImages.gallery.forEach((img: string, idx: number) => {
          if (typeof img === 'string' && img.startsWith('data:image/')) {
            saveMediaBlob(`gallery_${idx}`, img).catch(() => {});
          }
        });
      }
    }

    // 2. Calculate next state deterministically
    const merged: SiteConfig = {
      ...config,
      ...partialOrFull,
      images: { ...config.images, ...(partialOrFull.images || {}) },
      texts: { ...config.texts, ...(partialOrFull.texts || {}) },
      colors: { ...config.colors, ...(partialOrFull.colors || {}) },
      integration: { ...config.integration, ...(partialOrFull.integration || {}) }
    };

    const sanitized = sanitizeSiteConfig(merged, initialConfig);

    // 3. Pure React state update (triggers instant UI re-render, keeps in-memory image preview)
    const stateConfig: SiteConfig = {
      ...sanitized,
      images: {
        ...sanitized.images,
        hero: partialOrFull.images?.hero || config.images.hero || sanitized.images.hero,
        quoteParallax: partialOrFull.images?.quoteParallax || config.images.quoteParallax || sanitized.images.quoteParallax,
        gallery: partialOrFull.images?.gallery || config.images.gallery || sanitized.images.gallery
      }
    };
    setConfigState(stateConfig);

    // 4. Decoupled, quota-safe LocalStorage persistence (OUTSIDE setConfigState)
    // sanitizeSiteConfig ensures LocalStorage payload stays strictly <50KB by stripping huge Base64 data
    const storageResult = persistConfigSafe(sanitized);
    if (!storageResult.success && storageResult.error) {
      setSaveError(storageResult.error);
    } else {
      setSaveError(null);
    }

    // 5. Asynchronous Cloud Persistence (Supabase)
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
    try {
      await clearAllMediaBlobs();
    } catch {
      // Ignore storage clear error
    }

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

// Granular selector hooks
export const useSiteColors = () => useSiteConfig().config.colors;
export const useSiteTexts = () => useSiteConfig().config.texts;
export const useSiteImages = () => useSiteConfig().config.images;
