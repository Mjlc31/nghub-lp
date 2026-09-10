import React from 'react';
import { m } from 'framer-motion';
import { Shield } from 'lucide-react';
import { LeadForm } from '../LeadForm';

export interface ApplicationSectionProps {
  formEndpoint?: string;
}

export const ApplicationSection: React.FC<ApplicationSectionProps> = ({ formEndpoint }) => {
  return (
    <section
      id="apply"
      className="py-24 md:py-32 px-4 md:px-6 relative z-20 bg-ng-black min-h-screen flex items-center justify-center scroll-mt-28"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ng-gold/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 border border-ng-gold/30 px-4 py-1.5 rounded-full bg-ng-gold/5 mb-6"
          >
            <Shield className="w-3.5 h-3.5 text-ng-gold" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-ng-gold">
              PROCESSO SELETIVO
            </span>
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif text-white mb-4 tracking-tight"
          >
            Candidatura para o <span className="italic text-ng-gold">Ecossistema</span>.
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 font-light text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          >
            Acesso estritamente limitado a fundadores e operadores com tração comprovada.
            Preencha os dados abaixo para avaliação pelo comitê.
          </m.p>
        </div>

        {/* Multi-step Progressive Form */}
        <LeadForm endpoint={formEndpoint} />
      </div>
    </section>
  );
};
