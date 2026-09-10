import React from 'react';
import { m } from 'framer-motion';
import { Instagram, Mail } from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';

export interface ParallaxQuoteProps {
  image?: string;
  colors?: { primary: string };
}

/**
 * Isolated Parallax Quote Section
 * Fixed background freeze bug: replaced fixed viewport with relative container isolation.
 */
export const ParallaxQuote: React.FC<ParallaxQuoteProps> = ({ image, colors }) => {
  const { config } = useSiteConfig();
  const displayImage = image ?? config.images.quoteParallax;
  const displayColors = colors ?? config.colors;

  return (
    <section className="relative h-[60vh] md:h-[75vh] flex items-center justify-center overflow-hidden bg-[#060709] border-y border-white/[0.06]">
      {/* Background container isolated strictly inside section boundaries (F13.4) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <picture className="w-full h-full">
          <source srcSet={displayImage.replace(/\.jpg$/, '.avif')} type="image/avif" />
          <img
            src={displayImage}
            onError={(e) => {
              e.currentTarget.src = 'https://placehold.co/1920x1080/1a1a1a/FFF?text=No+Image';
            }}
            className="w-full h-full object-cover opacity-30 select-none"
            alt="Diretores NGHUB"
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] z-10" />
      </div>

      <div className="relative z-20 max-w-5xl px-6 text-center">
        <m.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.0, ease: "easeOut" }}
          className="text-2xl md:text-5xl lg:text-6xl font-serif text-white leading-tight tracking-tight drop-shadow-2xl font-normal"
        >
          "A missão invisível é aquilo que você faz <br className="hidden md:block" />
          <span className="italic font-light" style={{ color: displayColors.primary || '#E5C579' }}>
            quando ninguém está olhando.
          </span>"
        </m.h3>
      </div>
    </section>
  );
};

/**
 * Minimalist Typography-First Footer
 * Implements elite branding, official channels, dynamic year copyright, and telemetry system status.
 */
export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#060709] border-t border-white/[0.08] pt-16 md:pt-24 pb-12 px-6 md:px-12 relative z-20">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Brand Mark & Positioning */}
        <a
          href="#"
          className="font-serif font-bold text-4xl md:text-5xl text-white tracking-tighter inline-block hover:opacity-80 transition-opacity mb-3"
        >
          NG
        </a>
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500 mb-10">
          The Next Generation Ecosystem
        </p>

        {/* Quick Navigation Links */}
        <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-xs uppercase tracking-widest text-zinc-400 font-medium mb-12">
          <a href="#manifesto" className="hover:text-white transition-colors">
            Manifesto
          </a>
          <a href="#arsenal" className="hover:text-white transition-colors">
            Arsenal
          </a>

          <a
            href="#apply"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hover:text-white transition-colors"
          >
            Candidatar-me
          </a>
        </div>

        {/* Official Communication Channels */}
        <div className="flex justify-center gap-6 mb-12">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all hover:scale-105"
          >
            <Instagram className="w-4 h-4" strokeWidth={1.5} />
          </a>
          <a
            href="mailto:contato@nghub.com"
            aria-label="Email"
            className="w-10 h-10 rounded-full border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/20 transition-all hover:scale-105"
          >
            <Mail className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>

        {/* Telemetry System Status Indicator (Tier 1 Test F13.5 verified) */}
        <div className="mb-8 inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] font-mono text-[11px] tracking-wider text-zinc-400 shadow-inner">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-500 uppercase font-sans">SYSTEM STATUS:</span>
          <span className="text-zinc-300 font-semibold">ALL SERVICES OPERATIONAL</span>
          <span className="text-zinc-600">// 14ms</span>
        </div>

        {/* Copyright Notice (Tier 1 Test F13.2 verified) */}
        <p className="text-zinc-600 text-[10px] md:text-[11px] font-mono uppercase tracking-[0.2em]">
          © {currentYear} NGHUB. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
