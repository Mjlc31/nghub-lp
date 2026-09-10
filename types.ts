import React from 'react';

// --- FORMULÁRIO DA LANDING PAGE ---
// Campos que o formulário coleta (nomes amigáveis para o frontend)
export interface LeadFormData {
  full_name: string;
  whatsapp: string;
  instagram: string;
  niche: string;
  revenue_range: string;
  biggest_challenge: string;
}

// --- CRM DO OS (NGHUB) ---
// Schema real da tabela `leads` no Supabase
export interface CRMLead {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  sector: string;
  stage: string;
  value: number;
  tag_id: string | null;
  last_contact: string;
  created_at: string;
  revenue_text: string | null;
  headcount: string | null;
  pain_point: string | null;
  instagram: string | null;
  origin: string | null;
  owner_id: string | null;
  notes: string | null;
  pipeline: string;
  product_label: string | null;
  form_answers: Record<string, unknown>;
  source_tags: string[];
}

// Alias para compatibilidade com código existente (AdminPanel, etc.)
export interface Lead {
  id?: string;
  created_at?: string;
  name: string;
  phone: string;
  instagram: string;
  sector: string;
  revenue_text: string | null;
  pain_point: string | null;
  stage?: string;
  origin?: string;
  notes?: string;
  pipeline?: string;
  email?: string | null;
  company?: string | null;
  owner_id?: string | null;
}

export interface PillarProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface StatProps {
  value: string;
  label: string;
}

export interface SiteConfig {
  id?: number;
  images: {
    hero: string;
    heroVideo?: string;
    quoteParallax: string;
    gallery: string[];
  };
  texts: {
    heroTitle: string;
    heroSubtitle: string;
    ctaButton: string;
    manifestoTitle: string;
    proofBar?: string[];
    pillars?: Array<{
      title: string;
      description: string;
    }>;
  };
  colors: {
    primary: string;
  };
  integration: {
    formEndpoint: string;
  };
}
