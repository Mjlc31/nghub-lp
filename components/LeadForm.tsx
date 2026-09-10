import React, { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Lock, Send, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { z } from 'zod';
import { formatPhoneNumber } from '../utils/formatUtils';
import { submitLead } from '../services/supabase';

import { REVENUE_BRACKETS } from '../types/leads';

export interface LeadFormProps {
  endpoint?: string;
}

const leadSchema = z.object({
  full_name: z.string().trim().min(3, "Nome completo é obrigatório"),
  whatsapp: z.string().trim().min(14, "WhatsApp inválido. Siga o formato (00) 00000-0000"),
  instagram: z.string().trim().min(2, "Instagram é obrigatório"),
  niche: z.string().trim().min(2, "Nicho é obrigatório"),
  revenue_range: z.enum(REVENUE_BRACKETS, {
    message: "Selecione o faturamento"
  }),
  biggest_challenge: z.string().trim().min(5, "Descreva seu maior desafio em mais palavras"),
  hp: z.string().optional()
});

const step1Schema = leadSchema.pick({ full_name: true, whatsapp: true });
const step2Schema = leadSchema.pick({ instagram: true, niche: true });

export interface InputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  name: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  name,
  type = "text",
  required = true,
  disabled = false
}) => (
  <div className="flex flex-col space-y-2 md:space-y-3 group relative">
    <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium ml-1 transition-colors group-hover:text-ng-gold/70">
      {label}
    </label>
    <m.div
      className="relative"
      whileFocus={{ scale: 1.01 }}
    >
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="bg-white/5 border-b border-white/10 focus:border-ng-gold text-zinc-200 placeholder-zinc-700 px-4 py-3 md:py-4 outline-none transition-all duration-300 font-sans text-sm rounded-t-sm focus:bg-white/10 w-full relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-ng-gold opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_rgba(197,160,89,0.5)]" />
    </m.div>
  </div>
);

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: readonly string[];
  name: string;
  required?: boolean;
  disabled?: boolean;
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  onChange,
  options,
  name,
  required = true,
  disabled = false
}) => (
  <div className="flex flex-col space-y-2 md:space-y-3 group">
    <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium ml-1 transition-colors group-hover:text-ng-gold/70">
      {label}
    </label>
    <m.div
      className="relative"
      whileTap={{ scale: 0.99 }}
    >
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full bg-white/5 border-b border-white/10 focus:border-ng-gold text-zinc-200 px-4 py-3 md:py-4 outline-none transition-all duration-300 font-sans text-sm rounded-t-sm appearance-none cursor-pointer focus:bg-white/10 relative z-10 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="" disabled className="text-zinc-700 bg-ng-black">Selecione uma opção</option>
        {options.map(opt => (
          <option key={opt} value={opt} className="bg-ng-black text-zinc-300 py-2">{opt}</option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50 z-20">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-ng-gold opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_rgba(197,160,89,0.5)]" />
    </m.div>
  </div>
);

export const LeadForm: React.FC<LeadFormProps> = ({ endpoint }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState({
    full_name: '',
    whatsapp: '',
    instagram: '',
    niche: '',
    revenue_range: '',
    biggest_challenge: '',
    hp: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'whatsapp') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleNextStep = (targetStep: 2 | 3) => {
    setErrorMessage('');
    try {
      if (targetStep === 2) {
        step1Schema.parse(formData);
        setCurrentStep(2);
      } else if (targetStep === 3) {
        step2Schema.parse(formData);
        setCurrentStep(3);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrorMessage(error.issues[0]?.message || 'Preencha todos os campos obrigatórios deste passo');
      }
    }
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    if (currentStep === 3) setCurrentStep(2);
    else if (currentStep === 2) setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'loading') return;

    setStatus('loading');
    setErrorMessage('');

    // Full Zod validation
    try {
      leadSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrorMessage(error.issues[0]?.message || 'Preencha todos os campos obrigatórios');
        setStatus('error');
        return;
      }
    }

    // Anti-Spam Honeypot Bot Trap: silently drop if filled
    if (formData.hp && formData.hp.trim().length > 0) {
      setStatus('success');
      setTimeout(() => {
        setFormData({
          full_name: '',
          whatsapp: '',
          instagram: '',
          niche: '',
          revenue_range: '',
          biggest_challenge: '',
          hp: ''
        });
        setCurrentStep(1);
        setStatus('idle');
      }, 8000);
      return;
    }

    try {
      const response = await submitLead(formData, endpoint);

      if (!response.success) {
        throw new Error(response.error || 'Erro ao processar aplicação.');
      }

      setStatus('success');
      setTimeout(() => {
        setFormData({
          full_name: '',
          whatsapp: '',
          instagram: '',
          niche: '',
          revenue_range: '',
          biggest_challenge: '',
          hp: ''
        });
        setCurrentStep(1);
        setStatus('idle');
      }, 8000);
    } catch (err) {
      console.error("Submission error:", err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar candidatura. Tente novamente.');
    }
  };

  if (status === 'success') {
    return (
      <m.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 md:p-16 text-center max-w-2xl mx-auto border-ng-gold/40 shadow-[0_0_100px_rgba(197,160,89,0.1)]"
      >
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-ng-gold/20 blur-xl rounded-full" />
            <CheckCircle className="w-12 h-12 md:w-16 md:h-16 text-ng-gold relative z-10" strokeWidth={0.5} />
          </div>
        </div>
        <h3 className="text-3xl md:text-4xl font-serif text-white mb-4 md:mb-6 italic">Aplicação Enviada.</h3>
        <p className="text-zinc-400 font-sans text-sm md:text-base leading-relaxed font-light max-w-md mx-auto">
          Seus dados entraram em nosso sistema de triagem. <br />
          Se o seu perfil for compatível com a mesa, entraremos em contato via WhatsApp nas próximas 24 horas.
        </p>
      </m.div>
    );
  }

  const isFormLocked = status === 'loading';

  return (
    <m.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-3xl mx-auto relative z-10"
    >
      <form onSubmit={handleSubmit} className="space-y-8 md:space-y-10 bg-[#050505] p-6 md:p-16 border border-white/5 shadow-2xl relative overflow-hidden group">
        {/* Animated Borders */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-ng-gold/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-ng-gold/20 to-transparent" />

        {/* Section Header */}
        <div className="text-center mb-6 md:mb-10">
          <div className="inline-flex items-center gap-2 md:gap-3 border border-ng-gold/20 px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-ng-gold/5 mb-6">
            <Lock className="w-3 h-3 text-ng-gold" />
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-ng-gold">Área de Seleção Exclusiva</span>
          </div>
          <h3 className="text-2xl md:text-4xl font-serif text-white mb-2">Inicie sua Aplicação</h3>
          <p className="text-zinc-500 font-light text-xs md:text-sm">Preencha com precisão. O ecossistema não tolera amadores.</p>
        </div>

        {/* Step Progression Bar */}
        <div className="grid grid-cols-3 gap-2 border-b border-white/10 pb-6">
          {[
            { step: 1, title: '01. Identificação' },
            { step: 2, title: '02. Presença' },
            { step: 3, title: '03. Qualificação' }
          ].map(s => (
            <div
              key={s.step}
              className={`text-center py-2 px-1 border-b-2 transition-all ${
                currentStep === s.step
                  ? 'border-ng-gold text-ng-gold font-bold'
                  : currentStep > s.step
                  ? 'border-emerald-500/60 text-emerald-400 font-medium'
                  : 'border-transparent text-zinc-600'
              }`}
            >
              <div className="flex items-center justify-center gap-1.5 text-[10px] md:text-xs font-mono uppercase tracking-wider">
                {currentStep > s.step && <ShieldCheck size={12} className="text-emerald-400" />}
                <span>{s.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Step 1: Identificação Executiva & Contato */}
        {currentStep === 1 && (
          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 md:space-y-8"
          >
            <InputField
              label="Nome Completo"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              disabled={isFormLocked}
              placeholder="Seu nome oficial"
            />

            <InputField
              label="WhatsApp"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              disabled={isFormLocked}
              placeholder="(00) 00000-0000"
            />

            <div className="pt-4">
              <button
                type="button"
                onClick={() => handleNextStep(2)}
                className="w-full group bg-gradient-to-r from-ng-gold to-ng-gold-light hover:to-white text-ng-black font-serif font-bold py-4 md:py-5 px-8 transition-all duration-300 uppercase tracking-widest text-[10px] md:text-xs shadow-[0_0_30px_rgba(197,160,89,0.2)] hover:shadow-[0_0_50px_rgba(197,160,89,0.5)] flex items-center justify-center gap-2"
              >
                <span>Próximo Passo</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </m.div>
        )}

        {/* Step 2: Presença & Posicionamento */}
        {currentStep === 2 && (
          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 md:space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <InputField
                label="Instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                disabled={isFormLocked}
                placeholder="@seu.perfil"
              />

              <InputField
                label="Nicho de Atuação"
                name="niche"
                value={formData.niche}
                onChange={handleChange}
                disabled={isFormLocked}
                placeholder="Ex: SaaS B2B, Finanças, EdTech..."
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={handlePrevStep}
                className="w-1/3 bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white py-4 md:py-5 px-4 font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={14} />
                <span>Voltar</span>
              </button>

              <button
                type="button"
                onClick={() => handleNextStep(3)}
                className="w-2/3 group bg-gradient-to-r from-ng-gold to-ng-gold-light hover:to-white text-ng-black font-serif font-bold py-4 md:py-5 px-8 transition-all duration-300 uppercase tracking-widest text-[10px] md:text-xs shadow-[0_0_30px_rgba(197,160,89,0.2)] hover:shadow-[0_0_50px_rgba(197,160,89,0.5)] flex items-center justify-center gap-2"
              >
                <span>Próximo Passo</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </m.div>
        )}

        {/* Step 3: Faturamento & Desafio Estratégico */}
        {currentStep === 3 && (
          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 md:space-y-8"
          >
            <SelectField
              label="Faturamento Mensal"
              name="revenue_range"
              value={formData.revenue_range}
              onChange={handleChange}
              disabled={isFormLocked}
              options={REVENUE_BRACKETS}
            />

            <div className="flex flex-col space-y-2 md:space-y-3 group">
              <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium ml-1 transition-colors group-hover:text-ng-gold/70">
                Qual seu maior desafio hoje?
              </label>
              <textarea
                name="biggest_challenge"
                required
                disabled={isFormLocked}
                value={formData.biggest_challenge}
                onChange={handleChange}
                placeholder="Seja honesto. O que está travando seu crescimento?"
                rows={3}
                className="bg-white/5 border-b border-white/10 focus:border-ng-gold text-zinc-200 placeholder-zinc-700 px-4 py-3 md:py-4 outline-none transition-all duration-500 font-sans text-sm rounded-t-sm resize-none focus:bg-white/10 w-full disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Invisible Honeypot Field for Automated Bot Defense */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                left: '-9999px',
                top: '-9999px',
                width: '1px',
                height: '1px',
                opacity: 0,
                pointerEvents: 'none'
              }}
            >
              <label htmlFor="company_website_hp">Website Oficial</label>
              <input
                type="text"
                id="company_website_hp"
                name="hp"
                value={formData.hp || ''}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                disabled={isFormLocked}
                onClick={handlePrevStep}
                className="w-1/3 bg-white/5 border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white py-4 md:py-5 px-4 font-mono text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={14} />
                <span>Voltar</span>
              </button>

              <button
                type="submit"
                disabled={isFormLocked}
                className="w-2/3 group bg-gradient-to-r from-ng-gold to-ng-gold-light hover:to-white text-ng-black font-serif font-bold py-4 md:py-5 px-8 transition-all duration-500 uppercase tracking-widest text-[10px] md:text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(197,160,89,0.2)] hover:shadow-[0_0_50px_rgba(197,160,89,0.5)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                {status === 'loading' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin w-4 h-4" /> Processando...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3 relative z-10">
                    Solicitar Acesso ao Ecossistema <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </button>
            </div>
          </m.div>
        )}

        {/* Error Feedback */}
        <AnimatePresence>
          {(status === 'error' || errorMessage) && (
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-900/10 border border-red-900/30 p-4 flex items-center gap-3 text-red-400 text-xs justify-center"
            >
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </m.div>
          )}
        </AnimatePresence>

        <p className="text-center text-zinc-700 text-[10px] leading-relaxed mt-6">
          Seus dados estão protegidos. Aplicação sujeita a análise de comitê.
        </p>
      </form>
    </m.div>
  );
};
