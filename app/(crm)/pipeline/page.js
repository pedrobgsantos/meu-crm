"use client";

import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";

const PIPELINE_URL = "/api/pipeline";

const statuses = ["Todos", "Proposta enviada", "Em negociação", "Aguardando retorno", "Contrato em revisão", "Qualificação"];
const priorities = ["Todas", "Alta", "Média", "Baixa"];

function extractPipeline(json) {
  if (Array.isArray(json?.response)) return json.response;
  if (Array.isArray(json?.dados)) return json.dados;
  return [];
}

function SectionSpinner() {
  return (
    <div className="flex items-center gap-2 p-8 justify-center text-sm text-slate-400">
      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      Carregando pipeline...
    </div>
  );
}

export default function PipelinePage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter]     = useState("Todos");
  const [priorityFilter, setPriorityFilter] = useState("Todas");

  useEffect(() => {
    setLoading(true);

    fetch(PIPELINE_URL)
      .then((res) => res.json())
      .then((json) => {
        const raw = extractPipeline(json);

        const filtradas = raw.filter((item) => {
          const status = (item.status_norm || item.status || "").toLowerCase();
          return !["fechado", "ganho", "perdido", "finalizado"].includes(status);
        });

        setItems(filtradas);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = items.filter((n) => {
    const matchSearch   = (n.parceiro ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus   = statusFilter === "Todos"   || n.status === statusFilter;
    const matchPriority = priorityFilter === "Todas" || n.prioridade === priorityFilter;
    return matchSearch && matchStatus && matchPriority;
  });

  return (
    <div>
      <PageHeader
        title="Pipeline"
        subtitle={loading ? "Carregando..." : `${filtered.length} negociações encontradas`}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar parceiro..."
            className="bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 w-52"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
        >
          {priorities.map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <SectionSpinner />
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">Erro ao carregar pipeline.</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Nenhuma negociação encontrada.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Parceiro</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Produto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Ponto focal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Resumo</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((n, i) => (
                <tr
                  key={n.id_followup ?? i}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{n.parceiro ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{n.produto ?? "-"}</td>
                  <td className="px-4 py-3"><Badge label={n.status ?? "-"} /></td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{n.ponto_focal ?? "-"}</td>
                  <td className="px-4 py-3 text-slate-400 hidden lg:table-cell max-w-xs truncate">
                    {n.resumo_negociacao ?? n.observacoes_gerais ?? "-"}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap">
                      Ver detalhe
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
