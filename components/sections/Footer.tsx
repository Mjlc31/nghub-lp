import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, Mail } from 'lucide-react';

interface ParallaxQuoteProps {
    image: string;
    colors: { primary: string };
}

export const ParallaxQuote: React.FC<ParallaxQuoteProps> = ({ image, colors }) => (
    <section className="relative h-[60vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-zinc-900">
        <div className="absolute inset-0">
            <img
                src={image}
                onError={(e) => e.currentTarget.src = 'https://placehold.co/1920x1080/1a1a1a/FFF?text=No+Image'}
                className="w-full h-full object-cover opacity-40 fixed top-0 left-0 h-screen w-screen pointer-events-none"
                alt="Diretores NGHUB"
                style={{ zIndex: 0 }}
            />
            <div className="absolute inset-0 bg-black/70 z-10" />
        </div>

        <div className="relative z-20 max-w-5xl px-6 text-center">
            <motion.h3
                initial={{ opacity: 0, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, filter: 'blur(0px)' }}
                viewport={{ once: true }}
                transition={{ duration: 1.2 }}
                className="text-2xl md:text-6xl lg:text-7xl font-serif text-white leading-tight"
            >
                "A missão invisível é aquilo que você faz <br />
                <span className="italic" style={{ color: colors.primary }}>
                    quando ninguém está olhando.
                </span>"
            </motion.h3>
        </div>
    </section>
);

export const Footer = () => (
    <footer className="py-16 md:py-20 bg-black border-t border-white/5 text-center relative z-20">
        <a href="#" className="font-serif font-bold text-4xl md:text-5xl text-white mb-8 md:mb-12 tracking-tighter inline-block hover:opacity-80 transition-opacity">NG</a>

        <div className="flex justify-center gap-8 md:gap-12 mb-8 md:mb-12">
            <a href="#" className="text-zinc-600 hover:text-white transition-colors transform hover:scale-110">
                <Instagram className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1} />
            </a>
            <a href="#" className="text-zinc-600 hover:text-white transition-colors transform hover:scale-110">
                <Mail className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1} />
            </a>
        </div>

        <p className="text-zinc-700 text-[10px] font-sans uppercase tracking-[0.2em]">
            © {new Date().getFullYear()} NGHUB. All Rights Reserved.
        </p>
    </footer>
);
