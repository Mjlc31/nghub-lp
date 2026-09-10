import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, RefreshCw, 
  ArrowUpRight, Download, MessageSquare, AlertCircle, Loader2 
} from 'lucide-react';
import { getLeads, updateLeadStage } from '../../services/supabase';
import { Lead } from '../../types';

// Stages usados no CRM do OS
type CRMStage = 'Novo Lead' | 'Rascunho Em Andamento' | 'Venda Fechada' | 'Churn';

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
    let ignore = false;
    getLeads()
      .then(({ data, error: dbError }) => {
        if (ignore) return;
        if (dbError) throw new Error(dbError.message);
        setLeads(data || []);
      })
      .catch((err) => {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Erro ao buscar candidaturas');
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoading(false);
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleStageChange = async (leadId: string, newStage: CRMStage) => {
    setUpdatingId(leadId);
    try {
      const { error: updateErr } = await updateLeadStage(leadId, newStage);
      if (updateErr) throw new Error(updateErr.message);
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
    } catch (err) {
      alert(`Erro ao atualizar stage: ${err instanceof Error ? err.message : 'Falha'}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const matchesStatus = filterStatus === 'all' || lead.stage === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !q ||
        lead.name?.toLowerCase().includes(q) ||
        lead.phone?.includes(q) ||
        lead.instagram?.toLowerCase().includes(q) ||
        lead.sector?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [leads, filterStatus, searchQuery]);

  const stats = useMemo(() => ({
    total: leads.length,
    novo: leads.filter(l => l.stage === 'Novo Lead').length,
    vendaFechada: leads.filter(l => l.stage === 'Venda Fechada').length,
    emAndamento: leads.filter(l => l.stage === 'Rascunho Em Andamento').length
  }), [leads]);

  const exportCSV = () => {
    const headers = ['Nome', 'Telefone', 'Instagram', 'Setor', 'Faturamento', 'Stage', 'Data', 'Desafio', 'Origem'];
    const rows = leads.map(l => [
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.instagram || ''}"`,
      `"${l.sector}"`,
      `"${l.revenue_text || ''}"`,
      `"${l.stage || ''}"`,
      `"${l.created_at || ''}"`,
      `"${(l.pain_point || '').replace(/"/g, '""')}"`,
      `"${l.origin || ''}"`
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
        <div className="bg-white/[0.02] border border-white/5 p-3 rounded">
          <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono">Total</p>
          <p className="text-xl font-serif text-white font-bold">{stats.total}</p>
        </div>
        <div className="bg-blue-500/[0.03] border border-blue-500/20 p-3 rounded">
          <p className="text-[9px] uppercase tracking-widest text-blue-400 font-mono">Novos</p>
          <p className="text-xl font-serif text-blue-300 font-bold">{stats.novo}</p>
        </div>
        <div className="bg-emerald-500/[0.03] border border-emerald-500/20 p-3 rounded">
          <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-mono">Vendas Fechadas</p>
          <p className="text-xl font-serif text-emerald-300 font-bold">{stats.vendaFechada}</p>
        </div>
        <div className="bg-amber-500/[0.03] border border-amber-500/20 p-3 rounded">
          <p className="text-[9px] uppercase tracking-widest text-amber-400 font-mono">Em Andamento</p>
          <p className="text-xl font-serif text-amber-300 font-bold">{stats.emAndamento}</p>
        </div>
      </div>

      {/* Search & Action Bar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nome, setor, @..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 outline-none focus:border-ng-gold"
          />
        </div>
        <button
          type="button"
          onClick={fetchLeads}
          disabled={isLoading}
          className="p-2 bg-white/5 border border-white/10 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          title="Recarregar"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button
          type="button"
          onClick={exportCSV}
          className="px-3 py-2 bg-ng-gold/10 border border-ng-gold/30 rounded hover:bg-ng-gold/20 text-ng-gold text-xs font-mono flex items-center gap-1.5 transition-colors"
          title="Exportar CSV"
        >
          <Download size={13} />
          <span className="hidden sm:inline">CSV</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-white/10 pb-2 overflow-x-auto text-[10px] font-mono uppercase tracking-wider">
        {['all', 'Novo Lead', 'Rascunho Em Andamento', 'Venda Fechada', 'Churn'].map(st => (
          <button
            key={st}
            type="button"
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1 rounded transition-colors whitespace-nowrap ${filterStatus === st ? 'bg-white/10 text-white font-bold' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {st === 'all' ? 'Todos' : st}
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
        <div className="space-y-3">
          {filteredLeads.map(lead => (
            <div
              key={lead.id}
              className="bg-zinc-950/60 border border-white/5 hover:border-white/15 p-4 rounded transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-serif font-bold text-white flex items-center gap-2">
                    {lead.name}
                    {lead.revenue_text?.includes('500k') && (
                      <span className="text-[9px] font-mono uppercase tracking-wider bg-ng-gold/15 text-ng-gold px-1.5 py-0.5 rounded border border-ng-gold/30">
                        High Stakes
                      </span>
                    )}
                    {lead.origin && (
                      <span className="text-[9px] font-mono uppercase tracking-wider bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20">
                        {lead.origin}
                      </span>
                    )}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono mt-1">
                    <span>{lead.sector}</span>
                    <span>•</span>
                    <span className="text-zinc-500">{lead.revenue_text || '—'}</span>
                  </div>
                </div>

                {/* Stage Selector */}
                <select
                  value={lead.stage || 'Novo Lead'}
                  disabled={updatingId === lead.id}
                  onChange={(e) => lead.id && handleStageChange(lead.id, e.target.value as CRMStage)}
                  className="bg-black/60 border border-white/10 text-[10px] font-mono uppercase tracking-wider rounded px-2 py-1 text-zinc-300 outline-none focus:border-ng-gold"
                >
                  <option value="Novo Lead">Novo Lead</option>
                  <option value="Rascunho Em Andamento">Em Andamento</option>
                  <option value="Venda Fechada">Venda Fechada</option>
                  <option value="Churn">Churn</option>
                </select>
              </div>

              {/* Action Buttons & Links */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <div className="flex items-center gap-3">
                  <a
                    href={`https://wa.me/55${(lead.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${lead.name}, sou do comitê de admissão do NG Hub. Recebemos sua candidatura.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
                  >
                    <span>{lead.phone}</span>
                    <ArrowUpRight size={12} />
                  </a>
                  {lead.instagram && (
                    <a
                      href={`https://instagram.com/${lead.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-400 hover:text-white font-mono flex items-center gap-1"
                    >
                      <span>{lead.instagram}</span>
                      <ArrowUpRight size={12} />
                    </a>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                  className="text-ng-gold hover:text-white text-[10px] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors"
                >
                  <MessageSquare size={12} />
                  <span>{selectedLead?.id === lead.id ? 'Fechar' : 'Desafio'}</span>
                </button>
              </div>

              {/* Expanded Challenge View */}
              {selectedLead?.id === lead.id && (
                <div className="mt-3 p-3 bg-black/40 border border-white/5 rounded text-xs text-zinc-300 leading-relaxed font-light">
                  <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono mb-1">Maior Desafio Estratégico:</p>
                  <p className="whitespace-pre-wrap">{lead.pain_point || '—'}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
