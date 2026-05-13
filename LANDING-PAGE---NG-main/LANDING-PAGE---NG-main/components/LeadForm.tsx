import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle, AlertCircle, Lock, Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatPhoneNumber } from '../utils/formatUtils';
import { submitLead } from '../services/supabase';
import { classifyLead } from '../services/gemini';

interface LeadFormProps {
  endpoint?: string;
}

const InputField = ({
  label,
  value,
  onChange,
  placeholder,
  name,
  type = "text",
  required = true
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  name: string;
  type?: string;
  required?: boolean;
}) => (
  <div className="flex flex-col space-y-2 md:space-y-3 group relative">
    <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium ml-1 transition-colors group-hover:text-ng-gold/70">
      {label}
    </label>
    <motion.div
      className="relative"
      whileFocus={{ scale: 1.01 }}
    >
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="bg-white/5 border-b border-white/10 focus:border-ng-gold text-zinc-200 placeholder-zinc-700 px-4 py-3 md:py-4 outline-none transition-all duration-300 font-sans text-sm rounded-t-sm focus:bg-white/10 w-full relative z-10"
      />
      {/* Glow effect on focus */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-ng-gold opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_rgba(197,160,89,0.5)]" />
    </motion.div>
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  name,
  required = true
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  name: string;
  required?: boolean;
}) => (
  <div className="flex flex-col space-y-2 md:space-y-3 group">
    <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium ml-1 transition-colors group-hover:text-ng-gold/70">
      {label}
    </label>
    <motion.div
      className="relative"
      whileTap={{ scale: 0.99 }}
    >
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full bg-white/5 border-b border-white/10 focus:border-ng-gold text-zinc-200 px-4 py-3 md:py-4 outline-none transition-all duration-300 font-sans text-sm rounded-t-sm appearance-none cursor-pointer focus:bg-white/10 relative z-10"
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
      {/* Glow effect on focus */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-ng-gold opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 shadow-[0_0_10px_rgba(197,160,89,0.5)]" />
    </motion.div>
  </div>
);

export const LeadForm: React.FC<LeadFormProps> = ({ endpoint }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    whatsapp: '',
    instagram: '',
    niche: '',
    revenue_range: '',
    biggest_challenge: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleNextStep = () => {
    if (!formData.full_name || !formData.whatsapp || !formData.instagram) {
      setErrorMessage('Por favor, preencha todos os campos antes de continuar.');
      setStatus('error');
      return;
    }
    setErrorMessage('');
    setStatus('idle');
    setStep(2);
  };

  const handlePrevStep = () => {
    setErrorMessage('');
    setStatus('idle');
    setStep(1);
  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'whatsapp') {
      setFormData(prev => ({ ...prev, [name]: formatPhoneNumber(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // AI Enrichment
    let aiAnalysis = '';
    try {
      aiAnalysis = await classifyLead({
        niche: formData.niche,
        revenue_range: formData.revenue_range,
        biggest_challenge: formData.biggest_challenge
      });
    } catch (e) {
      console.warn("AI Classification failed", e);
    }

    // If no endpoint is configured, try Supabase
    if (!endpoint) {
      try {
        const { error } = await submitLead({
          ...formData,
          notes: aiAnalysis // Add AI analysis to notes
        });
        if (error) throw error;

        setStatus('success');
        setTimeout(() => {
          setFormData({ full_name: '', whatsapp: '', instagram: '', niche: '', revenue_range: '', biggest_challenge: '' });
          setStatus('idle');
        }, 8000);
      } catch (err) {
        console.error("Supabase Error:", err);
        setStatus('error');
        setErrorMessage('Erro ao salvar no banco de dados.');
      }
      return;
    }

    // Legacy / Webhook Support
    try {
      const payload = {
        ...formData,
        notes: aiAnalysis, // Add AI analysis to payload
        created_at: new Date().toISOString(),
        source: 'Landing Page'
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Falha no envio");

      setStatus('success');
      setTimeout(() => {
        setFormData({ full_name: '', whatsapp: '', instagram: '', niche: '', revenue_range: '', biggest_challenge: '' });
        setStatus('idle');
      }, 8000);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage('Erro de conexão. Verifique sua internet ou tente novamente.');
    }
  };


  if (status === 'success') {
    return (
      <motion.div
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
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-3xl mx-auto relative z-10"
    >
      <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12 bg-[#050505] p-6 md:p-16 border border-white/5 shadow-2xl relative overflow-hidden group">

        {/* Animated Borders */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-ng-gold/40 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-ng-gold/20 to-transparent" />

        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 md:gap-3 border border-ng-gold/20 px-4 py-1.5 md:px-6 md:py-2 rounded-full bg-ng-gold/5 mb-6 md:mb-8">
            <Lock className="w-3 h-3 text-ng-gold" />
            <span className="text-[9px] md:text-[10px] uppercase tracking-[0.25em] text-ng-gold">Área de Seleção Exclusiva</span>
          </div>
          <h3 className="text-2xl md:text-4xl font-serif text-white mb-2">Inicie sua Aplicação</h3>
          <p className="text-zinc-500 font-light text-xs md:text-sm">Preencha com precisão. O ecossistema não tolera amadores.</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center mb-8 relative">
          <div className="flex items-center gap-2 relative z-10">
            <div className={`w-12 h-1 rounded-full transition-colors duration-300 ${step >= 1 ? 'bg-ng-gold' : 'bg-white/10'}`} />
            <div className={`w-12 h-1 rounded-full transition-colors duration-300 ${step >= 2 ? 'bg-ng-gold' : 'bg-white/10'}`} />
          </div>
          <span className="absolute top-4 text-[9px] text-zinc-500 uppercase tracking-widest text-center w-full">
            Passo {step} de 2
          </span>
        </div>

        <div className="relative min-h-[350px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 md:space-y-8 absolute w-full top-0"
              >
                <InputField
                  label="Nome Completo"
                  name="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Seu nome oficial"
                />

                <div className="grid grid-cols-1 gap-6 md:gap-8">
                  <div>
                    <InputField
                      label="WhatsApp"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => handleChange({ ...e, target: { ...e.target, name: 'whatsapp' } })}
                      placeholder="(00) 00000-0000"
                    />
                    <p className="text-[9px] text-zinc-600 mt-2 ml-1">Usaremos apenas para contato sobre a aplicação.</p>
                  </div>
                  
                  <InputField
                    label="Instagram"
                    name="instagram"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@seu.perfil"
                  />
                </div>
                
                <div className="pt-4">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full group bg-white/5 hover:bg-white/10 border border-white/10 text-white font-serif font-bold py-5 md:py-6 px-8 transition-all duration-300 uppercase tracking-widest text-[10px] md:text-xs relative overflow-hidden"
                  >
                    <span className="flex items-center justify-center gap-3 relative z-10">
                      Continuar Aplicação <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </span>
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 md:space-y-8 absolute w-full top-0"
              >
                <div className="grid grid-cols-1 gap-6 md:gap-8">
                  <InputField
                    label="Nicho de Atuação"
                    name="niche"
                    value={formData.niche}
                    onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                    placeholder="Ex: Vendas, SaaS, Medicina..."
                  />

                  <SelectField
                    label="Faturamento Mensal"
                    name="revenue_range"
                    value={formData.revenue_range}
                    onChange={(e) => handleChange({ ...e, target: { ...e.target, name: 'revenue_range' } })}
                    options={[
                      "Estou começando (< R$ 10k)",
                      "Tracionando (R$ 10k - R$ 50k)",
                      "Escalando (R$ 50k - R$ 100k)",
                      "Consolidado (R$ 100k - R$ 500k)",
                      "High Stakes (R$ 500k+)"
                    ]}
                  />
                </div>

                <div className="flex flex-col space-y-2 md:space-y-3 group">
                  <label className="text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-medium ml-1 transition-colors group-hover:text-ng-gold/70">
                    Qual seu maior desafio hoje?
                  </label>
                  <textarea
                    name="biggest_challenge"
                    required
                    value={formData.biggest_challenge}
                    onChange={(e) => setFormData({ ...formData, biggest_challenge: e.target.value })}
                    placeholder="Seja honesto. O que está te impedindo de escalar para o próximo nível?"
                    rows={4}
                    className="bg-white/5 border-b border-white/10 focus:border-ng-gold text-zinc-200 placeholder-zinc-700 px-4 py-3 md:py-4 outline-none transition-all duration-500 font-sans text-sm rounded-t-sm resize-none focus:bg-white/10 w-full min-h-[100px]"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="group bg-transparent border border-white/10 hover:border-white/20 text-zinc-400 hover:text-white py-5 px-6 transition-all duration-300"
                  >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  </button>

                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="flex-1 group bg-gradient-to-r from-ng-gold to-ng-gold-light hover:to-white text-ng-black font-serif font-bold py-5 md:py-6 px-8 transition-all duration-500 uppercase tracking-widest text-[10px] md:text-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(197,160,89,0.2)] hover:shadow-[0_0_50px_rgba(197,160,89,0.5)] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
                    {status === 'loading' ? (
                      <span className="flex items-center justify-center gap-2 relative z-10">
                        <Loader2 className="animate-spin w-4 h-4" /> Processando...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3 relative z-10">
                        Finalizar e Enviar <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {status === 'error' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-900/10 border border-red-900/30 p-4 flex items-center gap-3 text-red-400 text-xs justify-center relative z-20 mt-8"
            >
              <AlertCircle size={14} />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-zinc-700 text-[10px] leading-relaxed mt-6">
          Seus dados estão protegidos. Aplicação sujeita a análise de comitê.
        </p>
      </form>
    </motion.div>
  );
};