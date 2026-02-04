import React from 'react';
import { motion } from 'framer-motion';

interface SectionHeadingProps {
    title: string;
    subtitle?: string;
    align?: 'center' | 'left';
    primaryColor: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
    title,
    subtitle,
    align = 'center',
    primaryColor
}) => (
    <div className={`mb-16 md:mb-24 px-4 relative z-10 ${align === 'center' ? 'text-center' : 'text-left'}`}>
        <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-6 md:mb-8 leading-[1.1] tracking-tight"
        >
            {title}
        </motion.h2>
        {subtitle && (
            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 1 }}
                className={`text-zinc-500 font-sans text-xs md:text-base tracking-[0.2em] uppercase max-w-2xl ${align === 'center' ? 'mx-auto' : ''}`}
            >
                {subtitle}
            </motion.p>
        )}
        {align === 'center' && (
            <motion.div
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 1.2 }}
                className="h-[1px] w-16 md:w-24 mx-auto mt-8 md:mt-12 opacity-50"
                style={{ backgroundColor: primaryColor }}
            />
        )}
    </div>
);
