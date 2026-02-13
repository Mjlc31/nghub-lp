import React from 'react';
import { motion } from 'framer-motion';
import { PillarProps } from '../../types';

export const WeaponCard: React.FC<PillarProps & { primaryColor: string }> = ({ icon, title, description, primaryColor }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group relative p-8 md:p-10 h-full border border-white/5 hover:border-white/10 transition-all duration-700 bg-white/[0.01] hover:bg-white/[0.03] backdrop-blur-sm overflow-hidden"
        style={{ borderColor: `rgba(255,255,255,0.05)` }} // Initial border
    >
        {/* Dynamic border color on hover */}
        <div
            className="absolute top-0 left-0 w-[2px] h-0 group-hover:h-full transition-all duration-700 ease-in-out"
            style={{ backgroundColor: primaryColor }}
        />

        <div
            className="mb-6 md:mb-8 opacity-70 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500"
            style={{ color: primaryColor }}
        >
            {icon}
        </div>
        <h3 className="text-xl md:text-2xl font-serif text-white mb-4 md:mb-6 italic">{title}</h3>
        <p className="text-zinc-500 font-sans text-sm leading-relaxed font-light group-hover:text-zinc-300 transition-colors duration-500">
            {description}
        </p>
    </motion.div>
);
