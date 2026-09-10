import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || ''),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        onwarn(warning, defaultHandler) {
          // Suppress Zod v4 comment annotation warnings
          if (
            warning.code === 'INVALID_ANNOTATION' ||
            warning.message?.includes('contains an annotation that Rollup cannot interpret')
          ) {
            return;
          }
          defaultHandler(warning);
        },
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom'],
            'vendor-motion': ['framer-motion'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-icons': ['lucide-react'],
            'vendor-zod': ['zod'],
          }
        }
      }
    }
  };
});
