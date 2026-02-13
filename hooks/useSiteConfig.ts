import { useState, useEffect } from 'react';
import { INITIAL_CONFIG } from '../config/defaults';
import { getSiteConfig, saveSiteConfig } from '../services/supabase';

const STORAGE_KEY = 'nghub_site_config_v1';

export const useSiteConfig = () => {
    const [config, setConfig] = useState(INITIAL_CONFIG);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // Initial Load - Try Supabase first, fallback to LocalStorage, then Default
    useEffect(() => {
        const loadConfig = async () => {
            // 1. Supabase Load Removed (LocalStorage Only)
            const remoteConfig = null;

            if (remoteConfig) {
                // Unreachable, kept for structure
                return;
            }

            // 2. Fallback to LocalStorage (Legacy support)
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        setConfig({ ...INITIAL_CONFIG, ...parsed });
                    } catch { /* ignore */ }
                }
            }
            setIsLoaded(true);
        };
        loadConfig();
    }, []);

    // Auto-save to Supabase (debounced ideally, but direct for now)
    const updateConfig = async (newConfig: typeof INITIAL_CONFIG) => {
        // Optimistic UI update
        setConfig(newConfig);

        // Save to LocalStorage (backup)
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
        } catch { }

        // Save to Supabase
        const { error } = await saveSiteConfig(newConfig as any);
        if (error) {
            console.error("Failed to save to Supabase", error);
            setSaveError("Erro ao salvar na nuvem.");
        } else {
            setSaveError(null);
        }
    };

    const resetConfig = async () => {
        if (confirm("Tem certeza? Isso irá restaurar todas as configurações originais na nuvem.")) {
            await updateConfig(INITIAL_CONFIG);
            window.location.reload();
        }
    };

    return { config, setConfig: updateConfig, resetConfig, saveError, setSaveError, isLoaded };
};
