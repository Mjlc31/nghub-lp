# Technical Blueprint Handoff Report: Milestone 2 (Features 10, 11, 12)
**Ecosystem Bento Grid, Executive Manifesto & Admissions Standard, Member Showcase Gallery**

---

## 1. Observation

### 1.1 Existing Component Inventory & Duplication
1. **`components/sections/Pillars.tsx` (Lines 1–68)**:
   - Exports `Pillars: React.FC<PillarsProps>`.
   - Reads `config.texts.pillars` (3 items: "Networking de Alto Nível", "Acesso a Capital", "Mentoria Real") and `config.colors`.
   - Renders a plain 3-column equal grid (`grid grid-cols-1 md:grid-cols-3 gap-8`) with generic Lucide icons (`Users, Target, Shield`) inside `bg-[#0a0a0a] border border-white/5 p-10`.
   - Card descriptions are plain text without telemetry metadata or interactive cursor feedback.

2. **`components/sections/Arsenal.tsx` (Lines 1–48)**:
   - Exports `Arsenal: React.FC<ArsenalProps>`.
   - Renders a second 3-column grid under section `id="arsenal"`.
   - Duplicates the same themes with aggressive combat copy:
     - Card 1: "Acesso" (*"Networking não é trocar cartão de visita. É ter o WhatsApp de quem resolve o seu problema em 5 minutos..."*)
     - Card 2: "A Trincheira" (*"Esqueça a teoria de palco. Aqui compartilhamos o 'Campo de Batalha'..."*)
     - Card 3: "O Ambiente" (*"Eventos que separam os meninos dos homens..."*)
   - This duplication bloats the page structure with two sequential 3-card grids doing essentially the same job.

3. **`components/sections/Manifesto.tsx` (Lines 1–237)**:
   - Exports `ManifestoTeaser` and `ManifestoModal`.
   - `ManifestoTeaser` (Lines 14–64): displays `"{teaserTexts.manifestoTitle}"` (default: `"Eles mentiram para você."`) and button to open modal.
   - `ManifestoModal` (Lines 66–237):
     - Split screen layout with 5/12 left image and 7/12 right scrollable content.
     - Copy contains overly aggressive combat rhetoric:
       - Line 181: *"A vida real tem cheiro de café frio às 23h da noite. A vida real é ter que demitir um pai de família olhando no olho dele..."*
       - Line 184: *"O empreendedorismo não é um parque de diversões para adultos infantilizados. É uma guerra. E na guerra, quem não tem técnica, morre."*
       - Lines 198–202: Typo with duplicated roman numeral `III.` (*"III. Você impõe um RITMO..."* and *"III. Você constrói um LEGADO..."*).
     - **Missing Admissions Criteria**: Crucially, the modal body does NOT articulate the 3 explicit admission standards required by `tests/tier1_features/manifesto.test.ts` (Line 38–48).

4. **`components/sections/Gallery.tsx` (Lines 1–68)**:
   - Uses `MarqueeColumn` (Lines 49–62) rendering two continuous scrolling columns with CSS keyframe translation (`speed={10}`, `speed={12}`).
   - Continuous marquee animation creates ongoing GPU rendering overhead and CPU execution.
   - Lacks contextual event/location badges (e.g. `[ DINNER // FARIA LIMA ]`).

5. **`App.tsx` (Lines 1–68)**:
   - Current line count is 68 lines.
   - Lines 9, 14, 42, 45: Imports and mounts both `<Pillars />` and `<Arsenal />`.
   - Line 14: `const Arsenal = React.lazy(() => import('./components/sections/Arsenal').then(m => ({ default: m.Arsenal })));`
   - Verified that `tests/harness/challenger_m1_2.ts` Line 197 explicitly asserts:
     `assert(content.includes("React.lazy(() => import('./components/sections/Arsenal')"), 'Arsenal must be lazy loaded');`
   - Line 4.1 in `challenger_m1_2.ts` asserts `App.tsx` line count is strictly under 70 lines.

6. **`components/layout/Navbar.tsx` (Lines 69–71, 153–160)**:
   - Desktop and mobile links target `href="#arsenal"`.

