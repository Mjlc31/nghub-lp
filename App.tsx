import React, { useState, Suspense, useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { getCurrentUser, signOut } from './services/supabase';

import { LeadForm } from './components/LeadForm';
import { AdminPanel } from './components/AdminPanel';
import { Login } from './components/admin/Login';
import { GlobalEffects } from './components/ui/Effects';
import { Hero } from './components/sections/Hero';
import { ManifestoTeaser, ManifestoModal } from './components/sections/Manifesto';

// Hooks
import { useSiteConfig } from './hooks/useSiteConfig';

// Lazy Loaded Components
const Arsenal = React.lazy(() => import('./components/sections/Arsenal').then(module => ({ default: module.Arsenal })));
const Gallery = React.lazy(() => import('./components/sections/Gallery').then(module => ({ default: module.Gallery })));
const Footer = React.lazy(() => import('./components/sections/Footer').then(module => ({ default: module.Footer })));
const ParallaxQuote = React.lazy(() => import('./components/sections/Footer').then(module => ({ default: module.ParallaxQuote })));

// Loading Component
const SectionLoader = () => (
  <div className="w-full h-96 flex items-center justify-center text-ng-gold/30">
    <div className="animate-pulse">Carregando...</div>
  </div>
);

const App: React.FC = () => {
  // UI State
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check Auth on Mount or URL Override
  useEffect(() => {
    // 1. Check URL for ?admin=true (Developer Mode)
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'true') {
      setIsAuthenticated(true);
      setIsAdminOpen(true);
    }

    // 2. Check Supabase Session
    getCurrentUser().then(user => {
      if (user) setIsAuthenticated(true);
    });
  }, []);

  // Hotkey for Admin Login (CTRL+SHIFT+A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
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

  const handleLogout = async () => {
    await signOut();
    setIsAuthenticated(false);
    setIsAdminOpen(false);
  };

  // Custom Hook (Assumes useSiteConfig handles Supabase logic internally now, or we pass it down)
  // For now, let's stick to the existing hook but we will modify it to use Supabase later
  const { config, setConfig, resetConfig, saveError, setSaveError } = useSiteConfig();

  const scrollToApply = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('apply');
    if (element) {
      if (isManifestoOpen) setIsManifestoOpen(false);
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { images, texts, colors } = config;
  const manifestoImage = images.gallery.length > 1 ? images.gallery[1] : images.hero;

  return (
    <div className="min-h-screen font-sans bg-ng-black text-ng-white selection:bg-ng-gold selection:text-black relative">
      <GlobalEffects />

      {/* Auth & Admin Modals */}
      {showLogin && (
        <Login
          onLoginSuccess={() => { setIsAuthenticated(true); setShowLogin(false); setIsAdminOpen(true); }}
          onClose={() => setShowLogin(false)}
        />
      )}

      {isAdminOpen && isAuthenticated && (
        <AdminPanel
          config={config}
          onUpdate={setConfig}
          onReset={resetConfig}
          hasSaveError={!!saveError}
          onLogout={handleLogout}
        />
      )}

      {/* Toast Warning */}
      {saveError && (
        <div className="fixed top-24 right-6 z-[102] bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-md backdrop-blur-md max-w-xs text-xs flex items-start gap-3 shadow-2xl">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-bold mb-1">Aviso de Salvamento</p>
            <p>{saveError}</p>
          </div>
          <button onClick={() => setSaveError(null)} className="ml-auto hover:text-white"><Shield size={12} /></button>
        </div>
      )}

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 md:px-8 py-6 md:py-8 flex justify-between items-center mix-blend-difference backdrop-blur-sm md:backdrop-blur-none transition-all duration-300">
        <a href="#" className="font-serif font-bold text-2xl md:text-3xl tracking-tighter text-white">NG</a>
        <div className="hidden md:flex gap-8 text-xs uppercase tracking-widest text-white/70 items-center">
          <button
            onClick={() => setIsManifestoOpen(true)}
            className="hover:text-white transition-colors uppercase tracking-widest font-medium"
          >
            Manifesto
          </button>

          <a href="#arsenal" className="hover:text-white transition-colors">Arsenal</a>
          <a
            href="#apply"
            onClick={scrollToApply}
            className="hover:text-white transition-colors font-semibold"
            style={{ color: colors.primary }}
          >
            Candidatar-me
          </a>
        </div>
        <a
          href="#apply"
          onClick={scrollToApply}
          className="md:hidden text-[10px] uppercase tracking-widest border px-3 py-1.5 rounded-sm"
          style={{ color: colors.primary, borderColor: `${colors.primary}4D` }}
        >
          Candidatar-me
        </a>
      </nav>

      <Hero
        images={images}
        texts={texts}
        colors={colors}
        scrollToApply={scrollToApply}
      />

      <ManifestoTeaser
        texts={texts}
        colors={colors}
        setIsManifestoOpen={setIsManifestoOpen}
      />

      <Suspense fallback={<SectionLoader />}>
        <ParallaxQuote
          image={images.quoteParallax}
          colors={colors}
        />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <Arsenal colors={colors} />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <Gallery
          images={images}
          colors={colors}
          scrollToApply={scrollToApply}
        />
      </Suspense>

      <section id="apply" className="py-24 md:py-32 px-4 md:px-6 relative z-20 bg-ng-black min-h-screen flex items-center justify-center scroll-mt-28">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent pointer-events-none" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[800px] h-[300px] md:h-[800px] rounded-full blur-[80px] md:blur-[120px] pointer-events-none"
          style={{ backgroundColor: colors.primary, opacity: 0.05 }}
        />

        <div className="w-full relative z-10">
          <LeadForm endpoint={config.integration?.formEndpoint} />
        </div>
      </section>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      <ManifestoModal
        isManifestoOpen={isManifestoOpen}
        setIsManifestoOpen={setIsManifestoOpen}
        texts={texts}
        colors={colors}
        manifestoImage={manifestoImage}
      />
    </div>
  );
};

export default App;