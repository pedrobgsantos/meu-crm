"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";

const PIPELINE_URL  = "/api/pipeline";
const TAREFAS_URL   = "/api/tarefas";
const DASHBOARD_URL = "/api/dashboard";

const cardColors = {
  red:   { bg: "bg-red-50",   border: "border-red-100",   value: "text-red-600",   dot: "bg-red-500"   },
  amber: { bg: "bg-amber-50", border: "border-amber-100", value: "text-amber-600", dot: "bg-amber-500" },
  green: { bg: "bg-green-50", border: "border-green-100", value: "text-green-600", dot: "bg-green-500" },
  slate: { bg: "bg-slate-50", border: "border-slate-200", value: "text-slate-700", dot: "bg-slate-400" },
};

const pipelineActionLabels = {
  "aguardando proposta": "Cobrar proposta",
  "compliance":          "Acompanhar compliance",
  "minuta com cliente":  "Retomar minuta",
  "juridico":            "Avançar jurídico",
  "fechamento":          "Concluir fechamento",
};

function getPipelineActionLabel(status) {
  return pipelineActionLabels[(status ?? "").toLowerCase().trim()] ?? "Avançar negociação";
}

function getTaskActionLabel(status) {
  return (status ?? "").toLowerCase().trim() === "em andamento" ? "Avançar tarefa" : "Concluir tarefa";
}

const getDias = (item) => item.diasParado ?? item.dias ?? 0;
const byDiasDesc = (a, b) => getDias(b) - getDias(a);

const diasColor = (dias) => {
  if (dias >= 7) return "text-red-600 font-semibold";
  if (dias >= 3) return "text-amber-600 font-medium";
  return "text-slate-600";
};

function extractTasks(json) {
  if (Array.isArray(json?.response)) return json.response;
  if (Array.isArray(json?.tarefas)) return json.tarefas;
  if (Array.isArray(json?.dados?.tarefas)) return json.dados.tarefas;
  return [];
}

function parsePrazo(prazo) {
  if (!prazo) return null;
  // supports dd/mm/yyyy or yyyy-mm-dd
  if (prazo.includes("/")) {
    const [d, m, y] = prazo.split("/");
    return new Date(+y, +m - 1, +d);
  }
  return new Date(prazo);
}

function isOverdue(prazo) {
  const date = parsePrazo(prazo);
  if (!date || isNaN(date)) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
}


function SectionSpinner({ label = "Carregando..." }) {
  return (
    <div className="flex items-center gap-2 py-6 justify-center text-sm text-slate-400">
      <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      {label}
    </div>
  );
}

function SectionError() {
  return <p className="py-6 text-center text-sm text-red-500">Erro ao carregar dados.</p>;
}

