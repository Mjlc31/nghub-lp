import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, TrendingUp, Compass, ArrowUpRight, Zap } from 'lucide-react';
import { SpotlightCard } from '../ui/Spotlight';
import { useSiteConfig } from '../../context/SiteConfigContext';

gsap.registerPlugin(ScrollTrigger);

export interface BentoCardData {
  id: string;
  colSpan: string;
  title: string;
  badge: string;
  stat: string;
  description: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  metricLabel: string;
}

export interface BentoGridProps {
  pillars?: Array<{ title: string; description: string }>;
  colors?: { primary: string };
  id?: string;
}

const DEFAULT_BENTO_CARDS: BentoCardData[] = [
  {
    id: 'card-1',
    colSpan: 'col-span-12 md:col-span-8',
    title: 'Networking de Alto Nível',
    badge: '[ ECOSYSTEM // TIER 01 ]',
    stat: '42+ MEMBROS ATIVOS',
    metricLabel: 'R$ 180M+ ARR COMBINADO',
    description: 'Conecte-se com quem está no mesmo jogo que você. Troque ideias com fundadores que já escalaram para 8 e 9 dígitos em conselhos bilaterais e encontros fechados.',
    icon: Users
  },
  {
    id: 'card-2',
    colSpan: 'col-span-12 md:col-span-4',
    title: 'Acesso a Capital',
    badge: '[ SYNDICATE // SMART MONEY ]',
    stat: 'R$ 35M+ ALOCADOS',
    metricLabel: 'FAMILY OFFICES & VC',
    description: 'Encurte o caminho entre a sua ideia e os investidores certos. Apresente seus projetos para smart money e fundos VC com alinhamento de tese.',
    icon: TrendingUp
  },
  {
    id: 'card-3',
    colSpan: 'col-span-12 md:col-span-4',
    title: 'Mentoria Real',
    badge: '[ FIELD-TESTED // BOARDROOM ]',
    stat: '1:1 BOARD SESSIONS',
    metricLabel: 'SEM TEORIA DE PALCO',
    description: 'Aprenda com os erros e acertos de quem já construiu negócios milionários, sem teorias, apenas field-tested knowledge comprovado no balanço.',
    icon: Compass
  },
  {
    id: 'card-4',
    colSpan: 'col-span-12 md:col-span-8',
    title: 'Deals & Co-investimento',
    badge: '[ DEAL FLOW // M&A LATAM ]',
    stat: '14 DEALS CO-INVESTIDOS',
    metricLabel: '100% FECHADOS INTERNAMENTE',
    description: 'Acesso proprietário a rodadas exclusivas, parcerias bilaterais e M&A negociados nos bastidores do ecossistema antes de chegarem a mercado.',
    icon: Zap
  }
];

export const BentoGrid: React.FC<BentoGridProps> = ({ pillars, colors, id = 'arsenal' }) => {
  const { config } = useSiteConfig();
  const displayPillars = pillars ?? config.texts.pillars;
  const displayColors = colors ?? config.colors;

  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Header reveal
    gsap.fromTo(headerRef.current,
      { y: 24, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
        }
      }
    );

    // Cards stagger
    gsap.fromTo('.bento-card',
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        }
      }
    );
  }, { scope: sectionRef });

  if (!displayPillars || displayPillars.length === 0) return null;

  const cards: BentoCardData[] = DEFAULT_BENTO_CARDS.map((defaultCard, index) => {
    if (displayPillars[index]) {
      return {
        ...defaultCard,
        title: displayPillars[index].title,
        description: displayPillars[index].description
      };
    }
    return defaultCard;
  });

  return (
    <section id={id} ref={sectionRef} className="py-24 md:py-36 bg-[#060709] relative z-10 border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div
          ref={headerRef}
          className="text-center mb-16 md:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-[#0C0E12] mb-6">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: displayColors.primary || '#E5C579' }} />
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              [ ECOSYSTEM // ARSENAL OPERACIONAL ]
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif text-white mb-6 tracking-tight">
            O Ecossistema de Execução
          </h2>
          <p className="text-zinc-400 font-light text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Substituímos o ruído do mercado por um ambiente fechado de alta densidade. Quatro vetores fundamentais para a perpetuidade do seu negócio.
          </p>
        </div>

        {/* Horizontal Scroll Container */}
        <div className="flex overflow-x-auto gap-6 pb-12 snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {cards.map((card) => {
            const Icon = card.icon;
            
            // Map the previous grid spans to horizontal widths
            const isLarge = card.colSpan.includes('8');
            const widthClass = isLarge 
              ? 'w-[85vw] md:w-[600px] lg:w-[700px]' 
              : 'w-[85vw] md:w-[400px] lg:w-[450px]';

            return (
              <div
                key={card.id}
                className={`bento-card shrink-0 snap-center ${widthClass}`}
              >
                <SpotlightCard 
                  spotlightColor={displayColors.primary ? `${displayColors.primary}1A` : 'rgba(229, 197, 121, 0.12)'}
                  size={500}
                  className="p-8 md:p-10 justify-between min-h-[320px] md:min-h-[360px] h-full bg-white/[0.02] backdrop-blur-md hover:-translate-y-1 hover:shadow-2xl transition-all duration-500"
                >
                  {/* Card Top: Telemetry & Icon */}
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">
                        {card.badge}
                      </span>
                      <div 
                        className="w-10 h-10 shrink-0 rounded-lg bg-white/[0.03] border border-white/[0.08] group-hover:border-white/20 flex items-center justify-center text-zinc-400 group-hover:text-white transition-all duration-300 group-hover:scale-110"
                        style={{ color: displayColors.primary || '#E5C579' }}
                      >
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-serif text-white mb-4 group-hover:text-white transition-colors drop-shadow-md">
                      {card.title}
                    </h3>
                    <p className="text-zinc-400 font-light text-sm md:text-base leading-relaxed mb-6 group-hover:text-zinc-300 transition-colors">
                      {card.description}
                    </p>
                  </div>

                  {/* Card Bottom: Telemetry Metrics */}
                  <div className="pt-6 mt-auto border-t border-white/[0.06] flex items-center justify-between group-hover:border-white/[0.15] transition-colors">
                    <div>
                      <span className="text-xs font-mono font-semibold tracking-wider text-white block mb-1">
                        {card.stat}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">
                        {card.metricLabel}
                      </span>
                    </div>

                    <a
                      href="#apply"
                      className="inline-flex shrink-0 items-center gap-1.5 text-xs font-mono tracking-wider opacity-60 group-hover:opacity-100 transition-all hover:translate-x-1"
                      style={{ color: displayColors.primary || '#E5C579' }}
                    >
                      <span className="font-semibold">ACESSAR</span>
                      <ArrowUpRight size={14} className="group-hover:animate-bounce" />
                    </a>
                  </div>
                </SpotlightCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
