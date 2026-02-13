import React, { useState, useRef, useEffect } from 'react';
import { Settings, X, Trash2, Plus, RotateCcw, Check, Copy, AlertTriangle, Loader2, Database, Image as ImageIcon, Type, Palette, Link as LinkIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageControl, InputGroup, SectionTitle } from './admin/ImageControl';
import { compressImage } from '../utils/imageUtils';
import { generateContent } from '../services/gemini';

// --- TYPES ---
interface SiteConfig {
  images: {
    hero: string;
    quoteParallax: string;
    gallery: string[];
  };
  texts: {
    heroTitle: string;
    heroSubtitle: string;
    ctaButton: string;
    manifestoTitle: string;
  };
  colors: {
    primary: string;
  };
  integration: {
    formEndpoint: string;
  };
}

interface AdminPanelProps {
  config: SiteConfig;
  onUpdate: (newConfig: SiteConfig) => void;
  onReset?: () => void;
  hasSaveError?: boolean;
}

type Tab = 'images' | 'texts' | 'colors' | 'settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({ config, onUpdate, onReset, hasSaveError }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('images');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState<string | null>(null);
  const [storageUsage, setStorageUsage] = useState(0);

  const singleFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const [activeImageKey, setActiveImageKey] = useState<string | null>(null);

  // Monitor storage usage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const totalString = JSON.stringify(config);
      const size = new Blob([totalString]).size;
      const LIMIT = 4800000;
      const percentage = Math.min(100, Math.round((size / LIMIT) * 100));
      setStorageUsage(percentage);
    }
  }, [config, isOpen]);

  // --- HANDLERS ---

  const handleSingleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const compressedBase64 = await compressImage(file, 'hero');
        // Deep copy for immutability
        const newConfig = {
          ...config,
          images: {
            ...config.images,
            [key]: compressedBase64
          }
        };
        onUpdate(newConfig);
      } catch (error) {
        console.error("Error:", error);
        alert("Erro ao processar imagem. Tente uma menor.");
      } finally {
        setIsProcessing(false);
        if (singleFileRef.current) singleFileRef.current.value = '';
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const compressedBase64 = await compressImage(file, 'gallery');
        const newConfig = {
          ...config,
          images: {
            ...config.images,
            gallery: [compressedBase64, ...config.images.gallery]
          }
        };
        onUpdate(newConfig);
      } catch (error) {
        console.error("Error:", error);
        alert("Erro ao processar imagem.");
      } finally {
        setIsProcessing(false);
        if (galleryFileRef.current) galleryFileRef.current.value = '';
      }
    }
  };

  const removeGalleryImage = (indexToRemove: number) => {
    const newConfig = {
      ...config,
      images: {
        ...config.images,
        gallery: config.images.gallery.filter((_, index) => index !== indexToRemove)
      }
    };
    onUpdate(newConfig);
  };

  const triggerSingleUpload = (key: string) => {
    setActiveImageKey(key);
    singleFileRef.current?.click();
  };

  const updateText = (key: keyof typeof config.texts, value: string) => {
    onUpdate({
      ...config,
      texts: { ...config.texts, [key]: value }
    });
  };

  const generateTextWithAI = async (field: keyof typeof config.texts, context: string) => {
    setIsGeneratingAI(field);
    try {
      const prompt = `Atue como um copywriter de elite para uma landing page de um ecossistema de alta performance (business/networking).
        O tom de voz é: Premium, Exclusivo, "No-nonsense", Provocativo (estilo "clube fechado").
        Gere UMA única opção de texto curta e impactante para o campo: ${context}.
        NÃO use aspas na resposta. NÃO explique. Apenas o texto.`;

      const result = await generateContent(prompt);
      if (result) {
        updateText(field, result.trim());
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar com IA. Verifique a API Key.");
    } finally {
      setIsGeneratingAI(null);
    }
  };

  const updateColor = (value: string) => {
    onUpdate({
      ...config,
      colors: { ...config.colors, primary: value }
    });
  };

  const updateIntegration = (value: string) => {
    onUpdate({
      ...config,
      integration: { ...config.integration, formEndpoint: value }
    });
  };

  const handleCopyConfig = () => {
    const configString = `// COLE ISSO NO INÍCIO DO App.tsx\nconst INITIAL_CONFIG = ${JSON.stringify(config, null, 2)};`;
    navigator.clipboard.writeText(configString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStorageColor = () => {
    if (storageUsage > 90) return 'bg-red-500';
    if (storageUsage > 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const AIButton = ({ field, context }: { field: keyof typeof config.texts, context: string }) => (
    <button
      onClick={() => generateTextWithAI(field, context)}
      disabled={!!isGeneratingAI}
      className="absolute top-0 right-0 p-2 text-ng-gold/70 hover:text-ng-gold transition-colors disabled:opacity-50"
      title="Gerar com IA"
    >
      {isGeneratingAI === field ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
    </button>
  );

  return (
    <>
      <input type="file" ref={singleFileRef} className="hidden" accept="image/*" onChange={(e) => activeImageKey && handleSingleImageUpload(e, activeImageKey)} />
      <input type="file" ref={galleryFileRef} className="hidden" accept="image/*" onChange={handleGalleryUpload} />

      {/* Trigger Button - High Z-Index */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed bottom-6 right-6 z-[9999] bg-zinc-900 text-white p-3.5 rounded-full border border-white/20 hover:border-ng-gold hover:text-ng-gold transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] group"
        onClick={() => setIsOpen(true)}
        title="Editar Site"
      >
        <Settings size={24} className="group-hover:rotate-90 transition-transform duration-700" />
        {storageUsage > 90 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full animate-pulse border-2 border-black" />
        )}
      </motion.button>

      {/* Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[10000]"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0c0c0c] border-l border-white/10 z-[10001] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-zinc-900">
                <div>
                  <h3 className="text-lg font-serif text-white flex items-center gap-2 font-medium">
                    NGHUB <span className="text-[10px] font-sans text-zinc-400 bg-black/40 px-2 py-0.5 rounded border border-white/5 uppercase tracking-wider">Editor</span>
                  </h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-white/10 bg-black/20">
                {[
                  { id: 'images', label: 'Mídia', icon: ImageIcon },
                  { id: 'texts', label: 'Texto', icon: Type },
                  { id: 'colors', label: 'Estilo', icon: Palette },
                  { id: 'settings', label: 'Config', icon: LinkIcon }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex-1 py-4 text-[10px] uppercase tracking-[0.2em] font-medium transition-colors flex flex-col items-center gap-2 ${activeTab === tab.id ? 'text-white bg-white/5' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/[0.02]'
                      }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 relative bg-[#0c0c0c]">

                {/* Storage Alert */}
                {(hasSaveError || storageUsage >= 95) && (
                  <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-md mb-6 flex gap-3 items-start">
                    <AlertTriangle className="text-red-400 mt-0.5 shrink-0" size={16} />
                    <div>
                      <p className="text-xs font-bold text-red-300 uppercase tracking-widest mb-1">Limite de Memória</p>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        O navegador está cheio. Remova fotos da galeria para conseguir salvar novas alterações.
                      </p>
                    </div>
                  </div>
                )}

                {/* IMAGES TAB */}
                {activeTab === 'images' && (
                  <div className="space-y-6">
                    <SectionTitle>Backgrounds</SectionTitle>
                    <ImageControl
                      label="Hero Principal"
                      src={config.images.hero}
                      onUpload={() => triggerSingleUpload('hero')}
                      primaryColor={config.colors.primary}
                      isProcessing={isProcessing}
                      info="Resolução ideal: 1920x1080px (Landscape)"
                    />
                    <ImageControl
                      label="Citação (Parallax)"
                      src={config.images.quoteParallax}
                      onUpload={() => triggerSingleUpload('quoteParallax')}
                      primaryColor={config.colors.primary}
                      isProcessing={isProcessing}
                      info="Aparece no scroll central"
                    />

                    <div className="pt-4">
                      <SectionTitle>Galeria Vertical</SectionTitle>
                      <div className="flex justify-between items-end mb-4">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{config.images.gallery.length} imagens ativas</p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => { if (galleryFileRef.current) { galleryFileRef.current.value = ''; galleryFileRef.current.click() } }}
                          disabled={isProcessing || storageUsage >= 100}
                          className="flex flex-col items-center justify-center border border-dashed border-zinc-700 rounded-md aspect-[3/4] hover:bg-white/5 hover:border-white transition-all group disabled:opacity-50 disabled:cursor-not-allowed bg-black/40 cursor-pointer"
                        >
                          {isProcessing ? (
                            <Loader2 className="animate-spin text-white" size={20} />
                          ) : (
                            <>
                              <Plus size={24} className="text-zinc-600 group-hover:text-white mb-2 transition-colors" />
                              <span className="text-[9px] text-zinc-600 uppercase tracking-widest group-hover:text-white font-bold">Add</span>
                            </>
                          )}
                        </button>

                        {config.images.gallery.map((imgSrc, idx) => (
                          <div key={idx} className="relative group rounded-md overflow-hidden aspect-[3/4] bg-zinc-900 border border-white/5 shadow-lg">
                            <img src={imgSrc} alt="" className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-300" />
                            <button
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute top-1 right-1 bg-black/60 p-1.5 rounded text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 z-10 cursor-pointer"
                              title="Remover"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TEXTS TAB */}
                {activeTab === 'texts' && (
                  <div className="space-y-6">
                    <SectionTitle>Página Principal</SectionTitle>
                    <InputGroup label="Título Principal (Hero)">
                      <div className="relative">
                        <textarea
                          value={config.texts.heroTitle}
                          onChange={(e) => updateText('heroTitle', e.target.value)}
                          rows={4}
                          className="w-full bg-black/40 border border-zinc-800 text-zinc-200 p-3 rounded text-sm focus:border-white/50 focus:bg-black/60 outline-none transition-all resize-none font-light leading-relaxed pr-8"
                        />
                        <AIButton field="heroTitle" context="Título Principal da Landing Page, algo provocativo sobre sucesso e ambiente" />
                      </div>
                    </InputGroup>
                    <InputGroup label="Subtítulo">
                      <div className="relative">
                        <textarea
                          value={config.texts.heroSubtitle}
                          onChange={(e) => updateText('heroSubtitle', e.target.value)}
                          rows={3}
                          className="w-full bg-black/40 border border-zinc-800 text-zinc-200 p-3 rounded text-sm focus:border-white/50 focus:bg-black/60 outline-none transition-all resize-none font-light pr-8"
                        />
                        <AIButton field="heroSubtitle" context="Subtítulo explicando que NGHUB é um ecossistema, não um curso" />
                      </div>
                    </InputGroup>
                    <InputGroup label="Botão Principal">
                      <div className="relative">
                        <input
                          type="text"
                          value={config.texts.ctaButton}
                          onChange={(e) => updateText('ctaButton', e.target.value)}
                          className="w-full bg-black/40 border border-zinc-800 text-zinc-200 p-3 rounded text-sm focus:border-white/50 outline-none transition-all pr-8"
                        />
                        <AIButton field="ctaButton" context="Chamada para ação curta e forte" />
                      </div>
                    </InputGroup>

                    <SectionTitle>Manifesto</SectionTitle>
                    <InputGroup label="Título do Manifesto">
                      <div className="relative">
                        <input
                          type="text"
                          value={config.texts.manifestoTitle}
                          onChange={(e) => updateText('manifestoTitle', e.target.value)}
                          className="w-full bg-black/40 border border-zinc-800 text-zinc-200 p-3 rounded text-sm focus:border-white/50 outline-none transition-all pr-8"
                        />
                        <AIButton field="manifestoTitle" context="Título polêmico para um manifesto de vendas" />
                      </div>
                    </InputGroup>
                  </div>
                )}

                {/* COLORS TAB */}
                {activeTab === 'colors' && (
                  <div className="space-y-8">
                    <SectionTitle>Identidade Visual</SectionTitle>
                    <div className="bg-zinc-900/50 p-6 rounded-lg border border-white/5 flex items-center gap-6">
                      <div className="relative group cursor-pointer overflow-hidden rounded-full w-20 h-20 shadow-2xl border-4 border-black/50">
                        <div className="w-full h-full relative z-10" style={{ backgroundColor: config.colors.primary }}>
                          <input
                            type="color"
                            value={config.colors.primary}
                            onChange={(e) => updateColor(e.target.value)}
                            className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className="text-[10px] uppercase tracking-widest text-zinc-400 block">Cor de Destaque</label>
                        <input
                          type="text"
                          value={config.colors.primary.toUpperCase()}
                          onChange={(e) => updateColor(e.target.value)}
                          className="w-full bg-transparent border-b border-zinc-700 py-2 text-2xl font-serif text-white outline-none focus:border-white transition-colors"
                        />
                        <p className="text-[9px] text-zinc-600">Clique no círculo para abrir o seletor</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* SETTINGS / INTEGRATIONS TAB */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <SectionTitle>Integração com Planilhas</SectionTitle>

                    <div className="bg-zinc-900/50 p-4 rounded-md border border-white/5 space-y-4">
                      <div className="flex items-start gap-3 text-zinc-400 text-[11px] leading-relaxed bg-black/20 p-3 rounded border border-white/5">
                        <Database size={16} className="mt-0.5 shrink-0" />
                        <p>
                          Para enviar os leads para o Google Sheets, use serviços como <strong>SheetMonkey.io</strong> (Grátis) ou Zapier. Crie um formulário lá e cole a URL abaixo.
                        </p>
                      </div>

                      <InputGroup label="URL de Envio (Endpoint)">
                        <input
                          type="text"
                          value={config.integration?.formEndpoint || ''}
                          onChange={(e) => updateIntegration(e.target.value)}
                          placeholder="https://api.sheetmonkey.io/form/..."
                          className="w-full bg-black/40 border border-zinc-800 text-zinc-200 p-3 rounded text-sm focus:border-ng-gold focus:bg-black/60 outline-none transition-all placeholder-zinc-700 font-mono"
                        />
                      </InputGroup>
                    </div>

                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="border-t border-white/10 bg-black p-6">
                <div className="mb-4">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest text-zinc-500 font-medium mb-2">
                    <span>Armazenamento</span>
                    <span className={storageUsage > 90 ? 'text-red-500' : 'text-zinc-400'}>{storageUsage}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${getStorageColor()}`}
                      style={{ width: `${storageUsage}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {onReset && (
                    <button onClick={onReset} className="flex items-center justify-center gap-2 py-3 border border-red-900/30 text-red-500 hover:bg-red-900/10 hover:border-red-500/50 rounded uppercase tracking-widest text-[9px] font-bold transition-all">
                      <RotateCcw size={12} /> Resetar
                    </button>
                  )}
                  <button onClick={handleCopyConfig} className="flex items-center justify-center gap-2 py-3 border border-zinc-700 text-zinc-300 hover:bg-white/5 hover:text-white hover:border-white rounded uppercase tracking-widest text-[9px] font-bold transition-all">
                    {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                    {copied ? "Copiado!" : "Exportar JSON"}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};