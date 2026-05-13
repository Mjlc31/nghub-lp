import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Menu } from 'lucide-react';

interface MobileMenuProps {
    colors: { primary: string };
    setIsManifestoOpen: (isOpen: boolean) => void;
    scrollToApply: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ colors, setIsManifestoOpen, scrollToApply }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleManifestoClick = () => {
        setIsOpen(false);
        setIsManifestoOpen(true);
    };

    const handleApplyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        setIsOpen(false);
        scrollToApply(e);
    };

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2 text-white hover:text-ng-gold transition-colors"
                aria-label="Abrir menu"
            >
                <Menu size={24} />
            </button>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] md:hidden"
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[280px] bg-ng-black border-l border-white/10 z-[101] md:hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
                                aria-label="Fechar menu"
                            >
                                <X size={24} />
                            </button>

                            {/* Logo */}
                            <div className="px-8 pt-8 pb-12">
                                <h2 className="font-serif font-bold text-3xl text-white tracking-tighter">NG</h2>
                            </div>

                            {/* Menu Items */}
                            <nav className="px-8 space-y-6">
                                <button
                                    onClick={handleManifestoClick}
                                    className="block w-full text-left text-white/70 hover:text-white text-lg font-light tracking-wide transition-colors py-3 border-b border-white/5"
                                >
                                    Manifesto
                                </button>

                                <a
                                    href="#arsenal"
                                    onClick={() => setIsOpen(false)}
                                    className="block text-white/70 hover:text-white text-lg font-light tracking-wide transition-colors py-3 border-b border-white/5"
                                >
                                    Arsenal
                                </a>

                                <a
                                    href="#apply"
                                    onClick={handleApplyClick}
                                    className="block text-lg font-medium tracking-wide transition-colors py-4 text-center border rounded-sm mt-8"
                                    style={{
                                        color: colors.primary,
                                        borderColor: `${colors.primary}60`,
                                        backgroundColor: `${colors.primary}10`
                                    }}
                                >
                                    Candidatar-me
                                </a>
                            </nav>

                            {/* Footer */}
                            <div className="absolute bottom-8 left-8 right-8">
                                <p className="text-zinc-600 text-xs font-light">
                                    © 2024 NGHUB. Resultados em silêncio.
                                </p>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};
