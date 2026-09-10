import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';

export interface NavbarProps {
  onOpenManifesto: () => void;
  onApplyClick?: (e?: React.MouseEvent) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenManifesto, onApplyClick }) => {
  const { config } = useSiteConfig();
  const { colors } = config;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleApply = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (onApplyClick) {
      onApplyClick(e);
    } else {
      document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleManifesto = () => {
    setIsMobileMenuOpen(false);
    onOpenManifesto();
  };



  return (
    <>
      {/* Floating Container Wrapper */}
      <header className="fixed top-4 md:top-6 inset-x-0 z-50 flex justify-center px-4 pointer-events-none transition-all duration-300">
        <div
          className={`pointer-events-auto backdrop-blur-md bg-[#060709]/80 border transition-all duration-300 rounded-full px-5 md:px-7 py-2.5 md:py-3 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-5xl w-full ${
            isScrolled ? 'border-white/[0.14] bg-[#060709]/90 shadow-2xl' : 'border-white/[0.08]'
          }`}
        >
          {/* Brand Mark & Live Admissions Chip */}
          <div className="flex items-center gap-3 md:gap-5">
            <a
              href="#"
              className="font-serif font-bold text-xl md:text-2xl tracking-tighter text-white hover:opacity-80 transition-opacity"
            >
              NG
            </a>

          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-widest text-zinc-400 font-medium">
            <button
              onClick={onOpenManifesto}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Manifesto
            </button>
            <a href="#arsenal" className="hover:text-white transition-colors">
              Arsenal
            </a>
            <a
              href="#apply"
              onClick={handleApply}
              className="px-4 py-2 rounded-full font-semibold text-xs tracking-wider transition-all duration-300 hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(229,197,121,0.2)]"
              style={{
                color: '#060709',
                backgroundColor: colors.primary || '#E5C579'
              }}
            >
              Candidatar-me
            </a>
          </nav>

          {/* Mobile Right Controls: Quick CTA & Hamburger */}
          <div className="flex md:hidden items-center gap-2.5">
            <a
              href="#apply"
              onClick={handleApply}
              className="text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-semibold"
              style={{
                color: '#060709',
                backgroundColor: colors.primary || '#E5C579'
              }}
            >
              Candidatar
            </a>
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              aria-label="Abrir menu"
              className="p-1.5 text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <m.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] md:hidden"
            />

            {/* Drawer Container */}
            <m.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-[310px] max-w-[85vw] bg-[#0C0E12] border-l border-white/[0.08] z-[91] md:hidden flex flex-col p-6 shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-5 border-b border-white/[0.08]">
                <span className="font-serif font-bold text-2xl text-white tracking-tighter">NG</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Fechar menu"
                  className="p-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="flex flex-col gap-6 py-4 text-sm uppercase tracking-widest text-zinc-300">
                <button
                  onClick={handleManifesto}
                  className="text-left hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Manifesto</span>
                  <ArrowUpRight size={14} className="text-zinc-600" />
                </button>
                <a
                  href="#arsenal"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:text-white transition-colors flex items-center justify-between"
                >
                  <span>Arsenal</span>
                  <ArrowUpRight size={14} className="text-zinc-600" />
                </a>
              </div>

              {/* Drawer CTA & Footer */}
              <div className="mt-auto pt-6 border-t border-white/[0.08]">
                <a
                  href="#apply"
                  onClick={handleApply}
                  className="block w-full py-3.5 text-center text-xs uppercase tracking-widest font-semibold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(229,197,121,0.25)]"
                  style={{
                    color: '#060709',
                    backgroundColor: colors.primary || '#E5C579'
                  }}
                >
                  Candidatar-me
                </a>
                <div className="mt-6 flex flex-col items-center gap-1 font-mono text-[10px] text-zinc-600 uppercase tracking-widest">
                  <span>NGHUB © {new Date().getFullYear()}</span>
                  <span className="text-[9px] text-emerald-500/70">• SYSTEM OPERATIONAL</span>
                </div>
              </div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
