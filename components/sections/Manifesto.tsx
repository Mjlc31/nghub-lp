import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, FileText, ArrowRight, X, Users } from 'lucide-react';

interface ManifestoProps {
    texts: { manifestoTitle: string };
    colors: { primary: string };
    isManifestoOpen: boolean;
    setIsManifestoOpen: (isOpen: boolean) => void;
    manifestoImage: string;
}

export const ManifestoTeaser: React.FC<Pick<ManifestoProps, 'texts' | 'colors' | 'setIsManifestoOpen'>> = ({
    texts,
    colors,
    setIsManifestoOpen
}) => (
    <section className="py-24 md:py-40 bg-ng-black relative z-10 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6">
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center"
            >
                <Quote
                    className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-8 md:mb-12"
                    style={{ color: colors.primary, opacity: 0.4 }}
                />

                <p className="text-2xl md:text-5xl font-serif text-white leading-tight mb-8 md:mb-12">
                    "{texts.manifestoTitle}"
                </p>

                <div className="grid md:grid-cols-2 gap-8 md:gap-16 text-left font-light text-zinc-400 leading-relaxed text-base md:text-lg mb-12">
                    <p>
                        Você vê promessas de facilidade e atalhos mágicos por toda parte. O mercado está cheio de ruído e distrações que te afastam do que realmente importa: a construção sólida.
                    </p>
                    <p>
                        A realidade dos negócios exige foco e técnica. É sobre construir algo que dure, com processos validados e uma visão de longo prazo.
                    </p>
                </div>

                <button
                    onClick={() => setIsManifestoOpen(true)}
                    className="inline-flex items-center gap-2 border-b border-white/20 pb-1 text-sm uppercase tracking-widest text-white/70 hover:text-white hover:border-white transition-all group cursor-pointer"
                >
                    <FileText size={14} /> Ler Manifesto Completo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>
        </div>
    </section>
);

