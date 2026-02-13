import React from 'react';
import { motion } from 'framer-motion';

interface MarqueeColumnProps {
    images: string[];
    direction?: 'up' | 'down';
    speed?: number;
    primaryColor: string;
}

export const MarqueeColumn: React.FC<MarqueeColumnProps> = ({
    images,
    direction = 'up',
    speed = 20,
    primaryColor
}) => {
    const displayImages = [...images, ...images, ...images];

    return (
        <div className="flex-1 relative h-[100vh] overflow-hidden">
            <motion.div
                animate={{
                    y: direction === 'up' ? ["0%", "-33.33%"] : ["-33.33%", "0%"]
                }}
                transition={{
                    repeat: Infinity,
                    duration: speed * Math.max(images.length, 5),
                    ease: "linear",
                    repeatType: "loop"
                }}
                className="flex flex-col gap-6 w-full"
            >
                {displayImages.map((src, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-sm border border-white/5 grayscale hover:grayscale-0 transition-all duration-700 shrink-0">
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-30 mix-blend-overlay transition-opacity duration-500 z-10"
                            style={{ backgroundColor: primaryColor }}
                        />
                        <img
                            src={src}
                            alt=""
                            loading="lazy"
                            className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                        />
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
