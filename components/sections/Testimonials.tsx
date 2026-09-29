import React from 'react';
import { m } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';

export const Testimonials: React.FC = () => {
  const { config } = useSiteConfig();
  const testimonials = config.texts.testimonials;

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-24 md:py-36 bg-[#060709] relative z-10 border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-[#0C0E12] mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5C579]" />
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              [ DEPOIMENTOS // MEMBROS ]
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 tracking-tight">
            Quem já sentou na mesa,{' '}
            <span className="italic text-[#E5C579]">não volta atrás.</span>
          </h2>
          <p className="text-zinc-400 font-light text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Resultados reais de fundadores que participaram do ecossistema NGHUB.
          </p>
        </m.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              className="group relative p-8 md:p-10 bg-white/[0.02] border border-white/[0.08] rounded-xl hover:border-white/20 transition-all duration-500 flex flex-col justify-between"
            >
              {/* Quote Icon */}
              <div>
                <Quote
                  size={28}
                  className="text-[#E5C579]/30 mb-6 group-hover:text-[#E5C579]/60 transition-colors"
                  strokeWidth={1}
                />

                <p className="text-zinc-300 font-light text-sm md:text-base leading-relaxed mb-8 italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Author & Metric */}
              <div className="pt-6 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-zinc-500 text-xs font-light">{t.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[#E5C579] font-mono text-xs font-semibold tracking-wider">
                      {t.metric}
                    </span>
                  </div>
                </div>
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
