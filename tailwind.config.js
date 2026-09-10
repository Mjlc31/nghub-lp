/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./context/**/*.{js,ts,jsx,tsx}",
        "./hooks/**/*.{js,ts,jsx,tsx}",
        "./config/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Obsidian Canvas & Surface Tokens (Feature 6)
                obsidian: {
                    DEFAULT: '#060709',
                    canvas: '#060709',       // Deep obsidian canvas base
                    surface: '#0C0E12',      // Secondary elevated card surface
                    elevated: '#14171F',     // Tertiary surface / modal background
                    border: 'rgba(255, 255, 255, 0.08)',
                },
                // Pale Champagne & Gold Tokens (Feature 6)
                champagne: {
                    DEFAULT: '#E5C579',      // Refined pale champagne accent
                    light: '#F4DE9C',        // Subtle light champagne highlight
                    muted: '#C5A059',        // Muted classic gold
                    dim: '#997D3E',          // Low-contrast gold
                },
                // Backward-compatible 'ng' palette (ensures existing components & tests render cleanly)
                ng: {
                    black: '#060709',        // Updated from #030303 to obsidian
                    dark: '#0C0E12',         // Updated from #080808 to secondary surface
                    surface: '#14171F',      // Tertiary surface
                    gold: '#E5C579',         // Updated from #C5A059 to pale champagne
                    'gold-light': '#F4DE9C',
                    'gold-muted': '#C5A059',
                    'gold-dim': '#997D3E',
                    white: '#F5F5F5',
                }
            },
            fontFamily: {
                // Silicon Valley Typography Triad (Feature 5)
                display: ['"Geist"', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
                sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
                serif: ['"Instrument Serif"', 'Georgia', 'serif'],
                accent: ['"Instrument Serif"', 'Georgia', 'serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gold-gradient': 'linear-gradient(135deg, #E5C579 0%, #F4DE9C 50%, #C5A059 100%)',
                'vignette': 'radial-gradient(circle at center, transparent 0%, rgba(6,7,9,0.85) 100%)',
            },
            boxShadow: {
                'glow': '0 0 40px -10px rgba(229, 197, 121, 0.15)',
                'glow-subtle': '0 0 25px -5px rgba(229, 197, 121, 0.10)',
                'spotlight': '0 0 80px -20px rgba(255, 255, 255, 0.08)',
            },
            borderColor: {
                'white-subtle': 'rgba(255, 255, 255, 0.08)',
                'white-faint': 'rgba(255, 255, 255, 0.05)',
            },
            keyframes: {
                marquee: {
                    '0%': { transform: 'translateX(0%)' },
                    '100%': { transform: 'translateX(-50%)' },
                }
            },
            animation: {
                marquee: 'marquee 40s linear infinite',
            }
        },
    },
    plugins: [],
}
