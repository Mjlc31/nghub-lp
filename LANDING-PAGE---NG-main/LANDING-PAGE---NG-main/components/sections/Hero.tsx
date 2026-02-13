import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { AmbientLight } from '../ui/Effects';

interface HeroProps {
    images: { hero: string };
    texts: {
        heroTitle: string;
        heroSubtitle: string;
        ctaButton: string;
    };
    colors: { primary: string };
    scrollToApply: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Hero: React.FC<HeroProps> = ({ images, texts, colors, scrollToApply }) => {
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
    const heroScale = useTransform(scrollY, [0, 600], [1, 1.05]);
    const textY = useTransform(scrollY, [0, 500], [0, 100]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.3
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <section className="relative h-screen w-full flex items-center justify-center px-4 md:px-6 overflow-hidden">
            <AmbientLight primaryColor={colors.primary} />

            <motion.div style={{ scale: heroScale }} className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-ng-black/70 via-ng-black/40 to-ng-black z-10" />

                {/* Noise Texture Overlay */}
                <div className="absolute inset-0 opacity-[0.03] z-[11] pointer-events-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />

                <img
                    src={images.hero}
                    className="w-full h-full object-cover opacity-50"
                    alt="Diretores NGHUB"
                />
            </motion.div>

            <motion.div
                style={{ opacity: heroOpacity, y: textY }}
                className="relative z-20 max-w-6xl mx-auto text-center mt-10 md:mt-20"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1
                    variants={itemVariants}
                    className="text-4xl md:text-7xl lg:text-8xl font-serif text-white mb-8 md:mb-10 leading-[1.1] md:leading-[1] tracking-tight whitespace-pre-line drop-shadow-2xl"
                >
                    {texts.heroTitle.split(' ').map((word, i) => {
                        const isHighlight = ['não', 'sabe', 'estagnado'].includes(word.toLowerCase().replace(/[.,]/g, ''));
                        return (
                            <span key={i} className={isHighlight ? 'italic font-light' : ''} style={isHighlight ? { color: colors.primary } : {}}>
                                {word}{' '}
                            </span>
                        );
                    })}
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-base md:text-xl text-zinc-300 max-w-xl md:max-w-2xl mx-auto mb-12 md:mb-16 font-light leading-relaxed px-4 drop-shadow-lg"
                >
                    {texts.heroSubtitle}
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col items-center">
                    <a
                        href="#apply"
                        onClick={scrollToApply}
                        className="group relative px-8 py-3 md:px-12 md:py-5 overflow-hidden border rounded-sm transition-all duration-500 cursor-pointer hover:shadow-[0_0_30px_rgba(197,160,89,0.3)]"
                        style={{ borderColor: `${colors.primary}60` }}
                    >
                        <div
                            className="absolute inset-0 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"
                            style={{ backgroundColor: `${colors.primary}` }}
                        />
                        <span className="relative z-10 font-serif text-xs md:text-sm uppercase tracking-[0.2em] text-zinc-300 group-hover:text-ng-black transition-colors flex items-center gap-3 md:gap-4 font-semibold">
                            {texts.ctaButton} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </a>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2"
            >
                <motion.div
                    animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="text-white/50"
                >
                    <ChevronDown size={24} strokeWidth={0.5} />
                </motion.div>
            </motion.div>
        </section>
    );
};
