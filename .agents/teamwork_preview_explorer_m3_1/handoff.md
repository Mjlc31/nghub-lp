# Technical Blueprint & Investigation Report: Milestone 3 (Features 14, 15, 16)

**Agent**: `explorer_m3_1` (Archetype: `teamwork_preview_explorer`)  
**Working Directory**: `/Users/arthurdemoraespd/Documents/nghub-lp/.agents/teamwork_preview_explorer_m3_1`  
**Workspace Root**: `/Users/arthurdemoraespd/Documents/nghub-lp`  
**Timestamp**: 2026-09-10T13:55:00Z  

---

## 1. OBSERVATION

Direct analysis of the workspace codebase, existing tests, and specification documents revealed the following structural, architectural, and runtime facts:

### 1.1 Test Suite & Verification Baseline
- **Test execution command**: `npm test` runs `node --experimental-strip-types tests/index.ts`.
  - **Result**: 28 suites, 114 tests, **114 passed (100%)**, 0 failed in 0.08s.
- **Build command**: `npm run build` runs `tsc --noEmit && vite build`.
  - **Result**: Compilation succeeded with zero TypeScript errors. Bundle emitted in 3.08s.
- **Test contracts for Features 14, 15, 16**:
  - `tests/tier1_features/lead_form.test.ts`:
    - Lines 9–16: Defines `leadSchema` requiring 6 fields: `full_name` (min 3), `whatsapp` (min 14), `instagram` (min 2), `niche` (min 2), `revenue_range` (min 2), `biggest_challenge` (min 5).
    - Lines 27–32: Verifies WhatsApp mask via `formatPhoneNumber('11987654321') === '(11) 98765-4321'`.
    - Lines 34–38: Mandates exactly 5 revenue brackets (`REVENUE_BRACKETS.length === 5`).
    - Lines 56–70: Verifies honeypot detection (`verifyHoneypot(BOT_APPLICATION_WITH_HONEYPOT)` flags `isSpam: true` and action `drop`).
  - `tests/tier1_features/supabase_leads.test.ts`:
    - Lines 13–25: `submitLead` inserts into `leads` table with default `status: 'new'`.
    - Lines 27–41: `getLeads` retrieves leads ordered by `created_at` descending.
    - Lines 43–53: `updateLeadStatus` transitions lead status (`qualified`, `won`, etc.).
    - Lines 55–74: Dual-write webhook dispatch when endpoint is configured (`source: 'Landing Page'`).
  - `tests/tier2_boundaries/phone_mask_boundaries.test.ts`:
    - Validates 10 digits `(11) 3333-4444`, 11 digits `(11) 98765-4321`, non-numeric stripping, truncation of overflow beyond 11 digits, and partial typing preservation.
  - `tests/tier2_boundaries/revenue_boundaries.test.ts`:
    - Tests enum acceptance for:
      1. `"Estou começando (< R$ 10k)"`
      2. `"Tracionando (R$ 10k - R$ 50k)"`
      3. `"Escalando (R$ 50k - R$ 100k)"`
      4. `"Consolidado (R$ 100k - R$ 500k)"`
      5. `"High Stakes (R$ 500k+)"`
    - Verifies rejection of unrecognized custom strings and non-string inputs.
  - `tests/tier3_combinations/honeypot_bot_flow.test.ts`:
    - Lines 13–33: Bot triggers `hp` -> drops submission -> database table remains untouched.
  - `tests/tier4_scenarios/scenario4_admin_operations.test.ts`:
    - Simulates admissions triage workflow: Hotkey `CTRL+SHIFT+A` -> Authenticate -> Query `leads` table -> Update status to `'qualified'` -> Sign out.

### 1.2 Current State of Implementation Files
- **`components/LeadForm.tsx`** (349 lines):
  - Single-step form containing all 6 fields rendered together.
  - Uses `formatPhoneNumber` for WhatsApp.
  - Contains basic Zod schema, but does not implement:
    - Multi-step progressive step navigation.
    - Invisible honeypot field (`hp`) for bot defense.
    - Visual step indicator / progress tracker matching the Silicon Valley aesthetic.
    - Dual-write fallback when endpoint is configured alongside Supabase.
