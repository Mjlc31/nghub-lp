import { createClient, PostgrestError } from '@supabase/supabase-js';
import { Lead, LeadFormData, SiteConfig } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export type { Lead, LeadFormData, SiteConfig };

// --- LEADS SERVICE ---

/**
 * Submete um lead do formulário da Landing Page diretamente para a tabela `leads` do CRM.
 * 
 * Mapeamento LP → CRM:
 *   full_name        → name
 *   whatsapp         → phone
 *   instagram        → instagram
 *   niche            → sector
 *   revenue_range    → revenue_text
 *   biggest_challenge → pain_point
 *   (automático)     → stage = "Novo Lead"
 *   (automático)     → origin = "Landing Page NGHUB"
 *   (automático)     → pipeline = "Geral"
 */
export const submitLead = async (
  leadData: LeadFormData & { hp?: string },
  webhookEndpoint?: string
): Promise<{ success: boolean; data: unknown; error: string | null; isSpam?: boolean }> => {
  // 1. Honeypot Anti-Spam Trap
  if (leadData.hp && leadData.hp.trim().length > 0) {
    return { success: true, isSpam: true, data: null, error: null };
  }

  // 2. Mapeamento dos campos do formulário → colunas reais do CRM
  const crmPayload = {
    name: leadData.full_name,
    phone: leadData.whatsapp,
    instagram: leadData.instagram,
    sector: leadData.niche,
    revenue_text: leadData.revenue_range,
    pain_point: leadData.biggest_challenge,
    stage: 'Novo Lead',
    origin: 'Landing Page NGHUB',
    pipeline: 'Geral'
  };

  const { error } = await supabase
    .from('leads')
    .insert([crmPayload]);

  const data = null;

  if (error) {
    console.error('Supabase DB Insert Error:', error.message);
    return { success: false, data: null, error: error.message };
  }

  // 3. Webhook Dual-Write assíncrono (non-blocking)
  const targetWebhook = webhookEndpoint || (import.meta.env.VITE_LEADS_WEBHOOK_URL as string | undefined);
  if (targetWebhook && targetWebhook.trim().length > 0) {
    try {
      const inserted = data as { id?: string; created_at?: string } | null;
      fetch(targetWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          ...crmPayload,
          id: inserted?.id,
          created_at: inserted?.created_at || new Date().toISOString()
        })
      }).catch((err) => {
        console.warn('Webhook notification failed (non-blocking):', err);
      });
    } catch (err) {
      console.warn('Webhook dispatch error:', err);
    }
  }

  return { success: true, data, error: null };
};

// --- LEADS ADMIN (CRM) ---

export const getLeads = async (): Promise<{ data: Lead[] | null; error: PostgrestError | null }> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  return { data: data as Lead[] | null, error };
};

export const updateLeadStage = async (
  id: string,
  stage: string
): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase
    .from('leads')
    .update({ stage })
    .eq('id', id);
  return { error };
};

// Alias para compatibilidade com código existente
export const updateLeadStatus = updateLeadStage;

// --- CONFIG SERVICE ---

export const getSiteConfig = async (): Promise<{ data: SiteConfig | null; error: PostgrestError | null }> => {
  return { data: null, error: null };
};

export const saveSiteConfig = async (_config?: SiteConfig): Promise<{ error: PostgrestError | null }> => {
  return { error: null };
};

// --- AUTH SERVICE ---
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