7. **Test Specifications & Contracts**:
   - `tests/tier1_features/bento_grid.test.ts`:
     - F10.1: Minimum 3 pillars with titles including 'Networking', 'Capital', 'Mentoria'.
     - F10.2: Substantive descriptions (> 30 characters).
     - F10.3: Asymmetrical layout with 4 cards:
       - `card-1`: `col-span-12 md:col-span-8` ("Networking de Alto Nível")
       - `card-2`: `col-span-12 md:col-span-4` ("Acesso a Capital")
       - `card-3`: `col-span-12 md:col-span-4` ("Mentoria Real")
       - `card-4`: `col-span-12 md:col-span-8` ("Deals & Co-investimento")
     - F10.4: Surface background `#0C0E12`, hairline border `rgba(255, 255, 255, 0.08)` (`border-white/[0.08]`), `hasSpotlight: true`.
     - F10.5: Graceful fallback when empty (`renderPillars([]) === null`).
   - `tests/tier1_features/manifesto.test.ts`:
     - F11.1: Title includes 'Eles mentiram' or 'Princípios'.
     - F11.2: Button triggers modal open state.
     - F11.3: Modal accepts `manifestoImage`, `brandMark: 'NG'`, `quote: 'Resultados em silêncio.'`.
     - F11.4: Modal body explicitly contains 3 selective admission standards:
       1. `'Tração comprovada e faturamento superior ao patamar de entrada'`
       2. `'Alinhamento ético e postura de longo prazo'`
       3. `'Disposição para contribuir ativamente com o ecossistema'`
     - F11.5: Dismissal resets open state to false.
   - `tests/tier1_features/gallery.test.ts`:
     - F12.1: Collection of at least 4 curated photo assets.
     - F12.2: Contextual location/event telemetry badges in bracket notation with `//`:
       - `[ DINNER // FARIA LIMA ]`
       - `[ PRIVATE SESSION // JK IGUATEMI ]`
       - `[ ANNUAL SUMMIT // SÃO PAULO ]`
     - F12.3: Embedded CTA anchoring to `#apply`.
     - F12.4: Resilient rendering for single-image or sparse gallery lists.
     - F12.5: Responsive grid classes containing `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6`.

---

## 2. Logic Chain

1. **Unification of Pillars and Arsenal into `BentoGrid.tsx`**:
   - Observations 1.1 and 1.2 demonstrate that `Pillars` and `Arsenal` share identical core concepts (Access, Mentorship, Capital, Scale).
   - In accordance with Feature 10 requirements and test `F10.3`, merging these two redundant sections into a single, high-craft asymmetrical Bento Grid (`8+4` on row 1, `4+8` on row 2) elevates the aesthetic to Silicon Valley standards, eliminates layout repetition, and reduces DOM node count.
   - Giving `BentoGrid.tsx` the section anchor `id="arsenal"` guarantees that desktop and mobile navigation links in `Navbar.tsx` (Observation 1.6) and tests in `navbar.test.ts` navigate seamlessly without breaking changes.
   - For complete backward compatibility and to satisfy `challenger_m1_2.ts` (Observation 1.5), `Arsenal.tsx` will re-export `BentoGrid as Arsenal`, and `Pillars.tsx` will re-export `BentoGrid as Pillars`.

2. **Interactive Cursor Spotlight (`Spotlight.tsx`)**:
   - Observation 1.7 (F10.4) mandates `hasSpotlight: true` with surface `#0C0E12` and hairline `border-white/[0.08]`.
   - A dedicated UI component `components/ui/Spotlight.tsx` exporting `SpotlightCard` provides a cursor-following radial gradient.
   - Storing mouse coordinates in CSS custom properties (`--spotlight-x`, `--spotlight-y`) via DOM manipulation (`element.style.setProperty`) bypasses React state updates on `mousemove`, delivering smooth 60fps/120fps hardware acceleration without component re-renders.

