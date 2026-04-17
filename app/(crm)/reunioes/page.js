"use client";

import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";

const WEBHOOK_URL = "https://pedrobgsantos.app.n8n.cloud/webhook/processar-reuniao";
const TAREFAS_CRIAR = "https://pedrobgsantos.app.n8n.cloud/webhook/chat-agente";
const CRIAR_TAREFA_URL = "https://pedrobgsantos.app.n8n.cloud/webhook/criar-tarefa-direta";

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
  const [historico, setHistorico] = useState([]);
  const [dadosProcessados, setDadosProcessados] = useState(null);
  const [filtroP, setFiltroP] = useState("");
  const [filtroData, setFiltroData] = useState("");
  const [expandido, setExpandido] = useState(null);
  const [gravando, setGravando] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  useEffect(() => {
    fetch("/api/reunioes")
      .then(r => r.json())
      .then(json => { if (json.status === "ok") setHistorico(json.reunioes); })
      .catch(() => {});
  }, []);

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
      setDadosProcessados(d);
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
      await fetch(CRIAR_TAREFA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo: tarefa.titulo,
          prazo: tarefa.prazo || "",
          observacao: "",
        }),
      });
    }
    if (pipeline && parceiro) {
      const msg = pipeline.acao === "atualizar"
        ? `atualizar negociação ${parceiro} para ${pipeline.status_novo}${pontoFocal ? `, ponto focal ${pontoFocal}` : ""}${pipeline.resumo ? `. Observação: ${pipeline.resumo}` : ""}`
        : `registrar negociação com parceiro ${parceiro}${pontoFocal ? `, ponto focal ${pontoFocal}` : ""}, produto ${pipeline.produto || "benefícios corporativos"}, status ${pipeline.status_novo || "aguardando proposta"}${pipeline.resumo ? `, resumo: ${pipeline.resumo}` : ""}`;
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: msg, sessionId: "pedro-brigido" }),
      });
    }
    await fetch("/api/reunioes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parceiro,
        ponto_focal: pontoFocal,
        data_reuniao: dataReuniao,
        notas,
        tarefas: tarefas.filter(t => t.ativo),
        pipeline,
        memoria,
        resumo_reuniao: dadosProcessados?.resumo_reuniao || "",
      }),
    });
    setHistorico(prev => [{
      parceiro, ponto_focal: pontoFocal, data_reuniao: dataReuniao,
      notas, tarefas: tarefas.filter(t => t.ativo), pipeline, memoria,
      resumo_reuniao: dadosProcessados?.resumo_reuniao || "",
      criado_em: new Date().toISOString()
    }, ...prev]);
    if (memoria.length > 0 && parceiro) {
      const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      for (const ponto of memoria) {
        await fetch("https://rsyvaviwzlhfncufutoa.supabase.co/rest/v1/parceiro_memoria", {
          method: "POST",
          headers: {
            apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzeXZhdml3emxoZm5jdWZ1dG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTg3ODksImV4cCI6MjA5MTYzNDc4OX0.n54iwErxsXPHPVFm09ay2VuPtmXgxp20HLMKXGu1-VQ",
            Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzeXZhdml3emxoZm5jdWZ1dG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTg3ODksImV4cCI6MjA5MTYzNDc4OX0.n54iwErxsXPHPVFm09ay2VuPtmXgxp20HLMKXGu1-VQ",
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            parceiro: norm(parceiro),
            tipo: "contexto",
            conteudo: ponto,
            origem: "reuniao",
          }),
        });
      }
    }
    setExecutando(false);
    setExecutado(true);
    setPreview(null);
    setNotas("");
  }

  async function handleGravar() {
    if (gravando) {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
      setGravando(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks = [];

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        if (chunks.length === 0) return;
        const blob = new Blob(chunks, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result.split(',')[1];
          try {
            const res = await fetch('/api/transcrever', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64, mimeType }),
            });
            const json = await res.json();
            if (json.status === 'ok' && json.texto) {
              setNotas(prev => prev ? prev + '\n\n' + json.texto : json.texto);
            }
          } catch {}
        };
        reader.readAsDataURL(blob);
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setGravando(true);
    } catch {
      alert('Não foi possível acessar o microfone.');
    }
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
            rows={5}
            placeholder="Cole aqui o resumo da reunião, transcrição ou anotações..."
            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 resize-none leading-relaxed"
          />
          <div className="flex items-center gap-2 mt-3 mb-1">
            <button
              onClick={handleGravar}
              type="button"
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
                gravando
                  ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <svg viewBox="0 0 24 24" fill={gravando ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
              {gravando ? 'Parar gravação' : 'Gravar resumo por voz'}
            </button>
            {gravando && <span className="text-xs text-red-500">Gravando... clique para parar</span>}
          </div>
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
                <input
                  type="date"
                  value={dataReuniao ? (dataReuniao.includes("/") ? dataReuniao.split("/").reverse().join("-") : dataReuniao) : ""}
                  onChange={e => {
                    if (e.target.value) {
                      const [y,m,d] = e.target.value.split("-");
                      setDataReuniao(`${d}/${m}/${y}`);
                    } else {
                      setDataReuniao("");
                    }
                  }}
                  onKeyDown={e => e.stopPropagation()}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400"
                />
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
                      <input
                        type="date"
                        value={t.prazo ? (t.prazo.includes("/") ? t.prazo.split("/").reverse().join("-") : t.prazo) : ""}
                        onChange={e => {
                          if (e.target.value) {
                            const [y,m,d] = e.target.value.split("-");
                            editTarefa(t.id, "prazo", `${d}/${m}/${y}`);
                          } else {
                            editTarefa(t.id, "prazo", "");
                          }
                        }}
                        disabled={!t.ativo}
                        className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-slate-400 disabled:bg-transparent disabled:border-transparent"
                        placeholder="Prazo"
                      />
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

          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={handleConfirmar} disabled={executando} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-700 disabled:opacity-40 text-white text-sm font-medium px-5 py-3 rounded-lg transition-colors">
              {executando ? "Executando..." : "Confirmar e executar"}
            </button>
            <button onClick={handleCancelar} className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 text-sm font-medium px-5 py-3 rounded-lg transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {historico.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900">Últimos resumos</h2>
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <input value={filtroP} onChange={e => setFiltroP(e.target.value)} placeholder="Filtrar por parceiro..." className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400" />
            <input type="date" value={filtroData} onChange={e => setFiltroData(e.target.value)} className="w-full sm:w-auto border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 outline-none focus:border-slate-400" />
            {(filtroP || filtroData) && (
              <button onClick={() => { setFiltroP(""); setFiltroData(""); }} className="text-xs text-slate-400 hover:text-slate-600 px-2 text-left">Limpar</button>
            )}
          </div>

          {/* Lista */}
          <div className="space-y-2">
            {historico
              .filter(r => {
                const matchP = !filtroP || (r.parceiro || "").toLowerCase().includes(filtroP.toLowerCase());
                const matchD = !filtroData || (r.data_reuniao || "").includes(filtroData.split("-").reverse().join("/"));
                return matchP && matchD;
              })
              .map((r, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setExpandido(expandido === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{r.parceiro || "Sem parceiro"}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{r.data_reuniao || r.criado_em?.split("T")[0]} {r.ponto_focal ? `· ${r.ponto_focal}` : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {Array.isArray(r.tarefas) && r.tarefas.length > 0 && (
                        <span className="text-xs text-slate-500">{r.tarefas.length} tarefa{r.tarefas.length > 1 ? "s" : ""}</span>
                      )}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-4 h-4 text-slate-400 transition-transform ${expandido === i ? "rotate-180" : ""}`}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </button>

                  {expandido === i && (
                    <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
                      {r.resumo_reuniao && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-1">Resumo</p>
                          <p className="text-sm text-slate-600 leading-relaxed">{r.resumo_reuniao}</p>
                        </div>
                      )}
                      {Array.isArray(r.tarefas) && r.tarefas.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-2">Tarefas geradas</p>
                          <ul className="space-y-1">
                            {r.tarefas.map((t, j) => (
                              <li key={j} className="flex items-start gap-2 text-xs text-slate-600">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {t.titulo}{t.prazo ? ` — ${t.prazo}` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(r.memoria) && r.memoria.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-500 mb-2">Pontos para memória</p>
                          <ul className="space-y-1">
                            {r.memoria.map((m, j) => (
                              <li key={j} className="flex items-start gap-2 text-xs text-slate-600">
                                <span className="text-slate-400 mt-0.5">•</span>
                                {m}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