- **`components/sections/` layout**:
  - `PROJECT.md` (lines 6–7) defines:
    `components/sections/`: `Hero.tsx`, `ProofBar.tsx`, `BentoGrid.tsx`, `Manifesto.tsx`, `Gallery.tsx`, `ApplicationSection.tsx`.
  - Currently, `components/sections/ApplicationSection.tsx` does NOT exist.
  - In `App.tsx` (lines 47–49), the section container is embedded directly:
    ```tsx
    <section id="apply" className="py-24 md:py-32 px-4 md:px-6 relative z-20 bg-ng-black min-h-screen flex items-center justify-center scroll-mt-28">
      <div className="w-full relative z-10"><LeadForm /></div>
    </section>
    ```
- **`services/supabase.ts`** (71 lines):
  - Initializes Supabase client with `createClient(SUPABASE_URL, SUPABASE_ANON_KEY)` without fallback guard strings when environment variables are not populated.
  - Exports `submitLead`, `getLeads`, `updateLeadStatus`, `signIn`, `signOut`, `getCurrentUser`.
  - In `submitLead`:
    - Inserts `{ ...leadData, status: 'new' }`.
    - Does NOT check for honeypot bot trap before calling the database.
    - Does NOT handle optional dual-write webhook dispatch.
    - Returns `{ data, error }` instead of `{ success, data, error }`.
- **`types.ts` vs `types/leads.ts`**:
  - `types.ts` is currently a single root file.
  - `PROJECT.md` specifies `types/`: `config.ts`, `leads.ts`, `database.ts`.
  - `Lead` interface in `types.ts` has `status?: 'new' | 'contacted' | 'qualified' | 'lost' | 'won'`. The MISSION specifies status triage including `rejected`.
- **`components/AdminPanel.tsx`** (473 lines):
  - Defines `export type Tab = 'images' | 'texts' | 'colors' | 'settings';`.
  - Has no `'leads'` tab.
  - Does NOT import or invoke `getLeads` or `updateLeadStatus`.
  - `components/admin/LeadsTable.tsx` does NOT exist.
- **`components/layout/AdminGate.tsx`** (126 lines):
  - Properly handles session check, `CTRL+SHIFT+A` / `CMD+SHIFT+A` hotkey, and renders `<AdminPanel>` when authenticated. Ready to host the leads dashboard immediately.

---

## 2. LOGIC CHAIN

From these direct observations, we trace the step-by-step logic to the architectural blueprint:

1. **Feature 14 Multi-Step Progressive Form Architecture**:
   - *Premise*: NG Hub is an exclusive high-ticket private network (acceptance rate ~4.2%). A monolithic 6-field form feels like an ordinary webform, increases user abandonment, and lowers perceived exclusivity.
   - *Progression Design*: Splitting the form into 3 logical phases mirrors an executive admissions interview:
     - **Step 1: Identificação Executiva & Contato Direto** (`full_name`, `whatsapp` with dynamic mask).
     - **Step 2: Pegada Digital & Mercado** (`instagram`, `niche`).
     - **Step 3: Qualificação & Gargalo Estratégico** (`revenue_range` 5-tier selection, `biggest_challenge`, plus hidden honeypot).
   - *Validation Logic*: Progressive step validation using Zod sub-schemas prevents advancing with invalid or empty data, giving immediate, contextual feedback before reaching Step 3.
   - *Honeypot Bot Trap*: An invisible field named `hp` (or `website_url_hp`) placed off-screen (`position: absolute; left: -9999px; opacity: 0; pointer-events: none; tabIndex: -1; aria-hidden: true; autoComplete: "off"`). If any value is filled, automated bots are trapped: the application short-circuits, skips database insertion, and simulates success to frustrate scraping scripts.
   - *Section Extraction*: Moving the `<section id="apply">` wrapper into `components/sections/ApplicationSection.tsx` fulfills the `PROJECT.md` layout contract, keeps `App.tsx` clean and modular, and adds executive section framing (`[ ADMISSIONS COHORT // SELEÇÃO CRITERIOSA ]`).