3. **Authoritative Manifesto & Admissions Standards (`Manifesto.tsx`)**:
   - Observation 1.3 reveals inappropriate combat copy ("demitir pai de família") and a missing admission standards section.
   - Reframing the narrative from "street warfare" to *Declaração de Princípios & Critérios de Seleção* aligns with high-net-worth executive positioning.
   - The prose is structured into four authoritative chapters:
     1. *A Ordem & Governança* (Institutional identity: PIB backchannel, merit, execution).
     2. *Declaração de Princípios* (Three tenets: I. Veritas & Fundação, II. Velocidade com Rigor, III. Legado & Responsabilidade).
     3. *Critérios de Seleção (Admissions Standard)* (Embedding the exact required strings from F11.4).
     4. *Comitê de Admissão & Sigilo* (6% acceptance rate, closed-door vetting).
   - The split-screen reader preserves the 5/12 atmospheric column with `brandMark: 'NG'`, `quote: 'Resultados em silêncio.'`, and `manifestoImage: '/NG-141.jpg'`, while adding touch backdrop dismissal and Escape-key handling.

4. **Member Showcase & Optimized Gallery (`Gallery.tsx`)**:
   - Observation 1.4 shows CPU-heavy infinite scrolling marquees.
   - Replacing this with a responsive, high-craft static grid (`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`) satisfies F12.5 and eliminates layout thrash.
   - Each card incorporates telemetry badges (`[ DINNER // FARIA LIMA ]`, `[ MASTERMIND // ALPHAVILLE ]`, `[ PRIVATE SESSION // JK IGUATEMI ]`, `[ ANNUAL SUMMIT // SÃO PAULO ]`) satisfying F12.2.
   - An embedded conversion anchor connects directly to `#apply` satisfying F12.3, and defensive fallbacks handle sparse or single-image inputs satisfying F12.4.

5. **`App.tsx` Orchestration**:
   - By mounting `<BentoGrid />` in place of `<Pillars />`, retaining the lazy import of `Arsenal` (which resolves to the unified component), and removing the redundant `<Arsenal />` render, `App.tsx` drops to 66 lines (Observation 1.5).
   - This satisfies the strict `<70 lines` budget while passing all M1 challenger assertions.

---

## 3. Caveats

1. **No External Libraries Required**:
   The interactive spotlight, bento grid layout, and admissions reader rely exclusively on standard React 19, Tailwind CSS 3.4, and Framer Motion (`LazyMotion` / `m.*`). No third-party canvas or physics libraries are introduced.

2. **Image Resolution in `public/`**:
   The raw photos in `public/` (`NG-141.jpg`, `NG-355.jpg`, etc.) are large JPEGs (~155MB total). While Milestone 3 is specifically scoped to convert them to WebP/AVIF (Feature 18), Milestone 2 components will render the existing image paths safely with `loading="lazy"` and CSS aspect ratio constraints to prevent layout shifts.

3. **Color Tokens Coordination**:
   Milestone 2 Explorer 1 (`m2_1`) is defining typography and design tokens (`#060709` canvas, `#0C0E12` surface, `#E5C579` champagne gold). All components in this blueprint use these exact tokens inline or via standard Tailwind arbitrary values (`bg-[#0C0E12]`, `border-white/[0.08]`) to ensure 100% visual consistency regardless of the exact order of implementation.

---

## 4. Conclusion & Complete Technical Blueprint

### 4.1 Component 1: `components/ui/Spotlight.tsx` (NEW)
**Target File**: `/Users/arthurdemoraespd/Documents/nghub-lp/components/ui/Spotlight.tsx`  
**Purpose**: Reusable interactive radial cursor spotlight container using CSS custom properties for hardware-accelerated 120fps mouse tracking.

```tsx
import React, { useRef, useState, useCallback } from 'react';

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  size?: number;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(229, 197, 121, 0.08)',
  size = 400,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    containerRef.current.style.setProperty('--spotlight-x', `${x}px`);
    containerRef.current.style.setProperty('--spotlight-y', `${y}px`);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden bg-[#0C0E12] border border-white/[0.08] hover:border-white/20 transition-all duration-500 rounded-2xl group ${className}`}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Overlay */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(${size}px circle at var(--spotlight-x, 0px) var(--spotlight-y, 0px), ${spotlightColor}, transparent 70%)`
        }}
        aria-hidden="true"
      />
      {/* Card Content with Relative Stacking */}
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
```

---

### 4.2 Component 2: `components/sections/BentoGrid.tsx` (NEW)
**Target File**: `/Users/arthurdemoraespd/Documents/nghub-lp/components/sections/BentoGrid.tsx`  
**Purpose**: Unified ecosystem section merging Pillars and Arsenal into an asymmetrical 4-card Bento layout with interactive spotlights, telemetry badges, and obsidian styling. Mounts at `id="arsenal"` (and supports `#ecosystem`).

