/**
 * Test Fixtures & Data Contracts
 * Authoritative payloads for opaque-box testing across all 4 tiers.
 */

export interface LeadPayload {
  full_name: string;
  whatsapp: string;
  instagram: string;
  niche: string;
  revenue_range: string;
  biggest_challenge: string;
  hp?: string; // Honeypot trap
  status?: 'new' | 'contacted' | 'qualified' | 'lost' | 'won';
}

export const VALID_FOUNDER_APPLICATION: LeadPayload = {
  full_name: "Henrique Silva Alcantara",
  whatsapp: "(11) 98765-4321",
  instagram: "@henrique.builds",
  niche: "Fintech & B2B SaaS",
  revenue_range: "High Stakes (R$ 500k+)",
  biggest_challenge: "Estruturação de governança executiva e acesso a investidores Série A para expansão LatAm."
};

export const VALID_STRATEGIC_PARTNER_APPLICATION: LeadPayload = {
  full_name: "Camila Guimarães Rocha",
  whatsapp: "(21) 99887-6655",
  instagram: "@camilarocha_vc",
  niche: "Venture Capital & Family Office",
  revenue_range: "Consolidado (R$ 100k - R$ 500k)",
  biggest_challenge: "Conexão com fundadores de tecnologia de alta performance para co-investimento e M&A."
};

export const BOT_APPLICATION_WITH_HONEYPOT: LeadPayload = {
  full_name: "Automated Bot Crawler",
  whatsapp: "(11) 99999-9999",
  instagram: "@spam_bot",
  niche: "Crypto Spam",
  revenue_range: "High Stakes (R$ 500k+)",
  biggest_challenge: "Buy followers and automated engagement fast now.",
  hp: "https://spam-bot-trap.com"
};

export const INVALID_APPLICATIONS = {
  empty: {
    full_name: "",
    whatsapp: "",
    instagram: "",
    niche: "",
    revenue_range: "",
    biggest_challenge: ""
  },
  shortName: {
    ...VALID_FOUNDER_APPLICATION,
    full_name: "Jo"
  },
  malformedPhone: {
    ...VALID_FOUNDER_APPLICATION,
    whatsapp: "(11) 9876" // Under 14 chars
  },
  shortInstagram: {
    ...VALID_FOUNDER_APPLICATION,
    instagram: "@"
  },
  shortNiche: {
    ...VALID_FOUNDER_APPLICATION,
    niche: "A"
  },
  missingRevenue: {
    ...VALID_FOUNDER_APPLICATION,
    revenue_range: ""
  },
  shortChallenge: {
    ...VALID_FOUNDER_APPLICATION,
    biggest_challenge: "Nada"
  }
};

export const DEFAULT_AUTHORITY_BRANDS = [
  "XP Investimentos",
  "Stone",
  "iFood",
  "G4 Educação",
  "Vtex"
];

export const REVENUE_BRACKETS = [
  "Estou começando (< R$ 10k)",
  "Tracionando (R$ 10k - R$ 50k)",
  "Escalando (R$ 50k - R$ 100k)",
  "Consolidado (R$ 100k - R$ 500k)",
  "High Stakes (R$ 500k+)"
];

export const DEFAULT_SITE_CONFIG = {
  images: {
    hero: "/NG-141.jpg",
    heroVideo: "",
    quoteParallax: "/NG-141.jpg",
    gallery: [
      "/NG-355.jpg",
      "/NG-392.jpg",
      "/NG-599.jpg",
      "/NG-607.jpg",
      "/NG-863 (1).jpg",
      "/NG-873.jpg",
      "/NG-895 (1).jpg"
    ]
  },
  texts: {
    heroTitle: "Você é a média da mesa em que senta.",
    heroSubtitle: "Sem gurus. Sem atalhos. Uma rede exclusiva para líderes que estão construindo o PIB do futuro. Acesso direto a quem já fez acontecer.",
    ctaButton: "Candidatar-me",
    manifestoTitle: "Eles mentiram para você.",
    proofBar: DEFAULT_AUTHORITY_BRANDS,
    pillars: [
      {
        title: "Networking de Alto Nível",
        description: "Conecte-se com quem está no mesmo jogo que você. Troque ideias com fundadores que já escalaram para 8 e 9 dígitos."
      },
      {
        title: "Acesso a Capital",
        description: "Encurte o caminho entre a sua ideia e os investidores certos. Apresente seus projetos para smart money e fundos VC."
      },
      {
        title: "Mentoria Real",
        description: "Aprenda com os erros e acertos de quem já construiu negócios milionários, sem teorias, apenas field-tested knowledge."
      }
    ]
  },
  colors: {
    primary: "#C5A059"
  },
  integration: {
    formEndpoint: ""
  }
};

export class StatefulMockSupabase {
  public leads: Array<LeadPayload & { id: string; created_at: string; status: string }> = [];
  public insertCalls: any[] = [];
  public currentUser: { id: string; email: string } | null = null;
  public simulateNetworkError: boolean = false;

  from(table: string) {
    if (table !== 'leads') {
      throw new Error(`Unsupported mock table: ${table}`);
    }

    return {
      insert: async (rows: any[]) => {
        if (this.simulateNetworkError) {
          return { data: null, error: new Error('Network error connecting to Supabase') };
        }
        for (const row of rows) {
          const record = {
            ...row,
            id: `lead_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            created_at: new Date().toISOString(),
            status: row.status || 'new'
          };
          this.leads.push(record);
          this.insertCalls.push(record);
        }
        return { data: this.leads, error: null };
      },
      select: (_cols: string = '*') => {
        return {
          order: (_field: string, _opts: { ascending: boolean }) => {
            if (this.simulateNetworkError) {
              return Promise.resolve({ data: null, error: new Error('Query error') });
            }
            const sorted = [...this.leads].sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            return Promise.resolve({ data: sorted, error: null });
          }
        };
      },
      update: (updates: any) => {
        return {
          eq: (field: string, val: any) => {
            if (this.simulateNetworkError) {
              return Promise.resolve({ error: new Error('Update error') });
            }
            let updated = 0;
            for (const lead of this.leads) {
              if ((lead as any)[field] === val) {
                Object.assign(lead, updates);
                updated++;
              }
            }
            return Promise.resolve({ error: null, count: updated });
          }
        };
      }
    };
  }

  auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      if (email === 'admin@nghub.com' && password === 'ValidPassword123!') {
        this.currentUser = { id: 'usr_admin_1', email };
        return { data: { user: this.currentUser, session: { access_token: 'mock-jwt-token' } }, error: null };
      }
      return { data: { user: null, session: null }, error: new Error('Invalid credentials') };
    },
    signOut: async () => {
      this.currentUser = null;
      return { error: null };
    },
    getUser: async () => {
      return { data: { user: this.currentUser }, error: null };
    }
  };

  reset() {
    this.leads = [];
    this.insertCalls = [];
    this.currentUser = null;
    this.simulateNetworkError = false;
  }
}
