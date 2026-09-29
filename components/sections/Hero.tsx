import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, ArrowRight, ArrowUpRight } from 'lucide-react';
import { AmbientLight } from '../ui/Effects';
import { useSiteConfig } from '../../context/SiteConfigContext';

gsap.registerPlugin(ScrollTrigger);

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

  const containerRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();

    // Background parallax & fade
    gsap.to(bgRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      scale: 1.05,
      opacity: 0,
    });

    // Text parallax
    gsap.to(textRef.current, {
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
      y: 100,
      opacity: 0,
    });

    // Entrance Animation
    if (textRef.current) {
      tl.fromTo(
        textRef.current.querySelectorAll('.reveal-text'),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      );
    }

    if (videoRef.current) {
      tl.fromTo(
        videoRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      );
    }

    if (indicatorRef.current) {
      tl.fromTo(
        indicatorRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1 },
        '-=0.2'
      );

      // Bouncing indicator
      const chevron = indicatorRef.current.querySelector('.chevron');
      if (chevron) {
        gsap.to(chevron, {
          y: 8,
          opacity: 0.9,
          duration: 1,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut'
        });
      }
    }

  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 md:px-6 py-24 md:py-32 overflow-hidden">
      <AmbientLight primaryColor={heroColors.primary} />

      <div ref={bgRef} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-ng-black/80 via-ng-black/50 to-ng-black z-10" />

        {/* Noise Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] z-[11] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div
        ref={textRef}
        className="relative z-20 max-w-6xl mx-auto text-center mt-12 md:mt-16"
      >
        {/* Event Badge / Scarcity Trigger */}
        <div className="reveal-text inline-flex items-center gap-3 border border-[#E5C579]/30 px-5 py-2 md:px-6 md:py-2.5 rounded-full bg-black/40 backdrop-blur-md mb-8 text-[10px] md:text-xs uppercase tracking-[0.25em] text-white/90 shadow-[0_0_20px_rgba(229,197,121,0.15)]">
           <span className="w-1.5 h-1.5 rounded-full bg-[#E5C579] animate-pulse"></span>
           <span className="font-semibold text-[#E5C579]">{config.event?.date || '12 de Novembro'}</span>
           <span className="opacity-40">•</span>
           <span>{config.event?.location || 'Maceió, AL'}</span>
           <span className="opacity-40">•</span>
           <span className="font-serif italic text-[#E5C579] normal-case text-xs md:text-sm tracking-normal">Apenas {config.event?.seats || 60} lugares</span>
        </div>

        {/* Minimalist Headline with Dynamic Highlight */}
        <h1
          className="reveal-text text-[clamp(2.5rem,6.5vw,6rem)] font-serif text-white mb-6 md:mb-8 leading-[1.06] tracking-tight whitespace-pre-line drop-shadow-2xl font-normal"
        >
          {heroTexts.heroTitle.split(' ').map((word, i) => {
            const clean = word.toLowerCase().replace(/[.,]/g, '');
            const isHighlight = ['7', 'dígitos', 'sozinho', 'mesa', 'certa'].includes(clean);
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
        </h1>

        {/* Anti-Guru Subtitle */}
        <p
          className="reveal-text text-base md:text-xl text-zinc-300 max-w-xl md:max-w-2xl mx-auto mb-10 md:mb-12 font-light leading-relaxed px-4 drop-shadow-lg"
        >
          {heroTexts.heroSubtitle}
        </p>

        {/* Dual-CTAs: Primary Apply & Secondary Manifesto */}
        <div
          className="reveal-text flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-5 mb-12 md:mb-14"
        >
          {/* Primary CTA */}
          <a
            href="#apply"
            onClick={handleScrollToApply}
            className="group relative w-full sm:w-auto px-8 py-4 overflow-hidden rounded-full font-sans text-xs md:text-sm uppercase tracking-[0.18em] font-semibold text-[#060709] transition-all duration-300 shadow-[0_0_30px_rgba(229,197,121,0.25)] hover:shadow-[0_0_40px_rgba(229,197,121,0.45)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 cursor-pointer"
            style={{ backgroundColor: heroColors.primary || '#E5C579' }}
          >
            <span>{heroTexts.ctaButton || "Aplicar para a Mesa"}</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Secondary CTA */}
          <button
            onClick={handleManifestoClick}
            className="group w-full sm:w-auto px-8 py-4 rounded-full border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/[0.25] text-zinc-300 hover:text-white font-sans text-xs md:text-sm uppercase tracking-[0.18em] font-medium transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <span>Ler Manifesto</span>
            <ArrowUpRight size={15} className="text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
          </button>
        </div>


      </div>

      {/* Video Presentation Section (if configured) */}
      {heroImages.heroVideo && heroImages.heroVideo.length === 11 && (
        <div
          ref={videoRef}
          className="relative z-30 w-full max-w-4xl mx-auto mt-12 mb-12 md:mb-16 aspect-video rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(197,160,89,0.15)] ring-1 ring-white/5 bg-black"
        >
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${heroImages.heroVideo}?rel=0&modestbranding=1`}
            title="Apresentação NGHUB"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Subtle Scroll Down Indicator */}
      <div
        ref={indicatorRef}
        className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <div
          className="chevron text-white/40"
        >
          <ChevronDown size={22} strokeWidth={1} />
        </div>
      </div>
    </section>
  );
};

export default Hero;