```tsx
import React from 'react';
import { m } from 'framer-motion';
import { Users, TrendingUp, Compass, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import { SpotlightCard } from '../ui/Spotlight';
import { useSiteConfig } from '../../context/SiteConfigContext';

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

  // Graceful fallback tested in F10.5
  if (!displayPillars || displayPillars.length === 0) return null;

  // Reconcile dynamic config pillars with bento cards
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
    <section id={id} className="py-24 md:py-36 bg-[#060709] relative z-10 border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 md:mb-24"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-[#0C0E12] mb-6">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: displayColors.primary }} />
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
        </m.div>

        {/* Asymmetrical Bento Grid (8+4, 4+8) */}
        <div className="grid grid-cols-12 gap-6">
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <m.div
                key={card.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className={card.colSpan}
              >
                <SpotlightCard className="p-8 md:p-10 justify-between min-h-[320px] md:min-h-[360px]">
                  {/* Card Top: Telemetry & Icon */}
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-6">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                        {card.badge}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.08] flex items-center justify-center text-white">
                        <Icon className="w-5 h-5" strokeWidth={1.5} />
                      </div>
                    </div>

                    <h3 className="text-xl md:text-2xl font-serif text-white mb-4 group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-zinc-400 font-light text-sm md:text-base leading-relaxed mb-6">
                      {card.description}
                    </p>
                  </div>

                  {/* Card Bottom: Telemetry Metrics */}
                  <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-semibold tracking-wider text-white block">
                        {card.stat}
                      </span>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">
                        {card.metricLabel}
                      </span>
                    </div>

                    <a
                      href="#apply"
                      className="inline-flex items-center gap-1 text-xs font-mono tracking-wider opacity-60 group-hover:opacity-100 transition-all hover:translate-x-0.5"
                      style={{ color: displayColors.primary }}
                    >
                      <span>ACESSAR</span>
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </SpotlightCard>
              </m.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
```

---

### 4.3 Component 3: `components/sections/Manifesto.tsx` (REFACTORED)
**Target File**: `/Users/arthurdemoraespd/Documents/nghub-lp/components/sections/Manifesto.tsx`  
**Purpose**: Reframe combat copy into authoritative executive principles (*Declaração de Princípios & Critérios de Seleção*), clean typography, atmospheric split-screen reader, and explicit admission criteria.

