# Dispatch: Survey Explorer 1 (Architecture & Codebase)

## Objective
Map the existing architecture, code structure, data flow, and backend/Supabase integrations for the NG Hub React landing page overhaul.

## Authoritative Reference
- ORIGINAL_REQUEST: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/ORIGINAL_REQUEST.md`
- Project Workspace Root: `/Users/arthurdemoraespd/Documents/nghub-lp`

## Focus Areas
1. Analyze `src/App.tsx` and all existing components to identify monolithic patterns, mixed concerns, state bloat, and modularization targets.
2. Inspect Supabase client initialization, environment variables, database queries, authentication/data tables used, and error handling.
3. Map component dependencies, shared state, custom hooks, and utility functions.
4. Enumerate all current and expected functional features (leads submission, waitlist, auth, interactive demos, navigation, etc.).

## Output
Write a structured report to `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_survey_1/handoff.md`.
Include:
- Executive Summary
- Current Codebase Architecture Map
- Monolith & App.tsx Breakdown (components, hooks, services to extract)
- Supabase Integration & Data Flow Analysis
- Complete Functional Feature Inventory
- Concrete recommendations for modularization milestones
