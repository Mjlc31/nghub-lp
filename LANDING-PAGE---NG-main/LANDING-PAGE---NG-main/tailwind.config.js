/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./services/**/*.{js,ts,jsx,tsx}",
        "./utils/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ng: {
                    black: '#030303',
                    dark: '#080808',
                    gold: '#C5A059',
                    'gold-light': '#E5C579',
                    'gold-dim': '#6B5628',
                    white: '#F0F0F0',
                }
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                display: ['"Cinzel"', 'serif'],
                sans: ['"Inter"', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gold-gradient': 'linear-gradient(135deg, #C5A059 0%, #F4D082 50%, #9E7D3C 100%)',
                'vignette': 'radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%)',
            },
            boxShadow: {
                'glow': '0 0 40px -10px rgba(197, 160, 89, 0.15)',
            }
        },
    },
    plugins: [],
}