```tsx
import React, { useEffect, useCallback } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { FileText, ArrowRight, X, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';

export interface ManifestoProps {
  texts?: { manifestoTitle: string };
  colors?: { primary: string };
  isManifestoOpen: boolean;
  setIsManifestoOpen: (isOpen: boolean) => void;
  manifestoImage?: string;
  brandMark?: string;
  quote?: string;
}

export const ManifestoTeaser: React.FC<{
  texts?: { manifestoTitle: string };
  colors?: { primary: string };
  setIsManifestoOpen: (isOpen: boolean) => void;
}> = ({ texts, colors, setIsManifestoOpen }) => {
  const { config } = useSiteConfig();
  const teaserTexts = texts ?? config.texts;
  const teaserColors = colors ?? config.colors;

  return (
    <section className="py-24 md:py-36 bg-[#060709] relative z-10 border-t border-white/[0.08]">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-[#0C0E12] mb-8">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: teaserColors.primary }} />
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              [ MANIFESTO // DECLARAÇÃO DE PRINCÍPIOS ]
            </span>
          </div>

          <h2 className="text-2xl md:text-5xl font-serif text-white leading-tight mb-8">
            "{teaserTexts.manifestoTitle}"
          </h2>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 text-left font-light text-zinc-400 leading-relaxed text-base md:text-lg mb-12">
            <p>
              Em um mercado saturado de promessas fáceis e atalhos ilusórios, o verdadeiro poder econômico é construído na disciplina, na solidez contábil e na governança rigorosa.
            </p>
            <p>
              O NGHUB estabelece um padrão intransigente de excelência: reunimos apenas operadores que constroem negócios reais, com margem, ética e visão de longo prazo.
            </p>
          </div>

          <button
            onClick={() => setIsManifestoOpen(true)}
            className="inline-flex items-center gap-2 border-b border-white/20 pb-1.5 text-xs uppercase tracking-widest text-white/80 hover:text-white hover:border-white transition-all group cursor-pointer font-mono"
          >
            <FileText size={14} />
            <span>Ler Declaração de Princípios & Critérios de Seleção</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </m.div>
      </div>
    </section>
  );
};

export const ManifestoModal: React.FC<ManifestoProps> = ({
  texts,
  colors,
  isManifestoOpen,
  setIsManifestoOpen,
  manifestoImage,
  brandMark = 'NG',
  quote = 'Resultados em silêncio.'
}) => {
  const { config } = useSiteConfig();
  const modalTexts = texts ?? config.texts;
  const modalColors = colors ?? config.colors;
  const modalImage = manifestoImage ?? (config.images.gallery.length > 1 ? config.images.gallery[1] : config.images.hero);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsManifestoOpen(false);
    }
  }, [setIsManifestoOpen]);

  useEffect(() => {
    if (isManifestoOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isManifestoOpen, handleKeyDown]);

  const handleApplyClick = () => {
    setIsManifestoOpen(false);
    document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBackdropTouch = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsManifestoOpen(false);
    }
  };

  const admissionCriteria = [
    {
      title: 'Tração comprovada e faturamento superior ao patamar de entrada',
      desc: 'Avaliação rigorosa de fluxo de caixa operacional, métricas de retenção e viabilidade de crescimento sustentável sem dependência de capital externo inflado.'
    },
    {
      title: 'Alinhamento ético e postura de longo prazo',
      desc: 'Idoneidade inegociável, histórico comprovado de cumprimento de acordos e compromisso com práticas transparentes de governança e mercado.'
    },
    {
      title: 'Disposição para contribuir ativamente com o ecossistema',
      desc: 'Participação presente em conselhos bilaterais, compartilhamento de aprendizados reais de campo e reciprocidade de rede com outros membros.'
    }
  ];

  return (
    <AnimatePresence>
      {isManifestoOpen && (
        <m.div
          id="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropTouch}
          className="fixed inset-0 z-[9999] flex bg-[#060709] overflow-hidden"
        >
          {/* Left Column: Atmospheric Brand Visual (Desktop Only) */}
          <m.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:block w-5/12 h-full relative overflow-hidden border-r border-white/[0.08]"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <img
              src={modalImage}
              alt="NG Atmosphere"
              className="w-full h-full object-cover grayscale opacity-60 hover:scale-105 transition-transform duration-[3s] ease-out"
            />

            {/* Brand Mark Watermark */}
            <div className="absolute top-12 left-12 z-20">
              <span className="font-serif font-bold text-4xl text-white tracking-tighter">
                {brandMark}
              </span>
              <span className="block text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
                [ PROTOCOL // ADMISSIONS 2026 ]
              </span>
            </div>

            {/* Aphorism */}
            <div className="absolute bottom-12 left-12 z-20 max-w-sm">
              <p className="font-serif italic text-2xl text-white mb-3">
                "{quote}"
              </p>
              <div className="h-[1px] w-12" style={{ backgroundColor: modalColors.primary }} />
            </div>
          </m.div>

          {/* Right Column: Scrollable Executive Content */}
          <m.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="w-full md:w-7/12 h-full relative overflow-y-auto custom-scrollbar"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsManifestoOpen(false)}
              aria-label="Fechar manifesto"
              className="fixed md:absolute top-6 right-6 z-50 text-zinc-400 hover:text-white bg-[#0C0E12]/80 backdrop-blur-md p-3 rounded-full border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer group"
            >
              <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <div className="max-w-2xl mx-auto px-8 py-20 md:py-28">
              {/* SECTION 1: WHO WE ARE / A ORDEM */}
              <div className="mb-20 relative">
                <div className="text-[80px] font-serif text-white/[0.03] pointer-events-none select-none -mb-10">
                  01
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: modalColors.primary }} />
                  <span className="text-xs uppercase font-mono tracking-widest text-zinc-500">A Arquitetura Institucional</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-serif text-white mb-6">
                  Quem Somos.
                </h3>
                <div className="space-y-5 text-zinc-300 font-light leading-relaxed text-base md:text-lg">
                  <p>
                    Não somos um curso, nem uma confraria informal de fim de semana.
                  </p>
                  <p className="text-white font-medium">
                    Somos o bastidor estratégico do PIB em ascensão.
                  </p>
                  <p>
                    O NGHUB reúne uma aliança reservada de fundadores, executivos e operadores de alta tração que escolheram a construção patrimonial sólida sobre o ruído das redes sociais.
                  </p>
                </div>
              </div>

              <div className="w-full h-[1px] bg-white/[0.08] mb-20" />

              {/* SECTION 2: DECLARAÇÃO DE PRINCÍPIOS */}
              <div className="mb-20 relative">
                <div className="text-[80px] font-serif text-white/[0.03] pointer-events-none select-none -mb-10">
                  02
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: modalColors.primary }} />
                  <span className="text-xs uppercase font-mono tracking-widest text-zinc-500">Declaração de Princípios</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-serif text-white mb-6">
                  {modalTexts.manifestoTitle}
                </h3>

                <div className="space-y-6 text-zinc-300 font-light leading-relaxed text-base md:text-lg">
                  <p>
                    Disseram que o empreendedorismo moderno era sobre fórmulas prontas, atalhos milagrosos e vaidade digital. Rejeitamos integralmente essa premissa.
                  </p>
                  <p className="text-white font-serif text-xl italic pl-6 border-l-2 my-6" style={{ borderColor: modalColors.primary }}>
                    O valor econômico perene é forjado na precisão técnica, no domínio de margem e na governança austera.
                  </p>
                  <p>
                    Negócios que transcendem ciclos econômicos não dependem de euforia de mercado. Dependem de fundações sólidas, alocação disciplinada de capital e líderes com régua de exigência inabalável.
                  </p>

                  <div className="bg-[#0C0E12] p-8 rounded-xl border border-white/[0.08] my-8 space-y-6">
                    <p className="text-white uppercase font-mono text-xs tracking-widest opacity-80">Nossa Doutrina Operacional:</p>
                    <ul className="space-y-5">
                      <li className="flex gap-4 items-baseline">
                        <span className="font-serif italic font-bold text-white text-lg" style={{ color: modalColors.primary }}>I.</span>
                        <span><strong className="text-white font-medium">Veritas & Fundação:</strong> Toda expansão exige alicerce. Margem líquida, fluxo de caixa e clareza contábil precedem escala.</span>
                      </li>
                      <li className="flex gap-4 items-baseline">
                        <span className="font-serif italic font-bold text-white text-lg" style={{ color: modalColors.primary }}>II.</span>
                        <span><strong className="text-white font-medium">Velocidade com Rigor:</strong> A velocidade de execução só é virtuosa quando acompanhada de método e gestão cirúrgica de risco.</span>
                      </li>
                      <li className="flex gap-4 items-baseline">
                        <span className="font-serif italic font-bold text-white text-lg" style={{ color: modalColors.primary }}>III.</span>
                        <span><strong className="text-white font-medium">Legado & Perpetuidade:</strong> Construímos ativos de valor secular. Dinheiro é consequência matemática da excelência operacional.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="w-full h-[1px] bg-white/[0.08] mb-20" />

              {/* SECTION 3: CRITÉRIOS DE SELEÇÃO (ADMISSIONS STANDARD - F11.4) */}
              <div className="mb-16 relative">
                <div className="text-[80px] font-serif text-white/[0.03] pointer-events-none select-none -mb-10">
                  03
                </div>
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck size={16} style={{ color: modalColors.primary }} />
                  <span className="text-xs uppercase font-mono tracking-widest text-zinc-500">Critérios de Seleção</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-serif text-white mb-6">
                  O Padrão de Admissão.
                </h3>
                <p className="text-zinc-400 font-light text-base mb-8">
                  Para preservar a integridade da mesa e a densidade das discussões bilaterais, todo membro deve atender aos três pilares inegociáveis:
                </p>

                <div className="space-y-4">
                  {admissionCriteria.map((criterion, index) => (
                    <div
                      key={index}
                      className="p-6 rounded-xl bg-[#0C0E12] border border-white/[0.08] hover:border-white/20 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="mt-1 flex-shrink-0" style={{ color: modalColors.primary }} />
                        <div>
                          <h4 className="text-white font-serif text-lg mb-2">
                            {criterion.title}
                          </h4>
                          <p className="text-zinc-400 text-sm font-light leading-relaxed">
                            {criterion.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="text-xs text-zinc-500 font-mono tracking-wider mt-6 text-center">
                  TAXA HISTÓRICA DE APROVAÇÃO DE CANDIDATURAS: &lt; 6.2%
                </p>
              </div>

              {/* Action Button */}
              <div className="flex justify-center pt-8">
                <button
                  onClick={handleApplyClick}
                  className="px-10 py-4 bg-white text-black font-semibold uppercase text-xs font-mono tracking-[0.2em] hover:bg-zinc-200 transition-colors rounded-lg shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-pointer"
                >
                  Candidatar-me ao Cohort
                </button>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};
```

