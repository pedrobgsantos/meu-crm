"use client";

import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { meetingSummaries } from "../../lib/mockData";

function SummaryCard({ summary }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-slate-800 text-sm">{summary.titulo}</p>
          <p className="text-xs text-slate-400 mt-0.5">{summary.data}</p>
        </div>
      </div>
      <p className="text-sm text-slate-600 leading-relaxed mb-4">{summary.resumo}</p>
      {summary.tarefas.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Tarefas geradas:</p>
          <ul className="space-y-1">
            {summary.tarefas.map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ReunioesPage() {
  const [summary, setSummary] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleAction = (action) => {
    if (!summary.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div>
      <PageHeader
        title="Reuniões"
        subtitle="Cole o resumo de uma reunião e gere ações automaticamente"
      />

      {/* Input area */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <label className="text-xs font-medium text-slate-500 mb-2 block">
          Resumo da reunião
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={6}
          placeholder="Cole aqui o resumo da reunião, transcrição ou anotações..."
          className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 resize-none leading-relaxed"
        />

        {submitted && (
          <p className="text-xs text-green-600 mt-2">
            Processando... (integração com n8n em breve)
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => handleAction("tarefa")}
            disabled={!summary.trim()}
            className="text-sm font-medium bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
          >
            Criar tarefa
          </button>
          <button
            onClick={() => handleAction("pipeline")}
            disabled={!summary.trim()}
            className="text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 border border-slate-200 px-4 py-2 rounded-lg transition-colors"
          >
            Atualizar pipeline
          </button>
          <button
            onClick={() => handleAction("followup")}
            disabled={!summary.trim()}
            className="text-sm font-medium bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 border border-slate-200 px-4 py-2 rounded-lg transition-colors"
          >
            Gerar follow-up
          </button>
        </div>
      </div>

      {/* Past summaries */}
      <div>
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Últimos resumos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {meetingSummaries.map((s) => (
            <SummaryCard key={s.id} summary={s} />
          ))}
        </div>
      </div>
    </div>
  );
}
