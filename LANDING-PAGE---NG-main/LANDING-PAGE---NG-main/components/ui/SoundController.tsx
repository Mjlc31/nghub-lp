import { useEffect, useRef } from 'react';

// Simple metallic click sound (Base64 for invalid/short placeholder or we use Web Audio API)
// For "Silicon Valley" level, we use Web Audio API to synthesize sounds to avoid loading assets.

export const useAudioUX = () => {
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        // Initialize Audio Context on user interaction (browser policy)
        const initAudio = () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
        };

        window.addEventListener('click', initAudio, { once: true });
        return () => window.removeEventListener('click', initAudio);
    }, []);

    const playClickSound = () => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Metallic/Glassy Click
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.15);
    };

    const playHoverSound = () => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Low frequency hum/whoosh
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(50, ctx.currentTime);

        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.05);
    };

    return { playClickSound, playHoverSound };
};

export const SoundController = () => {
    const { playClickSound, playHoverSound } = useAudioUX();

    useEffect(() => {
        // Disable audio on mobile/tablet to save battery and avoid touch conflicts
        if (window.matchMedia("(max-width: 768px)").matches) return;

        const handleGlobalClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Play sound if clicking a button or link
            if (target.closest('button') || target.closest('a')) {
                playClickSound();
            }
        };

        const handleGlobalHover = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.matches('button, a, [role="button"]')) {
                playHoverSound();
            }
        };

        window.addEventListener('mousedown', handleGlobalClick);
        // Hover sound might be too noisy, enabling only for mousedown for now to test
        // window.addEventListener('mouseover', handleGlobalHover); 

        return () => {
            window.removeEventListener('mousedown', handleGlobalClick);
            // window.removeEventListener('mouseover', handleGlobalHover);
        };
    }, [playClickSound, playHoverSound]);

    return null; // Headless component
};