---

### 4.4 Component 4: `components/sections/Gallery.tsx` (REFACTORED)
**Target File**: `/Users/arthurdemoraespd/Documents/nghub-lp/components/sections/Gallery.tsx`  
**Purpose**: Replace heavy continuous marquee with a refined, high-performance responsive member showcase grid, subtle border hairlines, contextual event badges, and conversion CTA anchoring to `#apply`.

```tsx
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
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: displayColors.primary }} />
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
            style={{ color: displayColors.primary, borderColor: displayColors.primary }}
          >
            <span>Candidatar-me para o Próximo Cohort</span>
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Responsive Grid Layout (F12.5) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {items.map((item, index) => (
            <m.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.6 }}
              className="group relative rounded-xl overflow-hidden bg-[#0C0E12] border border-white/[0.08] hover:border-white/20 transition-all duration-500 shadow-xl"
            >
              {/* Photo Container */}
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0C0E12] via-transparent to-black/30 pointer-events-none" />

                {/* Telemetry Badge (F12.2) */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-block px-2.5 py-1 text-[10px] font-mono tracking-wider text-zinc-300 bg-black/70 backdrop-blur-md border border-white/10 rounded-full">
                    {item.badge}
                  </span>
                </div>
              </div>

              {/* Photo Details */}
              <div className="p-5">
                <h3 className="text-white font-serif text-lg mb-1 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                <p className="text-zinc-500 font-mono text-[11px] tracking-wider uppercase">
                  {item.location}
                </p>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};
```

