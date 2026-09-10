import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { AlertTriangle, Shield } from 'lucide-react';
import { getCurrentUser, signOut, supabase } from '../../services/supabase';
import { useSiteConfig } from '../../context/SiteConfigContext';

// Lazy-loaded Admin and Login modules
const AdminPanel = React.lazy(() =>
  import('../AdminPanel').then(module => ({ default: module.AdminPanel }))
);
const Login = React.lazy(() =>
  import('../admin/Login').then(module => ({ default: module.Login }))
);

export interface AdminGateProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminGate: React.FC<AdminGateProps> = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { config, updateConfig, resetConfig, saveError, setSaveError } = useSiteConfig();

  // 1. Initial Session Check (STRICT: ?admin=true backdoor removed completely)
  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then(user => {
      if (isMounted && user) {
        setIsAuthenticated(true);
      }
    });

    // Supabase auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setIsAuthenticated(!!session?.user);
        if (!session?.user) {
          setIsAdminOpen(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Cross-platform Hotkey Listener (CTRL+SHIFT+A or CMD+SHIFT+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;
      if (isModifier && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (isAuthenticated) {
          setIsAdminOpen(prev => !prev);
        } else {
          setShowLogin(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated]);

  const handleLogout = useCallback(async () => {
    await signOut();
    setIsAuthenticated(false);
    setIsAdminOpen(false);
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setShowLogin(false);
    setIsAdminOpen(true);
  }, []);

  return (
    <>
      {/* Toast Warning for Config Persistence */}
      {saveError && (
        <div className="fixed top-24 right-6 z-[10003] bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-md backdrop-blur-md max-w-xs text-xs flex items-start gap-3 shadow-2xl">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Aviso de Salvamento</p>
            <p>{saveError}</p>
          </div>
          <button
            onClick={() => setSaveError(null)}
            className="ml-auto hover:text-white cursor-pointer"
            aria-label="Fechar aviso"
          >
            <Shield size={12} />
          </button>
        </div>
      )}

      {/* Lazy Auth Login Modal */}
      {showLogin && (
        <Suspense fallback={null}>
          <Login
            onLoginSuccess={handleLoginSuccess}
            onClose={() => setShowLogin(false)}
          />
        </Suspense>
      )}

      {/* Lazy Admin Dashboard */}
      {isAdminOpen && isAuthenticated && (
        <Suspense fallback={null}>
          <AdminPanel
            config={config}
            onUpdate={updateConfig}
            onReset={resetConfig}
            hasSaveError={!!saveError}
            onLogout={handleLogout}
          />
        </Suspense>
      )}
    </>
  );
};
