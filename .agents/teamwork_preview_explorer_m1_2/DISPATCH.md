# Dispatch: Explorer M1-2 (Strict TypeScript, Toolchain & Type Safety)

## Objective
Formulate the exact technical plan to achieve clean `npm run typecheck` and `npm run build` with `"strict": true` and zero compiler/linter errors.

## References
- ORIGINAL_REQUEST: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md`
- PROJECT: `/Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md`
- Survey Report: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_survey_3/handoff.md`
- Working Directory: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_2`

## Specific Scope
1. Define exact packages to install/add in `package.json` (`@types/react`, `@types/react-dom`, `@types/node`).
2. Define complete configuration for `tsconfig.json` (`strict: true`, `"exclude": ["node_modules", "dist", "LANDING-PAGE---NG-main"]`, `"include": ["src", "vite-env.d.ts", "*.ts", "*.tsx"]`).
3. Define `vite-env.d.ts` declarations for `ImportMetaEnv` and `ImportMeta`.
4. Catalog all existing implicit `any` errors (e.g. `MarqueeColumn.tsx`, `SectionHeading.tsx`, `WeaponCard.tsx`) and specify explicit TypeScript interfaces to resolve them.
5. Define `package.json` scripts: `"typecheck": "tsc --noEmit"`, `"lint"`.

Scope boundaries: Read-only exploration and technical specification. Do NOT modify source files.
Write report to: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_2/handoff.md`.