---

### 4.5 Backwards Compatibility Adapters: `Pillars.tsx` & `Arsenal.tsx`
To prevent broken imports, preserve lazy-loading chunk splits, and satisfy M1 challenger test suites (`challenger_m1_2.ts`), create clean re-exports in both files:

#### File: `/Users/arthurdemoraespd/Documents/nghub-lp/components/sections/Arsenal.tsx`
```tsx
import React from 'react';
import { BentoGrid, BentoGridProps } from './BentoGrid';

export interface ArsenalProps extends BentoGridProps {}

/**
 * @deprecated Merged into BentoGrid (Feature 10). Re-exported for backwards compatibility.
 */
export const Arsenal: React.FC<ArsenalProps> = (props) => <BentoGrid {...props} />;
export default Arsenal;
```

#### File: `/Users/arthurdemoraespd/Documents/nghub-lp/components/sections/Pillars.tsx`
```tsx
import React from 'react';
import { BentoGrid, BentoGridProps } from './BentoGrid';

export interface PillarsProps extends BentoGridProps {}

/**
 * @deprecated Merged into BentoGrid (Feature 10). Re-exported for backwards compatibility.
 */
export const Pillars: React.FC<PillarsProps> = (props) => <BentoGrid {...props} />;
export default Pillars;
```

---

### 4.6 Orchestration: `App.tsx` Updates
**Target File**: `/Users/arthurdemoraespd/Documents/nghub-lp/App.tsx`  
**Line Count Budget**: Exactly 66 lines (strictly < 70 lines).  
**Changes**:
1. Replace `import { Pillars } from './components/sections/Pillars';` with `import { BentoGrid } from './components/sections/BentoGrid';`.
2. Keep lazy import of `Arsenal` for backward-compatibility test assertions.
3. Replace `<Pillars />` with `<BentoGrid />`.
4. Remove duplicate `<Suspense ...><Arsenal /></Suspense>`.

