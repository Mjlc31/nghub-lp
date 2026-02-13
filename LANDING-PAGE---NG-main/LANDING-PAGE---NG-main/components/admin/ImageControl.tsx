import React from 'react';
import { Upload, Loader2 } from 'lucide-react';

interface ImageControlProps {
    label: string;
    src: string;
    onUpload: () => void;
    primaryColor: string;
    isProcessing: boolean;
    info?: string;
}

export const ImageControl: React.FC<ImageControlProps> = ({
    label,
    src,
    onUpload,
    primaryColor,
    isProcessing,
    info
}) => (
    <div className="bg-zinc-900/50 p-4 rounded-md border border-white/5 hover:border-white/10 transition-all group">
        <div className="flex justify-between items-start mb-3">
            <div>
                <label className="text-[11px] uppercase tracking-widest text-zinc-200 flex items-center gap-2 font-bold">
                    {label}
                </label>
                {info && <p className="text-[9px] text-zinc-500 mt-1">{info}</p>}
            </div>
            <button
                onClick={onUpload}
                disabled={isProcessing}
                type="button"
                className="text-[10px] uppercase tracking-widest hover:text-white cursor-pointer disabled:opacity-50 flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-colors"
                style={{ color: primaryColor }}
            >
                <Upload size={12} /> Alterar
            </button>
        </div>

        <div className="relative w-full h-36 overflow-hidden rounded-md bg-black border border-white/10">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            {isProcessing && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                    <Loader2 className="animate-spin text-white" size={24} />
                </div>
            )}
            {src ? (
                <img src={src} alt="Preview" className="w-full h-full object-cover transition-opacity duration-700" />
            ) : (
                <div className="flex items-center justify-center h-full text-zinc-700 text-xs uppercase tracking-widest">Sem Imagem</div>
            )}
        </div>
    </div>
);

export const SectionTitle = ({ children }: { children?: React.ReactNode }) => (
    <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
        <h4 className="text-[11px] font-bold text-white uppercase tracking-[0.2em] shrink-0">
            {children}
        </h4>
        <div className="h-[1px] flex-1 bg-white/10"></div>
    </div>
);

export const InputGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div className="space-y-2 mb-4">
        <label className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium block">{label}</label>
        {children}
    </div>
);
