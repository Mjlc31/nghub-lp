import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Missing Supabase credentials");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- TYPES ---
export interface Lead {
  id?: string;
  created_at?: string;
  full_name: string;
  whatsapp: string;
  instagram: string;
  niche: string;
  revenue_range: string;
  biggest_challenge: string;
  status: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
  notes?: string;
}

export interface SiteConfig {
  id?: number;
  images: {
    hero: string;
    quoteParallax: string;
    gallery: string[];
  };
  texts: {
    heroTitle: string;
    heroSubtitle: string;
    ctaButton: string;
    manifestoTitle: string;
  };
  colors: {
    primary: string;
  };
  integration: {
    formEndpoint: string;
  };
}

// --- LEADS SERVICE ---

export const submitLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'status'>): Promise<{ data: any; error: any }> => {
  return await supabase
    .from('leads')
    .insert([{ ...leadData, status: 'new' }]);
};

export const getLeads = async (): Promise<{ data: Lead[] | null; error: any }> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
};

export const updateLeadStatus = async (id: string, status: Lead['status']): Promise<{ error: any }> => {
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id);
  return { error };
};

// --- CONFIG SERVICE ---

// Config Service Removed - Using LocalStorage Only
export const getSiteConfig = async (): Promise<{ data: SiteConfig | null; error: any }> => {
  return { data: null, error: null };
};

// Config Service Removed - Using LocalStorage Only
export const saveSiteConfig = async (config: SiteConfig): Promise<{ error: any }> => {
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