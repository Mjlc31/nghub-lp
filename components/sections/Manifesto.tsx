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
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: teaserColors.primary || '#E5C579' }} />
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
            <picture className="w-full h-full">
              <source srcSet={modalImage.replace(/\.jpg$/, '.avif')} type="image/avif" />
              <img
                src={modalImage}
                alt="NG Atmosphere"
                decoding="async"
                className="w-full h-full object-cover grayscale opacity-60 hover:scale-105 transition-transform duration-[3s] ease-out"
              />
            </picture>

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
              <div className="h-[1px] w-12" style={{ backgroundColor: modalColors.primary || '#E5C579' }} />
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
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: modalColors.primary || '#E5C579' }} />
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
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: modalColors.primary || '#E5C579' }} />
                  <span className="text-xs uppercase font-mono tracking-widest text-zinc-500">Declaração de Princípios</span>
                </div>

                <h3 className="text-3xl md:text-4xl font-serif text-white mb-6">
                  {modalTexts.manifestoTitle}
                </h3>

                <div className="space-y-6 text-zinc-300 font-light leading-relaxed text-base md:text-lg">
                  <p>
                    Disseram que o empreendedorismo moderno era sobre fórmulas prontas, atalhos milagrosos e vaidade digital. Rejeitamos integralmente essa premissa.
                  </p>
                  <p className="text-white font-serif text-xl italic pl-6 border-l-2 my-6" style={{ borderColor: modalColors.primary || '#E5C579' }}>
                    O valor econômico perene é forjado na precisão técnica, no domínio de margem e na governança austera.
                  </p>
                  <p>
                    Negócios que transcendem ciclos econômicos não dependem de euforia de mercado. Dependem de fundações sólidas, alocação disciplinada de capital e líderes com régua de exigência inabalável.
                  </p>

                  <div className="bg-[#0C0E12] p-8 rounded-xl border border-white/[0.08] my-8 space-y-6">
                    <p className="text-white uppercase font-mono text-xs tracking-widest opacity-80">Nossa Doutrina Operacional:</p>
                    <ul className="space-y-5">
                      <li className="flex gap-4 items-baseline">
                        <span className="font-serif italic font-bold text-lg" style={{ color: modalColors.primary || '#E5C579' }}>I.</span>
                        <span><strong className="text-white font-medium">Veritas & Fundação:</strong> Toda expansão exige alicerce. Margem líquida, fluxo de caixa e clareza contábil precedem escala.</span>
                      </li>
                      <li className="flex gap-4 items-baseline">
                        <span className="font-serif italic font-bold text-lg" style={{ color: modalColors.primary || '#E5C579' }}>II.</span>
                        <span><strong className="text-white font-medium">Velocidade com Rigor:</strong> A velocidade de execução só é virtuosa quando acompanhada de método e gestão cirúrgica de risco.</span>
                      </li>
                      <li className="flex gap-4 items-baseline">
                        <span className="font-serif italic font-bold text-lg" style={{ color: modalColors.primary || '#E5C579' }}>III.</span>
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
                  <ShieldCheck size={16} style={{ color: modalColors.primary || '#E5C579' }} />
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
                        <CheckCircle2 size={18} className="mt-1 flex-shrink-0" style={{ color: modalColors.primary || '#E5C579' }} />
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
                  Candidatar-me
                </button>
              </div>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
};

export default ManifestoModal;