function TypeTag({ label, color }) {
  const colors = {
    pipeline: "text-blue-600 bg-blue-50",
    tarefa:   "text-violet-600 bg-violet-50",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${colors[color]}`}>
      {label}
    </span>
  );
}

export default function DashboardPage() {
  const [dados, setDados]           = useState(null);
  const [pipelineRaw, setPipelineRaw] = useState([]);
  const [tarefas, setTarefas]       = useState([]);
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [tarefasLoading, setTarefasLoading]   = useState(true);
  const [pipelineError, setPipelineError]     = useState(false);
  const [cardCounts, setCardCounts] = useState({ urgentes: 0, atencao: 0, ok: 0, total: 0 });


  function processPipeline(response) {
    const normalized = response.map((item) => ({
      ...item,
      status: item.status
        ? item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()
        : item.status,
    }));

    const grouped = normalized.reduce(
      (acc, item) => {
        const prioridade = (item.prioridade || "").toLowerCase().trim();
        if (prioridade === "urgente") acc.urgentes.push(item);
        else if (prioridade === "atencao" || prioridade === "atenção") acc.atencao.push(item);
        else acc.ok.push(item);
        return acc;
      },
      { urgentes: [], atencao: [], ok: [] }
    );

    setPipelineRaw(normalized);
    setDados(grouped);
    setPipelineLoading(false);
  }

  useEffect(() => {
    fetch(DASHBOARD_URL)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((json) => {
        if (json.status === "empty" || !json.resultado) {
          // cache vazio — fallback para o n8n direto
          return fetch(PIPELINE_URL)
            .then((r) => r.json())
            .then((pipelineJson) => {
              const response = Array.isArray(pipelineJson?.response) ? pipelineJson.response : [];
              processPipeline(response);
            });
        }

        const resultado = json.resultado;
        const response = Array.isArray(resultado?.response)
          ? resultado.response
          : Array.isArray(resultado)
          ? resultado
          : [];

        processPipeline(response);
      })
      .catch(() => { setPipelineError(true); setPipelineLoading(false); });
  }, []);

  useEffect(() => {
    fetch(PIPELINE_URL)
      .then(r => r.json())
      .then(json => {
        const raw = Array.isArray(json?.response) ? json.response : [];
        const ativos = raw.filter(i => !["fechado","ganho","perdido"].includes((i.status||"").toLowerCase()));
        const u = ativos.filter(i => (i.prioridade||"").toLowerCase() === "urgente");
        const a = ativos.filter(i => ["atencao","atenção"].includes((i.prioridade||"").toLowerCase()));
        const o = ativos.filter(i => !["urgente","atencao","atenção"].includes((i.prioridade||"").toLowerCase()));
        setCardCounts({ urgentes: u.length, atencao: a.length, ok: o.length, total: ativos.length });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(TAREFAS_URL)
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((json) => { setTarefas(extractTasks(json)); setTarefasLoading(false); })
      .catch(() => { setTarefasLoading(false); }); // graceful: tarefas failure doesn't break page
  }, []);


  const urgentes = dados?.urgentes ?? [];
  const atencao  = dados?.atencao  ?? [];
  const ok       = dados?.ok       ?? [];

  const activeTasks = tarefas.filter((t) => {
    const s = (t.status ?? "").toLowerCase().trim();
    return s === "pendente" || s === "em andamento";
  });

  const overdueTasks  = activeTasks.filter((t) =>  isOverdue(t.prazo)).sort((a, b) => {
    const da = parsePrazo(a.prazo), db = parsePrazo(b.prazo);
    return da - db;
  });
  const upcomingTasks = activeTasks.filter((t) => !isOverdue(t.prazo)).sort((a, b) => {
    const da = parsePrazo(a.prazo) ?? Infinity, db = parsePrazo(b.prazo) ?? Infinity;
    return da - db;
  });

  const norm = (s) => (s || "").toLowerCase().trim();

  const tarefasAtivas = tarefas
    .filter((t) => !["concluido", "concluida", "feito"].includes(norm(t.status_norm || t.status)))
    .slice(0, 3)
    .map((t) => ({ ...t, _type: "tarefa" }));

  const pipelineOrdenado = [...urgentes, ...atencao, ...ok].map(p => ({ ...p, _type: "pipeline" }));

  const agora = [...tarefasAtivas, ...pipelineOrdenado];

  const proximosFollowups = pipelineRaw.slice(0, 5);

  const resumo = pipelineRaw.reduce((acc, item) => {
    const status = item.status || "Sem status";
    acc.total++;
    acc.porStatus[status] = (acc.porStatus[status] || 0) + 1;
    return acc;
  }, { total: 0, porStatus: {} });

  const sectionLoading = pipelineLoading || tarefasLoading;

  const tarefasPendentesCount = activeTasks.length;

  const cards = [
    { label: "Negociações urgentes", value: cardCounts.urgentes,   color: "red"   },
    { label: "Em atenção",           value: cardCounts.atencao,    color: "amber" },
    { label: "Dentro do prazo",      value: cardCounts.ok,         color: "green" },
    { label: "Tarefas pendentes",    value: tarefasPendentesCount, color: "slate" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral das suas negociações e tarefas"
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const c = cardColors[card.color];
          return (
            <div key={card.label} className={`${c.bg} border ${c.border} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${c.dot}`} />
                <p className="text-xs font-medium text-slate-500">{card.label}</p>
              </div>
              {pipelineLoading
                ? <div className="h-9 w-10 bg-slate-200 rounded animate-pulse" />
                : <p className={`text-3xl font-bold ${c.value}`}>{card.value}</p>
              }
            </div>
          );
        })}
      </div>

      {/* O que fazer agora */}
      <div className="bg-white rounded-xl border border-slate-300 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <h2 className="text-sm font-semibold text-slate-900">O que fazer agora</h2>
        </div>

        {!sectionLoading && agora.length > 0 && (
          <p className="text-xs text-slate-400 mb-4">
            {agora.length} ite{agora.length > 1 ? "ns exigem" : "m exige"} sua atenção agora.
          </p>
        )}
        {(sectionLoading || agora.length === 0) && <div className="mb-4" />}

        {sectionLoading && <SectionSpinner label="Carregando dados..." />}

        {!sectionLoading && (
          agora.length === 0
            ? <p className="text-sm text-slate-400 py-2 text-center">Nenhuma ação prioritária no momento.</p>
            : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {agora.map((item, i) => {
                  const isPipeline = item._type === "pipeline" || item.tipo === "pipeline";
                  return (
                    <div
                      key={item.id_followup ?? item.id ?? i}
                      className={`flex flex-col justify-between gap-3 px-4 py-3 rounded-lg bg-slate-50 border transition-shadow ${
                        i === 0 ? "border-slate-300 shadow-sm" : "border-slate-100"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                            {isPipeline ? getPipelineActionLabel(item.status) : getTaskActionLabel(item.status)}
                          </p>
                          <TypeTag label={isPipeline ? "Pipeline" : "Tarefa"} color={isPipeline ? "pipeline" : "tarefa"} />
                        </div>
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {isPipeline ? (item.parceiro ?? "-") : (item.titulo ?? "-")}
                        </p>
                        {isPipeline ? (
                          <p className="text-xs text-slate-400 mt-0.5">{item.status ?? "-"}</p>
                        ) : (
                          <>
                            {item.observacao && <p className="text-xs text-slate-500 mt-0.5 truncate">{item.observacao}</p>}
                            {item.prazo && <p className="text-[11px] text-slate-400 mt-0.5">Prazo: {item.prazo}</p>}
                          </>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge label={isPipeline ? item.prioridade : item.status} />
                        {isPipeline ? (
                          <Link href={`/followups?parceiro=${encodeURIComponent(item.parceiro ?? "")}`} className="text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition-colors">
                            Abrir follow-up
                          </Link>
                        ) : (
                          <Link href="/pauta" className="text-xs font-medium text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition-colors">
                            Abrir pauta
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
        )}
      </div>

      {/* Próximos follow-ups */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <h2 className="text-sm font-semibold text-slate-900">Próximos follow-ups</h2>
        </div>

        {pipelineLoading && <SectionSpinner label="Carregando pipeline..." />}
        {!pipelineLoading && pipelineError && <SectionError />}

        {!pipelineLoading && !pipelineError && (
          proximosFollowups.length === 0
            ? <p className="text-sm text-slate-400 py-4 text-center">Nenhum follow-up pendente no momento.</p>
            : <div className="divide-y divide-slate-100">
                {proximosFollowups.map((item, i) => (
                  <div key={item.id_followup ?? item.id ?? i} className="flex items-center justify-between py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.parceiro ?? "-"}</p>
                      {item.ponto_focal && (
                        <p className="text-xs text-slate-500 truncate">{item.ponto_focal}</p>
                      )}
                      <p className="text-xs text-slate-400">{item.status ?? "-"}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <Link
                        href="/followups"
                        className="text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition-colors whitespace-nowrap"
                      >
                        Abrir follow-up
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
        )}
      </div>

      {/* Resumo rápido do pipeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Resumo rápido do pipeline</h2>

        {pipelineLoading && <SectionSpinner label="Carregando pipeline..." />}
        {!pipelineLoading && pipelineError && <SectionError />}

        {!pipelineLoading && !pipelineError && (
          resumo.total === 0
            ? <p className="text-sm text-slate-400 py-4 text-center">Nenhuma negociação encontrada.</p>
            : <div className="divide-y divide-slate-100">
                {Object.entries(resumo.porStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between py-2">
                    <p className="text-sm text-slate-600 truncate">{status}</p>
                    <span className="text-sm font-semibold text-slate-800 ml-3 shrink-0">{count}</span>
                  </div>
                ))}
              </div>
        )}
      </div>
    </div>
  );
}