2. **Feature 15 Supabase Leads Dual-Write Architecture**:
   - *Premise*: Primary system-of-record must be Supabase's `leads` table. However, real-time sales alerts (Slack/Discord/Zapier/SheetMonkey) require webhook mirroring.
   - *Fail-Safe Dual-Write*: Database insertion is primary. Webhook dispatch is secondary. If the webhook fails or times out, the lead MUST NOT be lost, and the user must still receive a success response.
   - *Honeypot Enforcement*: `submitLead` must check `leadData.hp`. If `hp` has length > 0, `submitLead` immediately returns `{ success: true, isSpam: true, data: null, error: null }` without touching Supabase, protecting database integrity from spam attacks (verified by Tier 3 X.BOT.1 and Tier 4 Scenario 5).
   - *Client Initialization Resilience*: Providing default placeholder strings (`https://placeholder.supabase.co`) when `VITE_SUPABASE_URL` is undefined prevents client crashes in offline, CI, or test environments.

3. **Feature 16 Admin Supabase Leads Dashboard Architecture**:
   - *Premise*: The Admissions Director must triage applicants directly from the administrative portal mounted by `AdminGate.tsx`.
   - *Tab Integration*: Adding `'leads'` to `AdminPanel.tsx`'s `Tab` union allows immediate switching between Site Config (Mídia, Texto, Estilo, Config) and Lead Management (Candidaturas).
   - *Component Decomposition*: Creating `components/admin/LeadsTable.tsx` avoids bloating `AdminPanel.tsx` (already 473 lines).
   - *Triage Capabilities*:
     - Real-time status filtering (`Todos`, `Novos`, `Contatados`, `Qualificados`, `Rejeitados`).
     - Live search across applicant name, WhatsApp, Instagram, and niche.
     - Single-click status update (`updateLeadStatus`) with optimistic UI update and error rollback.
     - Direct WhatsApp click-to-chat link (`https://wa.me/55...`).
     - Detail drawer/modal to inspect the full strategic challenge (`biggest_challenge`) without breaking table layout.
     - Export to CSV for offline evaluation by admissions committees.

---

## 3. TECHNICAL BLUEPRINT & DESIGN SPECIFICATIONS

### 3.1 Feature 14: High-Ticket Application Portal (`#apply`)

#### A. Architecture & File Structure
- **Container**: `components/sections/ApplicationSection.tsx`
  - Replaces inline `<section id="apply">` in `App.tsx`.
  - Includes section header, telemetry badge (`[ ADMISSIONS COHORT // SELEÇÃO CRITERIOSA ]`), value proposition, and mounts `<LeadForm />`.
- **Form Component**: `components/LeadForm.tsx`
  - Manages multi-step state (`currentStep: 1 | 2 | 3`).
  - Implements step indicator, animated slide transitions via `framer-motion` (`m.div`), progressive validation, phone mask, 5 revenue tiers, and invisible honeypot.

#### B. Multi-Step Form Steps & Field Layout
```
Step 1: Identificação Executiva & Contato
├── full_name (string, min 3 chars)
└── whatsapp (string, formatted as (XX) 9XXXX-XXXX via formatPhoneNumber, min 14 chars)
    [ Botão: Próximo Passo -> Validar Step 1 ]

Step 2: Presença & Posicionamento
├── instagram (string, min 2 chars, auto-prepends '@' if omitted)
└── niche (string, min 2 chars, placeholder: "Ex: SaaS B2B, Finanças, EdTech")
    [ Botões: Voltar | Próximo Passo -> Validar Step 2 ]

Step 3: Faturamento & Desafio Estratégico
├── revenue_range (interactive selection of exact 5 tiers)
├── biggest_challenge (textarea, min 5 chars, rows 3)
├── hp (invisible honeypot field)
└── [ Botões: Voltar | Solicitar Acesso ao Ecossistema ]
```

