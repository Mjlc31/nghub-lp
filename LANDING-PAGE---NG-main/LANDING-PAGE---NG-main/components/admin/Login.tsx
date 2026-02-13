import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Loader2, AlertCircle } from 'lucide-react';
import { signIn } from '../../services/supabase';

interface LoginProps {
    onLoginSuccess: () => void;
    onClose: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await signIn(email, password);

        if (error) {
            setError('Credenciais inválidas ou erro de conexão.');
            setLoading(false);
        } else {
            onLoginSuccess();
            onClose();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <div className="bg-[#0c0c0c] border border-white/10 p-8 rounded-lg max-w-md w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
                >
                    ✕
                </button>

                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-white/5 rounded-full border border-white/5">
                        <Lock className="w-6 h-6 text-ng-gold" />
                    </div>
                </div>

                <h2 className="text-2xl font-serif text-white text-center mb-2">Acesso Restrito</h2>
                <p className="text-zinc-500 text-xs text-center uppercase tracking-widest mb-8">Painel Administrativo NGHUB</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-zinc-800 text-white p-3 rounded text-sm focus:border-ng-gold outline-none transition-all placeholder-zinc-700"
                            placeholder="admin@nghub.com"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-zinc-400 block mb-2">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-black/40 border border-zinc-800 text-white p-3 rounded text-sm focus:border-ng-gold outline-none transition-all placeholder-zinc-700"
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-900/10 border border-red-900/30 p-3 flex items-center gap-2 text-red-400 text-xs rounded">
                            <AlertCircle size={14} />
                            <span>{error}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-ng-gold hover:bg-white text-black font-bold py-3 uppercase tracking-widest text-xs rounded transition-all mt-4 flex justify-center items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : "Entrar"}
                    </button>
                </form>
            </div>
        </motion.div>
    );
};
