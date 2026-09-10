import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      'LANDING-PAGE---NG-main/**',
      '.agents/**',
      'temp_skills/**',
      'tests/**'
    ]
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
          allowExportNames: ['useSiteConfig', 'useSiteColors', 'useSiteTexts', 'useSiteImages']
        }
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'framer-motion',
              importNames: ['motion'],
              message: 'Tree-shaking violation: Import `m` instead of `motion` to maintain LazyMotion optimization.',
            },
          ],
        },
      ]
    },
  }
);
