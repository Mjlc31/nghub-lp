import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SectionHeading } from '../ui/SectionHeading';
import { MarqueeColumn } from '../ui/MarqueeColumn';

interface GalleryProps {
    images: { gallery: string[] };
    colors: { primary: string };
    scrollToApply: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

export const Gallery: React.FC<GalleryProps> = ({ images, colors, scrollToApply }) => {
    const column1Images = images.gallery.filter((_, i) => i % 2 === 0);
    const column2Images = images.gallery.filter((_, i) => i % 2 !== 0);

    return (
        <section className="py-24 md:py-40 bg-ng-black relative overflow-hidden z-20 border-t border-b border-white/5">
            <div className="max-w-[1600px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 items-center">

                <div className="md:sticky md:top-32 self-start mb-12 md:mb-0">
                    <SectionHeading
                        title="Inside NGHUB"
                        subtitle="O ecossistema não para. Veja os bastidores de quem vive o jogo."
                        align="left"
                        primaryColor={colors.primary}
                    />
                    <p className="text-zinc-400 font-light leading-relaxed max-w-md mb-8">
                        Jantares exclusivos, imersões de negócios e acesso a ambientes onde acordos de 7 dígitos são fechados com um aperto de mão.
                    </p>
                    <a href="#apply" onClick={scrollToApply} className="inline-flex items-center gap-2 text-xs uppercase tracking-widest border-b pb-1 hover:text-white transition-colors" style={{ color: colors.primary, borderColor: colors.primary }}>
                        Ver Galeria Completa <ArrowRight size={12} />
                    </a>
                </div>

                <div className="h-[80vh] md:h-[100vh] relative overflow-hidden flex gap-4 md:gap-6 mask-image-gradient">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-ng-black to-transparent z-10" />
                    <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-ng-black to-transparent z-10" />

                    <MarqueeColumn
                        images={column1Images.length > 0 ? column1Images : images.gallery}
                        direction="up"
                        speed={10}
                        primaryColor={colors.primary}
                    />

                    <MarqueeColumn
                        images={column2Images.length > 0 ? column2Images : images.gallery}
                        direction="down"
                        speed={12}
                        primaryColor={colors.primary}
                    />
                </div>

            </div>
        </section>
    );
};