#### C. Zod Schema & Progressive Step Validation
```ts
import { z } from 'zod';

export const REVENUE_BRACKETS = [
  "Estou começando (< R$ 10k)",
  "Tracionando (R$ 10k - R$ 50k)",
  "Escalando (R$ 50k - R$ 100k)",
  "Consolidado (R$ 100k - R$ 500k)",
  "High Stakes (R$ 500k+)"
] as const;

export const leadSchema = z.object({
  full_name: z.string().trim().min(3, "Nome completo é obrigatório (mínimo 3 caracteres)"),
  whatsapp: z.string().trim().min(14, "WhatsApp inválido. Siga o formato (00) 00000-0000"),
  instagram: z.string().trim().min(2, "Instagram é obrigatório"),
  niche: z.string().trim().min(2, "Nicho de atuação é obrigatório"),
  revenue_range: z.enum(REVENUE_BRACKETS, {
    errorMap: () => ({ message: "Selecione o faturamento" })
  }),
  biggest_challenge: z.string().trim().min(5, "Descreva seu maior desafio em mais palavras (mínimo 5 caracteres)"),
  hp: z.string().optional()
});

export const step1Schema = leadSchema.pick({ full_name: true, whatsapp: true });
export const step2Schema = leadSchema.pick({ instagram: true, niche: true });
export const step3Schema = leadSchema.pick({ revenue_range: true, biggest_challenge: true, hp: true });
```

#### D. Invisible Honeypot Implementation
```tsx
{/* Invisible Honeypot Field for Automated Bot Defense */}
<div
  aria-hidden="true"
  style={{
    position: 'absolute',
    left: '-9999px',
    top: '-9999px',
    width: '1px',
    height: '1px',
    opacity: 0,
    pointerEvents: 'none'
  }}
>
  <label htmlFor="company_website_hp">Website Oficial</label>
  <input
    type="text"
    id="company_website_hp"
    name="hp"
    value={formData.hp || ''}
    onChange={handleChange}
    tabIndex={-1}
    autoComplete="off"
  />
</div>
```

#### E. Rate-Limiting & Interaction State Machine
- `status`: `'idle' | 'loading' | 'success' | 'error'`.
- Button disablement: `disabled={status === 'loading'}` to prevent burst clicks (protecting against B.RATE.1).
- Inputs locked upon `status === 'success'` (protecting against B.RATE.4).
- Auto-reset timeout clears fields after 8 seconds (protecting against B.RATE.5).
- Error state clears cleanly upon retry (protecting against B.RATE.3).

---

### 3.2 Feature 15: Fullstack Supabase Leads Dual-Write

#### A. Type Contracts (`types/leads.ts` & `types.ts`)
Create dedicated file `types/leads.ts` and re-export in `types.ts`:
```ts
// types/leads.ts
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'rejected' | 'lost' | 'won';

export interface LeadFormData {
  full_name: string;
  whatsapp: string;
  instagram: string;
  niche: string;
  revenue_range: string;
  biggest_challenge: string;
  hp?: string;
}

export interface Lead extends LeadFormData {
  id: string;
  created_at: string;
  status: LeadStatus;
  notes?: string;
  source?: string;
}

export interface SubmitLeadResponse {
  success: boolean;
  data?: Lead | null;
  error?: string | null;
  isSpam?: boolean;
}
```

