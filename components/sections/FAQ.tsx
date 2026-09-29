import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { useSiteConfig } from '../../context/SiteConfigContext';

const FAQItem: React.FC<{ question: string; answer: string; index: number }> = ({ question, answer, index }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="border border-white/[0.08] rounded-xl overflow-hidden bg-white/[0.01] hover:border-white/[0.15] transition-colors"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-4 p-6 md:p-8 text-left cursor-pointer group"
      >
        <span className="text-white text-sm md:text-base font-medium pr-4 group-hover:text-[#E5C579] transition-colors">
          {question}
        </span>
        <m.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          <ChevronDown size={18} className="text-zinc-500" />
        </m.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 md:px-8 pb-6 md:pb-8 pt-0">
              <div className="h-[1px] bg-white/[0.06] mb-5" />
              <p className="text-zinc-400 font-light text-sm leading-relaxed">
                {answer}
              </p>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};

export const FAQ: React.FC = () => {
  const { config } = useSiteConfig();
  const faqItems = config.texts.faq;

  if (!faqItems || faqItems.length === 0) return null;

  return (
    <section className="py-24 md:py-36 bg-[#060709] relative z-10 border-t border-white/[0.08]">
      <div className="max-w-3xl mx-auto px-6">
        {/* Section Header */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 md:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-[#0C0E12] mb-6">
            <HelpCircle size={12} className="text-[#E5C579]" />
            <span className="text-[11px] font-mono tracking-widest text-zinc-400 uppercase">
              [ FAQ // PERGUNTAS FREQUENTES ]
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-serif text-white mb-6 tracking-tight">
            Dúvidas Frequentes
          </h2>
          <p className="text-zinc-400 font-light text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Respostas diretas para as perguntas que fundadores sérios fazem antes de aplicar.
          </p>
        </m.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <FAQItem
              key={index}
              question={item.q}
              answer={item.a}
              index={index}
            />
          ))}
        </div>

        {/* Still have questions CTA */}
        <m.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <p className="text-zinc-500 text-xs font-mono tracking-wider">
            Ainda tem dúvidas?{' '}
            <a
              href="#apply"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('apply')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-[#E5C579] hover:text-white transition-colors cursor-pointer"
            >
              Aplique e converse com nosso time →
            </a>
          </p>
        </m.div>
      </div>
    </section>
  );
};

export default FAQ;
