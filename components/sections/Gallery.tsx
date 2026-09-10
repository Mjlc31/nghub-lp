import React from 'react';
import { m } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';

export interface GalleryProps {
  images?: { gallery: string[] };
  colors?: { primary: string };
  scrollToApply?: (e?: React.MouseEvent) => void;
}

interface ShowcaseItem {
  image: string;
  badge: string;
  title: string;
  location: string;
}

const SHOWCASE_METADATA: ShowcaseItem[] = [
  {
    image: '/NG-355.jpg',
    badge: '[ DINNER // FARIA LIMA ]',
    title: 'Closed-Door Executive Dinner',
    location: 'Faria Lima, São Paulo'
  },
  {
    image: '/NG-392.jpg',
    badge: '[ PRIVATE SESSION // JK IGUATEMI ]',
    title: 'Boardroom Advisory & Governance',
    location: 'JK Iguatemi, São Paulo'
  },
  {
    image: '/NG-599.jpg',
    badge: '[ ANNUAL SUMMIT // SÃO PAULO ]',
    title: 'Annual Assembly of Founders',
    location: 'Rosewood, São Paulo'
  },
  {
    image: '/NG-607.jpg',
    badge: '[ MASTERMIND // ALPHAVILLE ]',
    title: 'Strategic Scaling & M&A Retreat',
    location: 'Alphaville, São Paulo'
  },
  {
    image: '/NG-863 (1).jpg',
    badge: '[ DINNER // FARIA LIMA ]',
    title: 'Syndicate & Deal Flow Briefing',
    location: 'Faria Lima, São Paulo'
  },
  {
    image: '/NG-873.jpg',
    badge: '[ PRIVATE SESSION // JK IGUATEMI ]',
    title: 'Capital Allocation Roundtable',
    location: 'JK Iguatemi, São Paulo'
  }
];

export const Gallery: React.FC<GalleryProps> = ({ images, colors, scrollToApply }) => {
  const { config } = useSiteConfig();
  const displayImages = images ?? config.images;
  const displayColors = colors ?? config.colors;

  const handleScrollToApply = scrollToApply ?? ((e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  });

  const galleryList = displayImages.gallery || [];
  if (galleryList.length === 0) return null;

  // Reconcile images with metadata, handling sparse lists (F12.4)
  const items: ShowcaseItem[] = galleryList.slice(0, 6).map((img, index) => {
    const meta = SHOWCASE_METADATA[index % SHOWCASE_METADATA.length];
    return {
      image: img,
      badge: meta.badge,
      title: meta.title,
      location: meta.location
    };
  });

  return (
    <section className="py-24 md:py-36 bg-[#060709] relative z-20 border-t border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-[#0C0E12] mb-6">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: displayColors.primary || '#E5C579' }} />
              <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
                [ SHOWCASE // AMBIENTE & PRESENÇA ]
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight">
              Inside NGHUB
            </h2>
            <p className="text-zinc-400 font-light text-sm md:text-base max-w-xl mt-4 leading-relaxed">
              Registros autênticos de imersões, conselhos executivos e encontros bilaterais onde teses são confrontadas e parcerias são formalizadas.
            </p>
          </div>

          <a
            href="#apply"
            onClick={handleScrollToApply}
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest border-b pb-1 hover:text-white transition-colors cursor-pointer self-start md:self-end"
            style={{ color: displayColors.primary || '#E5C579', borderColor: displayColors.primary || '#E5C579' }}
          >
            <span>Candidatar-me</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* Full-bleed Infinite Horizontal Marquee */}
      <div className="relative w-full overflow-hidden flex flex-col gap-4 mt-8 py-4">
        {/* Faded edges for better blending */}
        <div className="absolute inset-y-0 left-0 w-12 md:w-32 bg-gradient-to-r from-[#060709] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-32 bg-gradient-to-l from-[#060709] to-transparent z-10 pointer-events-none" />

        <div className="flex w-max animate-marquee gap-4 md:gap-6 hover:[animation-play-state:paused] px-4">
          {[...items, ...items, ...items].map((item, index) => (
            <m.div
              key={index}
              className="group relative rounded-xl overflow-hidden bg-[#0C0E12] border border-white/[0.08] hover:border-white/20 transition-all duration-500 shadow-xl shrink-0 w-[280px] h-[350px] sm:w-[320px] sm:h-[400px] md:w-[400px] md:h-[500px]"
            >
              <div className="w-full h-full overflow-hidden relative">
                <picture className="w-full h-full">
                  <source srcSet={item.image.replace(/\.jpg$/, '.avif')} type="image/avif" />
                  <img
                    src={item.image}
                    alt={item.title || 'NGHUB Gallery'}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out opacity-80 group-hover:opacity-100"
                  />
                </picture>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0E12]/80 via-transparent to-black/10 pointer-events-none" />
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