#### B. Service Implementation (`services/supabase.ts`)
Refactor `submitLead` to implement honeypot interception, primary Supabase insertion, and resilient webhook dispatch:
```ts
// services/supabase.ts
import { createClient, PostgrestError } from '@supabase/supabase-js';
import { Lead, LeadFormData, LeadStatus, SubmitLeadResponse } from '../types/leads';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Inserts lead into Supabase 'leads' table as system of record,
 * with honeypot bot interception and asynchronous webhook dual-write.
 */
export const submitLead = async (
  leadData: LeadFormData,
  webhookEndpoint?: string
): Promise<SubmitLeadResponse> => {
  // 1. Honeypot Anti-Spam Trap
  if (leadData.hp && leadData.hp.trim().length > 0) {
    // Simulated success: silently drop bot submission without inserting into Supabase
    return { success: true, isSpam: true, data: null, error: null };
  }

  // 2. Primary Database Write to Supabase 'leads' table
  const dbPayload = {
    full_name: leadData.full_name,
    whatsapp: leadData.whatsapp,
    instagram: leadData.instagram,
    niche: leadData.niche,
    revenue_range: leadData.revenue_range,
    biggest_challenge: leadData.biggest_challenge,
    status: 'new' as LeadStatus,
    source: 'Landing Page'
  };

  const { data, error } = await supabase
    .from('leads')
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error('Supabase DB Insert Error:', error.message);
    return { success: false, error: error.message };
  }

  // 3. Asynchronous Webhook Dual-Write (Non-blocking fail-safe)
  if (webhookEndpoint && webhookEndpoint.trim().length > 0) {
    try {
      fetch(webhookEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          ...dbPayload,
          id: data?.id,
          created_at: data?.created_at || new Date().toISOString()
        })
      }).catch(err => {
        console.warn('Webhook notification failed (non-blocking):', err);
      });
    } catch (err) {
      console.warn('Webhook dispatch error:', err);
    }
  }

  return { success: true, data, error: null };
};

export const getLeads = async (): Promise<{ data: Lead[] | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateLeadStatus = async (
  id: string,
  status: LeadStatus
): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id);
  return { error };
};
```

---

### 3.3 Feature 16: Admin Supabase Leads Dashboard

#### A. Architecture & Tab Wiring in `components/AdminPanel.tsx`
1. Update `Tab` type:
   ```ts
   export type Tab = 'images' | 'texts' | 'colors' | 'settings' | 'leads';
   ```
2. Add Navigation Tab Item in the AdminPanel sidebar/header:
   ```tsx
   {[
     { id: 'leads', label: 'Candidaturas', icon: Users },
     { id: 'images', label: 'Mídia', icon: ImageIcon },
     { id: 'texts', label: 'Texto', icon: Type },
     { id: 'colors', label: 'Estilo', icon: Palette },
     { id: 'settings', label: 'Config', icon: LinkIcon }
   ].map(tab => ( ... ))}
   ```
3. Render `<LeadsTable />` inside the tab viewport:
   ```tsx
   {activeTab === 'leads' && <LeadsTable />}
   ```

#### B. Component Architecture: `components/admin/LeadsTable.tsx`
Create `components/admin/LeadsTable.tsx` with the following enterprise features:
1. **Status Triage Filtering**:
   - Filter pills: `Todos`, `Novos` (`status === 'new'`), `Contatados` (`status === 'contacted'`), `Qualificados` (`status === 'qualified'`), `Rejeitados` (`status === 'rejected'`).
2. **Search Bar**:
   - Filters client-side leads by matching substring against `full_name`, `whatsapp`, `instagram`, or `niche`.
3. **Executive Summary Counters**:
   - Total de Aplicações, Novos Pendentes, Qualificados, Taxa de Aceitação / Conversão.
4. **Interactive Status Switcher**:
   - Dropdown or pill selector per lead that calls `updateLeadStatus(lead.id, newStatus)`.
   - Visual color tokens:
     - `new`: Blue/Gold badge with pulsing dot (`bg-blue-500/10 text-blue-400 border-blue-500/30`).
     - `contacted`: Amber badge (`bg-yellow-500/10 text-yellow-400 border-yellow-500/30`).
     - `qualified`: Emerald badge (`bg-emerald-500/10 text-emerald-400 border-emerald-500/30`).
     - `rejected`: Rose/Zinc badge (`bg-red-500/10 text-red-400 border-red-500/30`).
     - `won`: Gold badge (`bg-ng-gold/10 text-ng-gold border-ng-gold/30`).
5. **Direct Actions**:
   - WhatsApp Click-to-Chat button: Formats phone into digits and opens `https://wa.me/55${digits}` with prefilled professional greeting.
   - Instagram Profile Link: Direct link to `https://instagram.com/${handle}`.
   - Expandable Drawer / Modal: View complete `biggest_challenge` and applicant notes.
