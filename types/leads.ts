export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'rejected' | 'lost' | 'won';

export const REVENUE_BRACKETS = [
  "Estou começando (< R$ 10k)",
  "Tracionando (R$ 10k - R$ 50k)",
  "Escalando (R$ 50k - R$ 100k)",
  "Consolidado (R$ 100k - R$ 500k)",
  "High Stakes (R$ 500k+)"
] as const;

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
  id?: string;
  created_at?: string;
  status?: LeadStatus;
  notes?: string;
  source?: string;
}

export interface SubmitLeadResponse {
  success: boolean;
  data?: unknown;
  error?: string | null;
  isSpam?: boolean;
}
