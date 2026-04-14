"use client";

import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";

const WEBHOOK_URL = "/api/pipeline";
const DASHBOARD_URL = "/api/dashboard";

function generateMessage(item) {
  const parceiro = item.parceiro ?? "";
  const pontoFocalCompleto = item.ponto_focal ?? "";
  const primeiroNome = pontoFocalCompleto.trim().split(" ")[0] || "";
  const saudacao = primeiroNome ? `Oi ${primeiroNome}` : "Olá";
  const produto = item.produto ?? "proposta";
  const status = (item.status ?? "").toLowerCase().trim();

  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const mensagens = {
    "aguardando proposta": [
      `${saudacao}, queria saber se conseguiram avançar na elaboração da proposta de ${produto}. Estamos no aguardo para analisar.`,
      `${saudacao}, ficou pendente o envio da proposta de ${produto}. Tem previsão de quando conseguem encaminhar?`,
      `${saudacao}, queria retomar o tema de ${produto} — estamos aguardando a proposta de vocês para darmos continuidade.`
    ],

    "compliance": [
      `${saudacao}, queria entender como está a etapa de compliance para seguirmos com o processo.`,
      `${saudacao}, conseguimos evoluir no compliance ou ainda depende de alguma validação interna?`,
      `${saudacao}, tem algo na etapa de compliance em que eu possa ajudar para destravarmos isso?`
    ],

    "minuta com cliente": [
      `${saudacao}, conseguiu revisar a minuta que enviamos? Podemos ajustar algo para avançar?`,
      `${saudacao}, queria retomar a minuta com você e alinhar os próximos passos.`,
      `${saudacao}, ficou alguma dúvida na minuta ou conseguimos seguir com a evolução disso?`
    ],

    "juridico": [
      `${saudacao}, queria entender como está o andamento no jurídico para seguirmos com esse tema.`,
      `${saudacao}, o jurídico conseguiu avançar na análise ou ainda está em avaliação?`,
      `${saudacao}, conseguimos destravar algo no jurídico para dar sequência?`
    ],

    "fechamento": [
      `${saudacao}, estamos bem próximos de concluir isso. Faz sentido avançarmos hoje?`,
      `${saudacao}, queria alinhar os últimos pontos para fecharmos isso com você.`,
      `${saudacao}, acho que estamos no momento de conclusão. Podemos seguir com o fechamento?`
    ]
  };

  if (mensagens[status]) {
    return random(mensagens[status]);
  }

  return `${saudacao}, queria retomar esse tema com você para alinharmos os próximos passos.`;
}

async function gerarMensagemLLM(item) {
  const res = await fetch("/api/gerar-followup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      parceiro:               item.parceiro,
      ponto_focal:            item.ponto_focal,
      produto:                item.produto,
      status:                 item.status,
      resumo_negociacao:      item.resumo_negociacao,
      observacoes_gerais:     item.observacoes_gerais,
      status_followup:        item.status_followup,
      data_followup_realizado: item.data_followup_realizado,
      ultima_cadencia_feita:  item.ultima_cadencia_feita,
      prioridade:             item.prioridade,
      risco:                  item.risco,
    }),
  });
  const data = await res.json();
  if (data?.status === "ok" && data?.mensagem) return data.mensagem;
  throw new Error("resposta inválida");
}

