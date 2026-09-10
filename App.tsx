import React, { useState, Suspense } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';
import { SiteConfigProvider } from './context/SiteConfigContext';
import { GlobalEffects } from './components/ui/Effects';
import { Navbar } from './components/layout/Navbar';
import { AdminGate } from './components/layout/AdminGate';
import { Hero } from './components/sections/Hero';
import { ProofBar } from './components/sections/ProofBar';
import { BentoGrid } from './components/sections/BentoGrid';
import { ManifestoTeaser, ManifestoModal } from './components/sections/Manifesto';
import { ApplicationSection } from './components/sections/ApplicationSection';

// Lazy Loaded Sections
const Gallery = React.lazy(() => import('./components/sections/Gallery').then(m => ({ default: m.Gallery })));
const Footer = React.lazy(() => import('./components/sections/Footer').then(m => ({ default: m.Footer })));
const ParallaxQuote = React.lazy(() => import('./components/sections/Footer').then(m => ({ default: m.ParallaxQuote })));
const Arsenal = React.lazy(() => import('./components/sections/Arsenal').then(m => ({ default: m.Arsenal })));

const SectionLoader = () => (
  <div className="w-full h-96 flex items-center justify-center text-ng-gold/30">
    <div className="animate-pulse">Carregando...</div>
  </div>
);

const AppContent: React.FC = () => {
  const [isManifestoOpen, setIsManifestoOpen] = useState(false);
  void Arsenal;

  const scrollToApply = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isManifestoOpen) setIsManifestoOpen(false);
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen font-sans bg-ng-black text-ng-white selection:bg-ng-gold selection:text-black relative">
      <GlobalEffects />
      <Navbar onOpenManifesto={() => setIsManifestoOpen(true)} onApplyClick={scrollToApply} />

      <main>
        <Hero scrollToApply={scrollToApply} />
        <ProofBar />
        <BentoGrid />
        <ManifestoTeaser setIsManifestoOpen={setIsManifestoOpen} />
        <Suspense fallback={<SectionLoader />}><ParallaxQuote /></Suspense>
        <Suspense fallback={<SectionLoader />}><Gallery scrollToApply={scrollToApply} /></Suspense>
        <ApplicationSection />
      </main>

      <Suspense fallback={null}><Footer /></Suspense>
      <ManifestoModal isManifestoOpen={isManifestoOpen} setIsManifestoOpen={setIsManifestoOpen} />
      <AdminGate />
    </div>
  );
};

const App: React.FC = () => (
  <LazyMotion features={domAnimation} strict>
    <SiteConfigProvider>
      <AppContent />
    </SiteConfigProvider>
  </LazyMotion>
);

export default App;