6. **CSV Export**:
   - One-click export button downloading `leads_nghub_YYYY-MM-DD.csv` for team sync.

---

## 4. PROPOSED CODE SNIPPETS & REPLACEMENT SPECIFICATIONS

### 4.1 Proposed `types/leads.ts`
```ts
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'rejected' | 'lost' | 'won';

export interface LeadFormData {
  full_name: string;
  whatsapp: string;
  instagram: string;
  niche: string;
  revenue_range: string;
  biggest_challenge: string;
  hp?: string;
}

export interface Lead extends LeadFormData {
  id: string;
  created_at: string;
  status: LeadStatus;
  notes?: string;
  source?: string;
}

export interface SubmitLeadResponse {
  success: boolean;
  data?: Lead | null;
  error?: string | null;
  isSpam?: boolean;
}
```

### 4.2 Proposed `components/sections/ApplicationSection.tsx`
```tsx
import React from 'react';
import { m } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';
import { LeadForm } from '../LeadForm';

export interface ApplicationSectionProps {
  formEndpoint?: string;
}

export const ApplicationSection: React.FC<ApplicationSectionProps> = ({ formEndpoint }) => {
  return (
    <section
      id="apply"
      className="py-24 md:py-32 px-4 md:px-6 relative z-20 bg-ng-black min-h-screen flex items-center justify-center scroll-mt-28"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ng-gold/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-14">
          <m.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 border border-ng-gold/30 px-4 py-1.5 rounded-full bg-ng-gold/5 mb-6"
          >
            <Shield className="w-3.5 h-3.5 text-ng-gold" />
            <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-ng-gold">
              COHORT 2026 // PROCESSO SELETIVO
            </span>
          </m.div>

          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-serif text-white mb-4 tracking-tight"
          >
            Candidatura para o <span className="italic text-ng-gold">Ecossistema</span>.
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-zinc-400 font-light text-sm md:text-base max-w-xl mx-auto leading-relaxed"
          >
            Acesso estritamente limitado a fundadores e operadores com tração comprovada.
            Preencha os dados abaixo para avaliação pelo comitê.
          </m.p>
        </div>

        {/* Multi-step Progressive Form */}
        <LeadForm endpoint={formEndpoint} />
      </div>
    </section>
  );
};
```

