"use client";

import { useState, useRef, useEffect } from "react";
import PageHeader from "../../components/PageHeader";

const suggestions = [
  "Me dá um resumo do pipeline",
  "Gerar follow-up",
  "Criar tarefa",
  "O que está urgente?",
  "Próximas reuniões",
];

function Message({ msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2.5 mt-0.5">
          A
        </div>
      )}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
          isUser
            ? "bg-slate-900 text-white rounded-br-sm"
            : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm"
        }`}
      >
        {msg.text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold shrink-0 mr-2.5 mt-0.5">
        A
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function extractReplyText(data) {
  return (
    data?.mensagem ??
    data?.resposta ??
    data?.output ??
    data?.text ??
    "Não consegui processar sua solicitação."
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem("crm_chat_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem("crm_chat_history", JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: trimmed }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: trimmed }),
      });
      const data = await res.json();
      const reply = extractReplyText(data);
      setMessages((prev) => [...prev, { id: Date.now(), role: "assistant", text: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: "assistant", text: "Erro ao conectar com o assistente." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] md:h-[calc(100vh-6rem)]">
      <PageHeader
        title="Chat com o Assistente"
        subtitle="Pergunte, delegue ou peça análises ao seu assistente"
      />

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => sendMessage(s)}
            disabled={loading}
            className="text-xs bg-white border border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed rounded-full px-3 py-1.5 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Messages area */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-y-auto p-5 space-y-4 mb-4">
        {messages.map((msg) => (
          <Message key={msg.id} msg={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-3 bg-white border border-slate-200 rounded-xl p-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
          placeholder="Digite sua mensagem..."
          disabled={loading}
          className="flex-1 text-sm outline-none text-slate-800 placeholder-slate-400 px-2 disabled:opacity-50"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
