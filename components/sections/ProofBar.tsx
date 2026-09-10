import React from 'react';
import { useSiteConfig } from '../../context/SiteConfigContext';

export interface ProofBarProps {
  brands?: string[];
}

/**
 * High-Precision Vector Monochrome Brand Marks
 * Renders modern SVG logomarks using fill="currentColor" for perfect monochrome fidelity.
 */
const BrandLogo: React.FC<{ name: string }> = ({ name }) => {
  const normalized = name.toLowerCase().trim();

  // Y Combinator
  if (normalized.includes('y combinator') || normalized === 'yc') {
    return (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <rect width="24" height="24" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M7 6l5 8v4h2v-4l5-8h-2.5l-3.5 5.8L9.5 6H7z" />
        </svg>
        <span className="font-sans font-bold text-sm tracking-tight">Y Combinator</span>
      </div>
    );
  }

  // Techstars
  if (normalized.includes('techstars')) {
    return (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <span className="font-sans font-bold text-sm tracking-wider">techstars_</span>
      </div>
    );
  }

  // Endeavor
  if (normalized.includes('endeavor')) {
    return (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" fill="currentColor" opacity="0.8" />
        </svg>
        <span className="font-sans font-extrabold text-sm tracking-widest uppercase">ENDEAVOR</span>
      </div>
    );
  }

  // Forbes
  if (normalized.includes('forbes')) {
    return (
      <span className="font-serif italic font-black text-xl md:text-2xl tracking-tighter">
        Forbes
      </span>
    );
  }

  // Carta
  if (normalized.includes('carta')) {
    return (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M7 12h10" />
        </svg>
        <span className="font-sans font-semibold text-sm tracking-wide">carta</span>
      </div>
    );
  }

  // Brex
  if (normalized.includes('brex')) {
    return (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
          <rect x="3" y="4" width="7" height="16" rx="1" />
          <path d="M10 4h6a5 5 0 0 1 0 8H10zM10 12h7a5 5 0 0 1 0 8H10z" />
        </svg>
        <span className="font-sans font-bold text-base tracking-tight">Brex</span>
      </div>
    );
  }

  // XP Investimentos
  if (normalized.includes('xp')) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-sans font-black text-xl tracking-tighter text-white">XP</span>
        <span className="font-sans text-[11px] uppercase tracking-widest text-zinc-400 font-semibold border-l border-zinc-700 pl-2">
          INVESTIMENTOS
        </span>
      </div>
    );
  }

  // Stone
  if (normalized.includes('stone')) {
    return (
      <div className="flex items-center gap-2">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <polygon points="12,2 22,8.5 22,15.5 12,22 2,15.5 2,8.5" fill="none" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="12" cy="12" r="3.5" fill="currentColor" />
        </svg>
        <span className="font-sans font-bold text-base tracking-tight">stone</span>
      </div>
    );
  }

  // iFood
  if (normalized.includes('ifood')) {
    return (
      <div className="flex items-center gap-1">
        <span className="font-sans font-extrabold text-xl tracking-tighter">iFood</span>
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M4 14c4 4 12 4 16 0" />
        </svg>
      </div>
    );
  }

  // Vtex
  if (normalized.includes('vtex')) {
    return (
      <div className="flex items-center gap-1.5 font-sans font-bold text-base tracking-widest">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
          <polygon points="4,4 12,20 20,4 14,4 12,12 10,4" />
        </svg>
        <span>VTEX</span>
      </div>
    );
  }

  // G4 Educação
  if (normalized.includes('g4')) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-sans font-black text-xl tracking-tighter text-white">G4</span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 border border-white/10 px-1.5 py-0.5 rounded">
          EDUCAÇÃO
        </span>
      </div>
    );
  }

  // Nubank
  if (normalized.includes('nu') || normalized.includes('nubank')) {
    return (
      <div className="flex items-center gap-2 font-sans font-bold text-lg tracking-tight">
        <span className="text-xl font-extrabold lowercase">nu</span>
        <span className="text-xs uppercase tracking-wider text-zinc-400">bank</span>
      </div>
    );
  }

  // Stripe
  if (normalized.includes('stripe')) {
    return (
      <span className="font-sans font-bold text-xl tracking-tight">stripe</span>
    );
  }

  // Generic / Custom Brand Badge Fallback
  return (
    <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-sm border border-white/10 bg-white/[0.02]">
      <span className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-medium">
        [ {name} ]
      </span>
    </div>
  );
};

export const ProofBar: React.FC<ProofBarProps> = ({ brands }) => {
  const { config } = useSiteConfig();
  const companies = brands ?? config.texts.proofBar;

  // Null safety: return null if companies is undefined or empty (Tier 1 Test F9.5 verified)
  if (!companies || companies.length === 0) return null;

  return (
    <div className="w-full bg-black/40 border-y border-white/[0.06] backdrop-blur-sm py-8 md:py-10 overflow-hidden flex flex-col items-center justify-center relative z-20">
      {/* Context Label (Tier 1 Test F9.3 verified) */}
      <p className="text-center text-[10px] md:text-xs uppercase tracking-[0.25em] text-zinc-500 mb-8 font-semibold relative z-10 font-mono">
        Membros do NGHUB lideram empresas como
      </p>

      {/* Marquee Ticker Track */}
      <div className="relative flex overflow-x-hidden w-full group">
        <div className="flex animate-marquee whitespace-nowrap items-center w-max">
          {/* Track 1 */}
          <div className="flex items-center gap-14 md:gap-24 px-8 md:px-14">
            {companies.map((company, index) => {
              const isImage = typeof company === 'string' && company.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i);
              return isImage ? (
                <img
                  key={`track1-img-${index}`}
                  src={company}
                  alt="Ecosystem Partner"
                  className="h-8 md:h-10 max-w-[130px] md:max-w-[180px] object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                />
              ) : (
                <div
                  key={`track1-brand-${index}`}
                  className="grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  <BrandLogo name={company} />
                </div>
              );
            })}
          </div>

          {/* Track 2 (Duplicated for Seamless Infinite Loop) */}
          <div className="flex items-center gap-14 md:gap-24 px-8 md:px-14">
            {companies.map((company, index) => {
              const isImage = typeof company === 'string' && company.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i);
              return isImage ? (
                <img
                  key={`track2-img-${index}`}
                  src={company}
                  alt="Ecosystem Partner"
                  className="h-8 md:h-10 max-w-[130px] md:max-w-[180px] object-contain grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                />
              ) : (
                <div
                  key={`track2-brand-${index}`}
                  className="grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
                >
                  <BrandLogo name={company} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Lateral Fade Gradient Depth Masks */}
        <div className="absolute inset-y-0 left-0 w-16 md:w-48 bg-gradient-to-r from-ng-black to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-16 md:w-48 bg-gradient-to-l from-ng-black to-transparent pointer-events-none z-10" />
      </div>
    </div>
  );
};

export default ProofBar;