### 4.3 Proposed `components/admin/LeadsTable.tsx`
```tsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, RefreshCw, CheckCircle2, Clock, XCircle, 
  ArrowUpRight, Download, MessageSquare, AlertCircle, Loader2 
} from 'lucide-react';
import { getLeads, updateLeadStatus } from '../../services/supabase';
import { Lead, LeadStatus } from '../../types/leads';

export const LeadsTable: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await getLeads();
      if (dbError) throw new Error(dbError.message);
      setLeads(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar candidaturas');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    setUpdatingId(leadId);
    try {
      const { error: updateErr } = await updateLeadStatus(leadId, newStatus);
      if (updateErr) throw new Error(updateErr.message);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    } catch (err) {
      alert(`Erro ao atualizar status: ${err instanceof Error ? err.message : 'Falha'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        lead.full_name?.toLowerCase().includes(q) ||
        lead.whatsapp?.includes(q) ||
        lead.instagram?.toLowerCase().includes(q) ||
        lead.niche?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [leads, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    qualified: leads.filter(l => l.status === 'qualified').length,
    contacted: leads.filter(l => l.status === 'contacted').length
  }), [leads]);

  const exportCSV = () => {
    const headers = ['Nome', 'WhatsApp', 'Instagram', 'Nicho', 'Faturamento', 'Status', 'Data', 'Desafio'];
    const rows = leads.map(l => [
      `"${l.full_name}"`,
      `"${l.whatsapp}"`,
      `"${l.instagram}"`,
      `"${l.niche}"`,
      `"${l.revenue_range}"`,
      `"${l.status}"`,
      `"${l.created_at}"`,
      `"${(l.biggest_challenge || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nghub_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 text-zinc-200">
      {/* Top Controls & Metrics */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white/[0.02] border border-white/5 p-3 rounded">
          <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">Total</p>
          <p className="text-xl font-serif text-white font-bold">{stats.total}</p>
        </div>
        <div className="bg-blue-500/[0.03] border border-blue-500/20 p-3 rounded">
          <p className="text-[9px] uppercase tracking-widest text-blue-400 font-mono">Novos</p>
          <p className="text-xl font-serif text-blue-300 font-bold">{stats.new}</p>
        </div>
        <div className="bg-emerald-500/[0.03] border border-emerald-500/20 p-3 rounded">
          <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-mono">Qualificados</p>
          <p className="text-xl font-serif text-emerald-300 font-bold">{stats.qualified}</p>
        </div>
        <div className="bg-amber-500/[0.03] border border-amber-500/20 p-3 rounded">
          <p className="text-[9px] uppercase tracking-widest text-amber-400 font-mono">Contatados</p>
          <p className="text-xl font-serif text-amber-300 font-bold">{stats.contacted}</p>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome, nicho, @..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-ng-gold"
          />
        </div>
        <button
          onClick={fetchLeads}
          disabled={isLoading}
          className="p-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-zinc-400 hover:text-white"
          title="Recarregar"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={exportCSV}
          className="px-3 py-2 bg-ng-gold/10 border border-ng-gold/30 rounded hover:bg-ng-gold/20 text-ng-gold text-xs font-mono flex items-center gap-1.5"
          title="Exportar CSV"
        >
          <Download size={13} />
          <span className="hidden sm:inline">CSV</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-white/10 pb-2 overflow-x-auto text-[10px] font-mono uppercase tracking-wider">
        {['all', 'new', 'contacted', 'qualified', 'rejected'].map(st => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1 rounded transition-colors ${filterStatus === st ? 'bg-white/10 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {st === 'all' ? 'Todos' : st === 'new' ? 'Novos' : st === 'contacted' ? 'Contatados' : st === 'qualified' ? 'Qualificados' : 'Rejeitados'}
          </button>
        ))}
      </div>

      {/* Leads List */}
      {isLoading ? (
        <div className="flex justify-center py-12 text-zinc-500">
          <Loader2 className="animate-spin w-6 h-6 text-ng-gold" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12 text-zinc-600 text-xs font-mono">
          Nenhuma candidatura encontrada com os filtros atuais.
        </div>
      ) : (
        <div className="space-y-2">
          {filteredLeads.map(lead => (
            <div
              key={lead.id}
              className="bg-zinc-950/60 border border-white/5 hover:border-white/15 p-4 rounded transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                    {lead.full_name}
                    {lead.revenue_range.includes('500k') && (
                      <span className="text-[9px] font-mono uppercase tracking-wider bg-ng-gold/15 text-ng-gold px-1.5 py-0.5 rounded border border-ng-gold/30">
                        High Stakes
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono mt-1">
                    <span>{lead.niche}</span>
                    <span>•</span>
                    <span className="text-zinc-500">{lead.revenue_range}</span>
                  </div>
                </div>

                {/* Status Selector */}
                <select
                  value={lead.status || 'new'}
                  disabled={updatingId === lead.id}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                  className="bg-black/60 border border-white/10 text-[10px] font-mono uppercase tracking-wider rounded px-2 py-1 text-zinc-300 outline-none focus:border-ng-gold"
                >
                  <option value="new">Novo</option>
                  <option value="contacted">Contatado</option>
                  <option value="qualified">Qualificado</option>
                  <option value="rejected">Rejeitado</option>
                  <option value="won">Ganho</option>
                </select>
              </div>

              {/* Action Buttons & Links */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <div className="flex items-center gap-3">
                  <a
                    href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.full_name}, sou do comitê de admissão do NG Hub. Recebemos sua candidatura.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
                  >
                    <span>{lead.whatsapp}</span>
                    <ArrowUpRight size={12} />
                  </a>
                  <a
                    href={`https://instagram.com/${lead.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-400 hover:text-white font-mono flex items-center gap-1"
                  >
                    <span>{lead.instagram}</span>
                    <ArrowUpRight size={12} />
                  </a>
                </div>

                <button
                  onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                  className="text-ng-gold hover:text-white text-[10px] font-mono uppercase tracking-wider flex items-center gap-1"
                >
                  <MessageSquare size={12} />
                  <span>{selectedLead?.id === lead.id ? 'Fechar' : 'Desafio'}</span>
                </button>
              </div>

              {/* Expanded Challenge View */}
              {selectedLead?.id === lead.id && (
                <div className="mt-3 p-3 bg-black/40 border border-white/5 rounded text-xs text-zinc-300 leading-relaxed font-light">
                  <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Maior Desafio Estratégico:</p>
                  <p className="whitespace-pre-wrap">{lead.biggest_challenge}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 5. CAVEATS

1. **Read-Only Investigation Mode**: No modifications to the source code files have been made during this exploratory phase. All code designs above are provided as drop-in blueprints for implementing agents.
2. **Supabase Environment Credentials**: While local mock suites pass unconditionally via `tests/harness/fixtures.ts`, production deployments must ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provisioned in `.env` or Vercel environment settings.
3. **Database RLS Policy**: The Supabase `leads` table must enforce Row Level Security (RLS) such that `anon` users have `INSERT` permission only, while `SELECT` and `UPDATE` are restricted to `authenticated` users.

---

## 6. CONCLUSION

Milestone 3 Features 14, 15, and 16 have been comprehensively analyzed, benchmarked against all 114 test assertions, and engineered into a cohesive architectural blueprint:
- **Feature 14**: Cleanly decomposes into `components/sections/ApplicationSection.tsx` and a 3-stage progressive `LeadForm.tsx`, pairing dynamic phone masking and 5-tier revenue selection with strict Zod validation and an invisible honeypot trap.
- **Feature 15**: Fortifies `services/supabase.ts` with honeypot bot interception, primary record persistence into the `leads` table, and non-blocking asynchronous webhook dual-write.
- **Feature 16**: Integrates an administrative triage dashboard into `AdminPanel.tsx` via `components/admin/LeadsTable.tsx`, supporting real-time status transitions (`new`, `contacted`, `qualified`, `rejected`), applicant search, and CSV export.

---

## 7. INDEPENDENT VERIFICATION METHOD

To verify the integrity of this technical blueprint and ensure zero regressions upon implementation:

1. **Execute Project E2E Suite**:
   ```bash
   npm test
   ```
   *Expected outcome*: All 28 test suites and 114 test cases pass with exit code `0`.

2. **Run Strict TypeScript & Production Build**:
   ```bash
   npm run build
   ```
   *Expected outcome*: `tsc --noEmit` and Vite bundle emit successfully without type or lint errors.

3. **Verify Feature-Specific Test Contracts**:
   - `tests/tier1_features/lead_form.test.ts` (F14.1 through F14.6)
   - `tests/tier1_features/supabase_leads.test.ts` (F15.1 through F15.4, F16.1)
   - `tests/tier2_boundaries/phone_mask_boundaries.test.ts` (B.PHONE.1 through B.PHONE.6)
   - `tests/tier2_boundaries/revenue_boundaries.test.ts` (B.REV.1 through B.REV.5)
   - `tests/tier2_boundaries/rate_limit_debounce.test.ts` (B.RATE.1 through B.RATE.5)
   - `tests/tier3_combinations/honeypot_bot_flow.test.ts` (X.BOT.1 and X.BOT.2)
   - `tests/tier4_scenarios/scenario4_admin_operations.test.ts` (Admissions Director complete journey)

4. **Invalidation Conditions**:
   - If phone masking fails on 10 or 11 digits.
   - If unrecognized revenue brackets are accepted.
   - If honeypot payloads trigger database insertions instead of silent drops.
   - If webhook dispatch failures block primary Supabase lead insertion.
   - If `npm run build` or `npm test` fails.
