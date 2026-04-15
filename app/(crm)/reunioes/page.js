"use client";

import { useState } from "react";
import PageHeader from "../../components/PageHeader";

const WEBHOOK_URL = "https://pedrobgsantos.app.n8n.cloud/webhook/processar-reuniao";

export default function ReunioesPage() {
  const [notas, setNotas] = useState("");
  const [processando, setProcessando] = useState(false);
  const [preview, setPreview] = useState(null);
  const [erro, setErro] = useState("");
  const [executando, setExecutando] = useState(false);
  const [executado, setExecutado] = useState(false);
  const [parceiro, setParceiro] = useState("");
  const [dataReuniao, setDataReuniao] = useState("");
  const [pontoFocal, setPontoFocal] = useState("");
  const [tarefas, setTarefas] = useState([]);
  const [pipeline, setPipeline] = useState(null);
  const [memoria, setMemoria] = useState([]);

  async function handleProcessar() {
    if (!notas.trim()) return;
    setProcessando(true);
    setErro("");
    setPreview(null);
    setExecutado(false);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notas }),
      });
      const json = await res.json();
      if (json.status !== "ok" || !json.dados) {
        setErro("Não foi possível processar as notas. Tente novamente.");
        return;
      }
      const d = json.dados;
      setParceiro(d.parceiro || "");
      setDataReuniao(d.data_reuniao || "");
      setPontoFocal(d.ponto_focal || "");
      setTarefas((d.tarefas || []).map((t, i) => ({ ...t, id: i, ativo: true })));
      setPipeline(d.pipeline?.acao !== "nenhuma" ? d.pipeline : null);
      setMemoria(d.memoria || []);
      setPreview(true);
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setProcessando(false);
    }
  }

  async function handleConfirmar() {
    setExecutando(true);
    const tarefasAtivas = tarefas.filter(t => t.ativo && t.titulo.trim());
    for (const tarefa of tarefasAtivas) {
      const msg = `criar tarefa para ${tarefa.titulo}${tarefa.prazo ? ` com prazo ${tarefa.prazo}` : " sem prazo"}`;
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: msg }),
      });
    }
    if (pipeline && parceiro) {
      const msg = pipeline.acao === "atualizar"
        ? `atualizar negociação ${parceiro} para ${pipeline.status_novo}${pipeline.resumo ? `. Observação: ${pipeline.resumo}` : ""}`
        : `registrar negociação com parceiro ${parceiro}, produto ${pipeline.produto || "benefícios corporativos"}, status ${pipeline.status_novo || "aguardando proposta"}${pipeline.resumo ? `, resumo: ${pipeline.resumo}` : ""}`;
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: msg }),
      });
    }
    setExecutando(false);
    setExecutado(true);
    setPreview(null);
    setNotas("");
  }

  function handleCancelar() {
    setPreview(null);
    setErro("");
  }

  function toggleTarefa(id) {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, ativo: !t.ativo } : t));
  }

  function editTarefa(id, field, value) {
    setTarefas(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  return (
    <div>
      <PageHeader
        title="Reuniões"
        subtitle="Cole o resumo de uma reunião e gere ações automaticamente"
      />

      {!preview && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
          <label className="text-xs font-medium text-slate-500 mb-2 block">Resumo da reunião</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={7}
            placeholder="Cole aqui o resumo da reunião, transcrição ou anotações..."
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 resize-none leading-relaxed"
          />
          {erro && <p className="text-xs text-red-500 mt-2">{erro}</p>}
          {executado && <p className="text-xs text-green-600 mt-2">✓ Ações executadas com sucesso!</p>}
          <div className="mt-4">
            <button
              onClick={handleProcessar}
              disabled={!notas.trim() || processando}
              className="bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {processando ? "Processando..." : "Processar reunião"}
            </button>
          </div>
        </div>
      )}

      {preview && (
        <div className="space-y-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-slate-900 mb-4">Confirme os dados da reunião</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Parceiro</label>
                <input value={parceiro} onChange={e => setParceiro(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400" placeholder="Nome da empresa" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Data da reunião</label>
                <input value={dataReuniao} onChange={e => setDataReuniao(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400" placeholder="DD/MM/AAAA" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Ponto focal</label>
                <input value={pontoFocal} onChange={e => setPontoFocal(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400" placeholder="Nome do contato" />
              </div>
            </div>
          </div>

          {tarefas.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Tarefas identificadas</h2>
              <div className="space-y-3">
                {tarefas.map(t => (
                  <div key={t.id} className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${t.ativo ? "border-slate-200 bg-slate-50" : "border-slate-100 bg-white opacity-50"}`}>
                    <input type="checkbox" checked={t.ativo} onChange={() => toggleTarefa(t.id)} className="mt-1 shrink-0" />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input value={t.titulo} onChange={e => editTarefa(t.id, "titulo", e.target.value)} disabled={!t.ativo} className="sm:col-span-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-400 disabled:bg-transparent disabled:border-transparent" placeholder="Título da tarefa" />
                      <input value={t.prazo} onChange={e => editTarefa(t.id, "prazo", e.target.value)} disabled={!t.ativo} className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-400 disabled:bg-transparent disabled:border-transparent" placeholder="Prazo DD/MM/AAAA" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pipeline && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Pipeline</h2>
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pipeline.acao === "registrar" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"}`}>
                  {pipeline.acao === "registrar" ? "Novo registro" : "Atualizar status"}
                </span>
                <span className="text-xs text-slate-500">{parceiro}</span>
              </div>
              {pipeline.status_novo && <p className="text-sm text-slate-700">Novo status: <span className="font-medium">{pipeline.status_novo}</span></p>}
              {pipeline.resumo && <p className="text-xs text-slate-500 mt-1">{pipeline.resumo}</p>}
            </div>
          )}

          {memoria.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Pontos para memória</h2>
              <ul className="space-y-1.5">
                {memoria.map((m, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="text-slate-400 mt-0.5">•</span>
                    {m}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-slate-400 mt-3">Estes pontos serão salvos quando a memória de parceiros estiver disponível.</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleConfirmar} disabled={executando} className="bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
              {executando ? "Executando..." : "Confirmar e executar"}
            </button>
            <button onClick={handleCancelar} className="bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-sm font-medium px-5 py-2.5 rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
