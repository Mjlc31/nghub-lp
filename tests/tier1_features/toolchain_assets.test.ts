import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from '../harness/runner.ts';

export function registerToolchainAssetsTests() {
  describe('Tier 1 — Features 1, 2, 4, 5, 6, 18, 19, 20: Toolchain, Tokens & Assets', () => {
    const rootDir = process.cwd();

    it('F1.1: tsconfig.json is valid and targets modern ECMAScript with React JSX', () => {
      const tsconfigPath = path.join(rootDir, 'tsconfig.json');
      assert(fs.existsSync(tsconfigPath), 'tsconfig.json must exist');
      const content = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      assert.strictEqual(content.compilerOptions.target, 'ES2022');
      assert.strictEqual(content.compilerOptions.jsx, 'react-jsx');
      assert.strictEqual(content.compilerOptions.moduleResolution, 'bundler');
    });

    it('F2.1: App.tsx root component is structured as a modular React Functional Component', () => {
      const appPath = path.join(rootDir, 'App.tsx');
      assert(fs.existsSync(appPath), 'App.tsx must exist');
      const appContent = fs.readFileSync(appPath, 'utf8');
      assert(appContent.includes('export default App'), 'App.tsx must export default App component');
      assert(appContent.includes('LazyMotion'), 'App.tsx must wrap application in performance LazyMotion container');
    });

    it('F4.1: animation setup standardizes on LazyMotion with domAnimation', () => {
      const appPath = path.join(rootDir, 'App.tsx');
      const appContent = fs.readFileSync(appPath, 'utf8');
      assert(appContent.includes('LazyMotion'), 'Must use LazyMotion for tree-shaking');
      assert(appContent.includes('domAnimation'), 'Must use lightweight domAnimation feature set');
    });

    it('F5.1: index.html configures Google Fonts preconnects and typography triad', () => {
      const indexPath = path.join(rootDir, 'index.html');
      assert(fs.existsSync(indexPath), 'index.html must exist');
      const html = fs.readFileSync(indexPath, 'utf8');
      assert(html.includes('fonts.googleapis.com'), 'Must preconnect to Google Fonts');
      assert(html.includes('fonts.gstatic.com'), 'Must preconnect to gstatic');
      assert(html.includes('Inter') || html.includes('Geist'), 'Must import primary sans font');
    });

    it('F6.1: tailwind.config.js defines brand color tokens (black, gold, white)', () => {
      const tailwindPath = path.join(rootDir, 'tailwind.config.js');
      assert(fs.existsSync(tailwindPath), 'tailwind.config.js must exist');
      const tw = fs.readFileSync(tailwindPath, 'utf8');
      assert(tw.includes('#030303') || tw.includes('#060709'), 'Must configure canvas obsidian/black token');
      assert(tw.includes('#C5A059') || tw.includes('#E5C579'), 'Must configure champagne/gold accent token');
    });

    it('F18.1: public assets directory contains required photography assets', () => {
      const publicDir = path.join(rootDir, 'public');
      assert(fs.existsSync(publicDir), 'public/ directory must exist');
      const files = fs.readdirSync(publicDir);
      assert(files.includes('NG-141.jpg'), 'Hero image NG-141.jpg must be present');
      assert(files.includes('NG-355.jpg'), 'Gallery asset NG-355.jpg must be present');
      assert(files.includes('robots.txt'), 'robots.txt must be present');
      assert(files.includes('sitemap.xml'), 'sitemap.xml must be present');
    });

    it('F19.1: vite.config.ts configures React plugin for optimized production builds', () => {
      const viteConfigPath = path.join(rootDir, 'vite.config.ts');
      assert(fs.existsSync(viteConfigPath), 'vite.config.ts must exist');
      const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
      assert(viteConfig.includes('@vitejs/plugin-react'), 'Vite must configure @vitejs/plugin-react');
    });

    it('F20.1: .gitignore excludes build output, node_modules, and system files', () => {
      const gitignorePath = path.join(rootDir, '.gitignore');
      assert(fs.existsSync(gitignorePath), '.gitignore must exist');
      const gitignore = fs.readFileSync(gitignorePath, 'utf8');
      assert(gitignore.includes('node_modules'), 'Must ignore node_modules');
      assert(gitignore.includes('dist'), 'Must ignore dist');
      assert(gitignore.includes('.DS_Store'), 'Must ignore OS metadata');
    });
  });
}