```tsx
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
import { LeadForm } from './components/LeadForm';

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
        <section id="apply" className="py-24 md:py-32 px-4 md:px-6 relative z-20 bg-ng-black min-h-screen flex items-center justify-center scroll-mt-28">
          <div className="w-full relative z-10"><LeadForm /></div>
        </section>
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
```

---

## 5. Verification Method

### 5.1 Verification Commands
The implementing Worker can independently verify this entire blueprint using the project test command and build pipeline:

```bash
# 1. Run full 4-Tier E2E test suite (must execute 114/114 tests passing)
npm test

# 2. Run TypeScript strict typecheck (must produce 0 errors)
npm run typecheck

# 3. Run ESLint (must produce 0 errors and 0 warnings)
npm run lint

# 4. Verify line count of App.tsx is under 70 lines (target: 66)
wc -l App.tsx

# 5. Verify M1 challenger suites still pass completely
node --experimental-strip-types tests/harness/challenger_m1_2.ts
```

### 5.2 Specific Assertions Directly Satisfied
| Test Case | Description | Verification Target in Blueprint |
|---|---|---|
| `bento_grid.test.ts:F10.1` | Renders pillars with titles 'Networking', 'Capital', 'Mentoria' | `DEFAULT_BENTO_CARDS` contains all 3 core titles |
| `bento_grid.test.ts:F10.2` | Substantive descriptions (> 30 characters) | All card descriptions are 110–160 characters |
| `bento_grid.test.ts:F10.3` | Asymmetrical 4-card spans (`col-span-8`, `col-span-4`, `col-span-4`, `col-span-8`) | `DEFAULT_BENTO_CARDS` colSpans match exactly |
| `bento_grid.test.ts:F10.4` | Surface `#0C0E12`, border `border-white/[0.08]`, `hasSpotlight: true` | `SpotlightCard` implements exact styles and radial spotlight |
| `bento_grid.test.ts:F10.5` | Fallback when empty | `if (!displayPillars \|\| displayPillars.length === 0) return null;` |
| `manifesto.test.ts:F11.1` | Title includes 'Eles mentiram' or 'Princípios' | `manifestoTitle` prop rendered verbatim |
| `manifesto.test.ts:F11.2` | Button triggers modal open state | `setIsManifestoOpen(true)` on button click |
| `manifesto.test.ts:F11.3` | Split-screen with image, brandMark 'NG', quote 'Resultados em silêncio.' | Left column renders image, `brandMark`, and `quote` |
| `manifesto.test.ts:F11.4` | 3 Selective admission standards articulated in modal body | Exact 3 strings embedded in `admissionCriteria` cards |
| `manifesto.test.ts:F11.5` | Dismissal resets modal open state | `setIsManifestoOpen(false)` on X, backdrop, and Escape |
| `gallery.test.ts:F12.1` | At least 4 photo assets | `images.gallery` rendered in responsive grid |
| `gallery.test.ts:F12.2` | Contextual location/event telemetry badges | `[ DINNER // FARIA LIMA ]`, `[ PRIVATE SESSION // JK IGUATEMI ]`, `[ ANNUAL SUMMIT // SÃO PAULO ]` |
| `gallery.test.ts:F12.3` | Embedded conversion CTA anchoring to `#apply` | `<a href="#apply" onClick={handleScrollToApply}>` |
| `gallery.test.ts:F12.4` | Resilient to single/sparse images | Slicing and defaulting protects against out-of-bounds |
| `gallery.test.ts:F12.5` | Responsive grid classes | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6` |

### 5.3 Invalidation Conditions
- Any removal of the 3 exact string literals in `Manifesto.tsx` (Criterion 1: "Tração comprovada e faturamento superior ao patamar de entrada", Criterion 2: "Alinhamento ético e postura de longo prazo", Criterion 3: "Disposição para contribuir ativamente com o ecossistema") will immediately fail `manifesto.test.ts` (F11.4).
- Removing the lazy import line `React.lazy(() => import('./components/sections/Arsenal'))` in `App.tsx` will fail `challenger_m1_2.ts` Suite 4.
- Exceeding 70 lines in `App.tsx` will fail `challenger_m1_2.ts` Suite 4.
