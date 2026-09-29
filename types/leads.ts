export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'rejected' | 'lost' | 'won';

export const REVENUE_BRACKETS = [
  "Até R$ 50k / mês",
  "R$ 50k a R$ 100k / mês",
  "R$ 100k a R$ 500k / mês",
  "R$ 500k a R$ 1M / mês",
  "Acima de R$ 1M / mês"
] as const;

export const HEADCOUNT_BRACKETS = [
  "Eu e alguns freelancers",
  "1 a 10 colaboradores",
  "11 a 50 colaboradores",
  "50 a 100 colaboradores",
  "Mais de 100 colaboradores"
] as const;

export const GOAL_BRACKETS = [
  "Networking e Deals (Parcerias)",
  "Levantar Capital (VC/Anjo)",
  "Conselhos Estratégicos (Escala)",
  "M&A (Fusões e Aquisições)"
] as const;

export interface LeadFormData {
  full_name: string;
  whatsapp: string;
  instagram: string;
  company: string;
  niche: string;
  revenue_range: string;
  headcount: string;
  primary_goal: string;
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
