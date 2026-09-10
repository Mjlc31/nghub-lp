import React from 'react';
import { m, useScroll, useTransform, Variants } from 'framer-motion';
import { ChevronDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { AmbientLight } from '../ui/Effects';
import { useSiteConfig } from '../../context/SiteConfigContext';

export interface TelemetryMetric {
  label: string;
  value: string;
  badge?: string;
}

export interface HeroProps {
  images?: { hero: string; heroVideo?: string };
  texts?: {
    heroTitle: string;
    heroSubtitle: string;
    ctaButton: string;
  };
  colors?: { primary: string };
  scrollToApply?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onOpenManifesto?: () => void;
  telemetry?: TelemetryMetric[];
}

const DEFAULT_TELEMETRY: TelemetryMetric[] = [
  { label: 'FOUNDERS', value: '42+', badge: '[ 42+ FOUNDERS ]' },
  { label: 'ARR AGREGADO', value: 'R$ 180M+', badge: '[ R$ 180M+ ARR ]' },
  { label: 'RETENÇÃO', value: '98.4%', badge: '[ 98.4% RETENTION ]' },
  { label: 'TAXA DE ACEITAÇÃO', value: '4.2%', badge: '[ 4.2% TAXA DE ACEITAÇÃO ]' }
];

export const Hero: React.FC<HeroProps> = ({
  images,
  texts,
  colors,
  scrollToApply,
  onOpenManifesto,
  telemetry
}) => {
  const { config } = useSiteConfig();
  const heroImages = images ?? config.images;
  const heroTexts = texts ?? config.texts;
  const heroColors = colors ?? config.colors;
  const telemetryMetrics = telemetry ?? DEFAULT_TELEMETRY;

  const handleScrollToApply = scrollToApply ?? ((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  });

  const handleManifestoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenManifesto) {
      onOpenManifesto();
    } else {
      document.getElementById('manifesto')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 1.05]);
  const textY = useTransform(scrollY, [0, 500], [0, 100]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-6 py-24 md:py-32 overflow-hidden">
      <AmbientLight primaryColor={heroColors.primary} />

      <m.div style={{ scale: heroScale }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-ng-black/80 via-ng-black/50 to-ng-black z-10" />

        {/* Noise Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] z-[11] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </m.div>

      <m.div
        style={{ opacity: heroOpacity, y: textY }}
        className="relative z-20 max-w-6xl mx-auto text-center mt-12 md:mt-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Minimalist Headline with Dynamic Highlight */}
        <m.h1
          variants={itemVariants}
          className="text-[clamp(2.5rem,6.5vw,6rem)] font-serif text-white mb-6 md:mb-8 leading-[1.06] tracking-tight whitespace-pre-line drop-shadow-2xl font-normal"
        >
          {heroTexts.heroTitle.split(' ').map((word, i) => {
            const clean = word.toLowerCase().replace(/[.,]/g, '');
            const isHighlight = ['estagnado', 'insiste', 'não', 'sabe', 'ir'].includes(clean);
            return (
              <span
                key={i}
                className={isHighlight ? 'font-serif italic font-light' : ''}
                style={isHighlight ? { color: heroColors.primary || '#E5C579' } : {}}
              >
                {word}{' '}
              </span>
            );
          })}
        </m.h1>

        {/* Anti-Guru Subtitle */}
        <m.p
          variants={itemVariants}
          className="text-base md:text-xl text-zinc-300 max-w-xl md:max-w-2xl mx-auto mb-10 md:mb-12 font-light leading-relaxed px-4 drop-shadow-lg"
        >
          {heroTexts.heroSubtitle}
        </m.p>

        {/* Dual-CTAs: Primary Apply & Secondary Manifesto */}
        <m.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5 mb-12 md:mb-14"
        >
          {/* Primary CTA */}
          <a
            href="#apply"
            onClick={handleScrollToApply}
            className="group relative w-full sm:w-auto px-8 py-4 overflow-hidden rounded-full font-sans text-xs md:text-sm uppercase tracking-[0.18em] font-semibold text-[#060709] transition-all duration-300 shadow-[0_0_30px_rgba(229,197,121,0.25)] hover:shadow-[0_0_40px_rgba(229,197,121,0.45)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
            style={{ backgroundColor: heroColors.primary || '#E5C579' }}
          >
            <span>Candidatar-me</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Secondary CTA */}
          <button
            onClick={handleManifestoClick}
            className="group w-full sm:w-auto px-8 py-4 rounded-full border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/[0.25] text-zinc-300 hover:text-white font-sans text-xs md:text-sm uppercase tracking-[0.18em] font-medium transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-3 cursor-pointer"
          >
            <span>Ler Manifesto</span>
            <ArrowUpRight size={15} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </button>
        </m.div>


      </m.div>

      {/* Video Presentation Section (if configured) */}
      {heroImages.heroVideo && heroImages.heroVideo.length === 11 && (
        <m.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="relative z-30 w-full max-w-4xl mx-auto mt-12 mb-12 md:mb-16 aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(197,160,89,0.15)] ring-1 ring-white/5 bg-black"
        >
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${heroImages.heroVideo}?rel=0&modestbranding=1`}
            title="Apresentação NGHUB"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </m.div>
      )}

      {/* Subtle Scroll Down Indicator */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <m.div
          animate={{ y: [0, 8, 0], opacity: [0.3, 0.9, 0.3] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="text-white/40"
        >
          <ChevronDown size={22} strokeWidth={1} />
        </m.div>
      </m.div>
    </section>
  );
};

export default Hero;