export const ManifestoModal: React.FC<ManifestoProps> = ({
    texts,
    colors,
    isManifestoOpen,
    setIsManifestoOpen,
    manifestoImage
}) => (
    <AnimatePresence>
        {isManifestoOpen && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex bg-[#030303] overflow-hidden"
            >
                {/* Left Column: Visual Atmosphere (Hidden on mobile) */}
                <motion.div
                    initial={{ x: '-100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '-100%' }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="hidden md:block w-5/12 h-full relative overflow-hidden border-r border-white/5"
                >
                    <div className="absolute inset-0 bg-black/20 z-10" />
                    <div className="absolute inset-0 bg-noise opacity-30 z-20 mix-blend-overlay" />
                    <img
                        src={manifestoImage}
                        className="w-full h-full object-cover grayscale opacity-60 hover:opacity-80 hover:scale-105 transition-all duration-[2s] ease-in-out"
                        alt="Atmosphere"
                    />

                    {/* Brand Mark */}
                    <div className="absolute top-10 left-10 z-30">
                        <h2 className="font-serif font-bold text-4xl text-white tracking-tighter">NG</h2>
                    </div>

                    <div className="absolute bottom-10 left-10 z-30 max-w-sm">
                        <p className="font-serif italic text-2xl text-white mb-2">"Resultados em silêncio."</p>
                        <div className="h-[1px] w-12 bg-white/50" />
                    </div>
                </motion.div>

                {/* Right Column: Content Scroll */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ delay: 0.1, duration: 0.8 }}
                    className="w-full md:w-7/12 h-full relative overflow-y-auto custom-scrollbar"
                >
                    {/* Close Button */}
                    <button
                        onClick={() => setIsManifestoOpen(false)}
                        className="fixed md:absolute top-6 right-6 z-50 text-zinc-500 hover:text-white bg-black/50 backdrop-blur-md p-2 rounded-full border border-white/10 hover:border-white/30 transition-all group"
                    >
                        <X size={24} className="group-hover:rotate-90 transition-transform duration-500" />
                    </button>

                    <div className="max-w-2xl mx-auto px-6 py-20 md:py-32">

                        {/* SECTION 1: WHO WE ARE */}
                        <div className="mb-24 relative">
                            <div className="absolute -left-12 top-2 text-[100px] font-serif text-white/[0.03] pointer-events-none select-none -z-10">
                                01
                            </div>
                            <div className="flex items-center gap-3 mb-8">
                                <Users size={16} style={{ color: colors.primary }} />
                                <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">A Ordem</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">Quem Somos.</h2>
                            <div className="space-y-6 text-zinc-400 font-light leading-relaxed text-lg">
                                <p>
                                    Não somos um curso. Não somos uma fraternidade de fim de semana.
                                </p>
                                <p className="text-white">
                                    Somos o bastidor do PIB.
                                </p>
                                <p>
                                    O NGHUB é uma ordem silenciosa de jovens empreendedores que escolheram a construção real. Somos os que acordam para construir impérios enquanto o mercado busca atalhos.
                                </p>
                                <p>
                                    Acreditamos que o sucesso deve ser construído tijolo por tijolo, com técnica, honra e resultados concretos.
                                </p>
                            </div>
                        </div>

                        <div className="w-full h-[1px] bg-white/10 mb-24" />

                        {/* SECTION 2: MANIFESTO */}
                        <div className="mb-20 relative">
                            <div className="absolute -left-12 top-2 text-[100px] font-serif text-white/[0.03] pointer-events-none select-none -z-10">
                                02
                            </div>
                            <div className="flex items-center gap-3 mb-8">
                                <FileText size={16} style={{ color: colors.primary }} />
                                <span className="text-xs uppercase tracking-[0.3em] text-zinc-500">Manifesto</span>
                            </div>

                            <h2 className="text-3xl md:text-5xl font-serif text-white mb-8">{texts.manifestoTitle}</h2>

                            <div className="space-y-6 text-zinc-300 font-light leading-relaxed text-lg">
                                <p>
                                    Disseram que empreender era sobre "liberdade geográfica". Disseram que era sobre trabalhar na praia com um notebook. Disseram que o caminho era fácil, rápido e indolor.
                                </p>
                                <p className="text-white font-serif text-xl italic pl-6 border-l-2" style={{ borderColor: colors.primary }}>
                                    Esqueça. Tudo isso é ruído.
                                </p>
                                <p>
                                    A vida real não tem filtro de Instagram. A vida real tem cheiro de café frio às 23h da noite. A vida real é ter que demitir um pai de família olhando no olho dele, segurar o choro, e voltar para a sala de reunião para bater a meta porque a sua empresa depende disso.
                                </p>
                                <p>
                                    O empreendedorismo não é um parque de diversões para adultos infantilizados. <strong className="text-white">É uma guerra.</strong> E na guerra, quem não tem técnica, morre.
                                </p>
                                <p>
                                    A NG.Hub nasceu porque cansamos de ver gente boa, gente com potencial, com garra, sendo seduzida pelo canto da sereia da mediocridade. Cansamos de ver "gurus" que nunca emitiram uma Nota Fiscal ensinando sobre gestão.
                                </p>

                                <div className="bg-white/5 p-8 rounded-sm border border-white/5 my-8">
                                    <p className="text-white uppercase tracking-widest text-xs mb-6 opacity-70">Nossa Filosofia:</p>
                                    <ul className="space-y-4">
                                        <li className="flex gap-4 items-baseline">
                                            <span className="font-serif italic text-white" style={{ color: colors.primary }}>I.</span>
                                            <span>Você cria uma <strong className="text-white">BASE</strong> sólida. Sem fundação, nada para em pé.</span>
                                        </li>
                                        <li className="flex gap-4 items-baseline">
                                            <span className="font-serif italic text-white" style={{ color: colors.primary }}>III.</span>
                                            <span>Você impõe um <strong className="text-white">RITMO</strong> alucinante. O mercado não tem pena de quem é lento.</span>
                                        </li>
                                        <li className="flex gap-4 items-baseline">
                                            <span className="font-serif italic text-white" style={{ color: colors.primary }}>III.</span>
                                            <span>Você constrói um <strong className="text-white">LEGADO</strong>. Dinheiro é consequência, não propósito.</span>
                                        </li>
                                    </ul>
                                </div>

                                <p>
                                    Nós somos a trincheira. Somos o lugar onde você pode abrir seus números vermelhos sem ser julgado, mas sabendo que será cobrado para deixá-los azuis.
                                </p>
                                <p>
                                    Se você está procurando um atalho, saia agora. Mas se você entendeu que a única saída é através do trabalho duro...
                                </p>
                                <p className="text-2xl font-serif text-white pt-6">
                                    Bem-vindo à vida real. <br />
                                    <span style={{ color: colors.primary }}>Bem-vindo à NG.Hub.</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center pt-10">
                            <button
                                onClick={() => { setIsManifestoOpen(false); document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' }) }}
                                className="px-10 py-4 bg-white text-black font-bold uppercase text-xs tracking-[0.2em] hover:bg-zinc-200 transition-colors rounded-sm shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                            >
                                Solicitar Acesso
                            </button>
                        </div>

                    </div>
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);