function FollowUpCard({ item, borderColor, diasColor, onMarcarFeito }) {
  const [message, setMessage] = useState(null);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [marking, setMarking] = useState(false);

  const dias = item.diasParado ?? item.dias ?? null;

  const handleGenerate = async () => {
    if (!message && item.mensagem_pronta) {
      setMessage(item.mensagem_pronta);
      return;
    }
    setGenerating(true);
    try {
      const msg = await gerarMensagemLLM(item);
      setMessage(msg);
    } catch {
      setMessage(generateMessage(item));
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!message) return;
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (done) return null;

  return (
    <div className={`bg-white border rounded-xl p-5 ${borderColor}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-slate-800">{item.parceiro ?? "-"}</p>
          {item.ponto_focal && (
            <p className="text-xs text-slate-400 mt-0.5">{item.ponto_focal}</p>
          )}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge label={item.status ?? "-"} />
            {item.status_followup && <Badge label={item.status_followup} />}
            {dias !== null && (
              <span className={`text-xs ${diasColor}`}>{dias}d parado</span>
            )}
          </div>
        </div>
        <button
          onClick={() => setDone(true)}
          title="Marcar como concluído"
          className="text-slate-300 hover:text-green-500 transition-colors"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </button>
      </div>

      {/* Context */}
      {(item.resumo_negociacao || item.observacoes_gerais) && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2">
          {item.resumo_negociacao ?? item.observacoes_gerais}
        </p>
      )}

      {/* Generated message */}
      {generating && (
        <div className="flex items-center gap-2 py-3 mb-4 text-xs text-slate-400">
          <div className="w-3 h-3 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          Gerando mensagem...
        </div>
      )}
      {!generating && message && (
        <div className="bg-slate-50 rounded-lg px-4 py-3 mb-4">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {!message && (
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="text-xs font-medium bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            {generating ? "Gerando..." : "Gerar follow-up"}
          </button>
        )}
        {message && !generating && (
          <>
            <button
              onClick={handleCopy}
              className="text-xs font-medium bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              {copied ? "Copiado!" : "Copiar"}
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="text-xs font-medium bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              Gerar outra versão
            </button>
          </>
        )}
        {message && generating && (
          <button disabled className="text-xs font-medium bg-slate-900 opacity-50 text-white px-3 py-1.5 rounded-lg">
            Gerando...
          </button>
        )}
        <button
          onClick={async () => {
            setMarking(true);
            await onMarcarFeito(item);
            setMarking(false);
          }}
          disabled={marking}
          className="text-xs font-medium bg-white hover:bg-green-50 disabled:opacity-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg transition-colors"
        >
          {marking ? "Salvando..." : "Marcar como feito"}
        </button>
      </div>
    </div>
  );
}

function Section({ title, items, dot, borderColor, badge, diasColorFn, onMarcarFeito }) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${dot}`} />
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${badge}`}>
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <FollowUpCard
            key={item.id_followup ?? item.id ?? i}
            item={item}
            borderColor={borderColor}
            diasColor={diasColorFn(item.diasParado ?? item.dias ?? 0)}
            onMarcarFeito={onMarcarFeito}
          />
        ))}
      </div>
    </section>
  );
}

export default function FollowUpsPage() {
  const [dados, setDados]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    fetch(DASHBOARD_URL)
      .then(r => r.json())
      .then(json => {
        if (json.status === "empty" || !json.resultado) {
          return fetch(WEBHOOK_URL)
            .then(r => r.json())
            .then(json => {
              const items = Array.isArray(json?.response) ? json.response : [];
              setDados({
                urgentes: items.filter(i => (i.prioridade||"").toLowerCase() === "urgente"),
                atencao:  items.filter(i => ["atencao","atenção"].includes((i.prioridade||"").toLowerCase())),
                ok:       items.filter(i => !["urgente","atencao","atenção"].includes((i.prioridade||"").toLowerCase())),
              });
              setLoading(false);
            });
        }

        const response = json.resultado?.response ?? [];
        const followups = response.filter(i => i.tipo === "pipeline" && i.action_type === "followup");
        const resto = response.filter(i => i.tipo === "pipeline" && i.action_type !== "followup");
        const todos = [...followups, ...resto];

        setDados({
          urgentes: todos.filter(i => i.prioridade === "urgente"),
          atencao:  todos.filter(i => i.prioridade === "atencao"),
          ok:       todos.filter(i => i.prioridade === "ok"),
        });
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  async function marcarFollowupFeito(item) {
    const hoje = new Date().toISOString().split("T")[0];
    try {
      await fetch("/api/followup-feito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_followup:             item.id_followup,
          status_followup:         "feito",
          data_followup_realizado: hoje,
        }),
      });
      setDados((prev) => prev ? {
        urgentes: prev.urgentes.filter((i) => i.id_followup !== item.id_followup),
        atencao:  prev.atencao.filter((i)  => i.id_followup !== item.id_followup),
        ok:       prev.ok.filter((i)       => i.id_followup !== item.id_followup),
      } : prev);
    } catch (err) {
      console.error("Erro ao marcar follow-up como feito", err);
    }
  }

  const diasColorFn = (dias) => {
    if (dias >= 7) return "text-red-600 font-semibold";
    if (dias >= 3) return "text-amber-600";
    return "text-slate-500";
  };

  const urgentes = dados?.urgentes ?? [];
  const atencao  = dados?.atencao  ?? [];

  return (
    <div>
      <PageHeader
        title="Follow-ups"
        subtitle="Acompanhe e envie mensagens para negociações paradas"
      />

      {loading && (
        <div className="flex items-center gap-2 py-12 justify-center text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          Carregando pipeline...
        </div>
      )}

      {error && (
        <div className="py-12 text-center text-sm text-red-500">
          Erro ao carregar pipeline.
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          <Section
            title="Urgentes"
            items={urgentes}
            dot="bg-red-500"
            borderColor="border-red-100"
            badge="text-red-600 bg-red-50 border-red-100"
            diasColorFn={diasColorFn}
            onMarcarFeito={marcarFollowupFeito}
          />
          <Section
            title="Em atenção"
            items={atencao}
            dot="bg-amber-500"
            borderColor="border-amber-100"
            badge="text-amber-600 bg-amber-50 border-amber-100"
            diasColorFn={diasColorFn}
            onMarcarFeito={marcarFollowupFeito}
          />
          {urgentes.length === 0 && atencao.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-12">
              Nenhum follow-up pendente no momento.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
