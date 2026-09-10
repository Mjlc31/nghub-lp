# Dispatch: Explorer M1-1 (App.tsx Monolith Decomposition & Context Architecture)

## Objective
Formulate the exact refactoring plan for decomposing `App.tsx` (220 lines) into clean modular components, introducing `SiteConfigContext`, extracting `Navbar`, and isolating `AdminGate`.

## References
- ORIGINAL_REQUEST: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md`
- PROJECT: `/Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md`
- Survey Report: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_survey_1/handoff.md`
- Working Directory: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_1`

## Specific Scope
1. Define the exact specification and interfaces for:
   - `components/layout/Navbar.tsx`: Props, navigation links, mobile toggle, live cohort badge.
   - `context/SiteConfigContext.tsx`: Provider interface, hook `useSiteConfig()`, eliminating 8-layer prop drilling.
   - `components/layout/AdminGate.tsx`: Hotkey listener (`CTRL+SHIFT+A`), removal of `?admin=true` URL backdoor, lazy loading of `AdminPanel` and `Login`.
2. Provide the refactored skeleton of `App.tsx` targeting <70 lines.
3. Verify zero regressions to public page rendering.

Scope boundaries: Read-only exploration and architecture design. Do NOT modify source files.
Write report to: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_1/handoff.md`.

## 2026-09-10T04:46:22Z
You are Explorer M1-1 (App.tsx Monolith Decomposition & Context Architecture).
Your working directory: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_1
Your task description is at: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_1/DISPATCH.md
Project specification: /Users/arthurdemoraespd/Documents/nghub-lp/PROJECT.md
Original User Request: /Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md
Workspace root: /Users/arthurdemoraespd/Documents/nghub-lp

Formulate the exact architectural blueprint for:
1. Decomposing App.tsx from 220 lines to <70 lines.
2. Extracting Navbar (components/layout/Navbar.tsx).
3. Creating SiteConfigContext (context/SiteConfigContext.tsx) to eliminate 8-layer prop-drilling.
4. Extracting AdminGate (components/layout/AdminGate.tsx) to isolate hotkeys and remove ?admin=true backdoor.

Scope boundary: Read-only exploration. Do NOT write or modify code. Write report to /Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m1_1/handoff.md.
