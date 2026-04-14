"use client";

import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";

const WEBHOOK_URL = "/api/tarefas";
const WEBHOOK_CRIAR = "https://pedrobgsantos.app.n8n.cloud/webhook/chat-agente";

function extractTasks(json) {
  if (Array.isArray(json?.response)) return json.response;
  if (Array.isArray(json?.tarefas)) return json.tarefas;
  if (Array.isArray(json?.dados?.tarefas)) return json.dados.tarefas;
  return [];
}

function formatDateToDisplay(isoDate) {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export default function PautaPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({ titulo: "", prazo: "", observacao: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetch(WEBHOOK_URL)
      .then((res) => res.json())
      .then((json) => {
        const raw = extractTasks(json);
        const filtradas = raw.filter((t) => {
          const status = (t.status_norm || t.status || "").toLowerCase();
          return status !== "concluida";
        });
        setTasks(filtradas);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const filtered = tasks.filter((t) =>
    t.titulo.toLowerCase().includes(search.toLowerCase())
  );

  async function concluirTarefa(id) {
    try {
      await fetch("https://pedrobgsantos.app.n8n.cloud/webhook/tarefas-concluir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Erro ao concluir tarefa", error);
    }
  }

  async function handleAdd() {
    if (!newTask.titulo.trim()) return;

    setSaving(true);
    setSaveError("");

    const prazoFormatado = newTask.prazo ? formatDateToDisplay(newTask.prazo) : "";

    try {
      const res = await fetch(WEBHOOK_CRIAR, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatInput: `criar tarefa para ${newTask.titulo}${prazoFormatado ? ` com prazo ${prazoFormatado}` : " sem prazo"}${newTask.observacao ? `. Observação: ${newTask.observacao}` : ""}`,
          sessionId: "pauta-modal"
        }),
      });

      if (!res.ok) throw new Error("Erro ao criar tarefa");

      // Adiciona localmente para feedback imediato
      setTasks((prev) => [
        ...prev,
        {
          id: Date.now(),
          titulo: newTask.titulo,
          prazo: prazoFormatado,
          observacao: newTask.observacao,
          status: "pendente",
        },
      ]);

      setNewTask({ titulo: "", prazo: "", observacao: "" });
      setShowModal(false);
    } catch (err) {
      setSaveError("Erro ao criar tarefa. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader title="Pauta" subtitle="Gerencie suas tarefas e compromissos" />

      {/* Action bar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
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
            placeholder="Buscar tarefa..."
            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400"
          />
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-slate-900 hover:bg-slate-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          + Nova tarefa
        </button>
      </div>

      {/* Task list */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center gap-2 p-8 justify-center text-sm text-slate-400">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            Carregando tarefas...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-sm text-red-500">
            Erro ao carregar tarefas.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">
            Nenhuma tarefa encontrada.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tarefa</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Prazo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Observação</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr
                  key={task.id}
                  className={`border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors ${
                    task.status === "Concluída" ? "opacity-60" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <span className={`font-medium text-slate-800 ${task.status === "Concluída" ? "line-through" : ""}`}>
                      {task.titulo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{task.prazo}</td>
                  <td className="px-4 py-3"><Badge label={task.status} /></td>
                  <td className="px-4 py-3 text-slate-400 hidden lg:table-cell">{task.observacao || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      {task.status !== "Concluída" && (
                        <button
                          onClick={() => concluirTarefa(task.id)}
                          className="text-xs text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-md transition-colors"
                        >
                          Concluir
                        </button>
                      )}
                      <button className="text-xs text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md transition-colors">
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Nova tarefa</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Título</label>
                <input
                  type="text"
                  value={newTask.titulo}
                  onChange={(e) => setNewTask({ ...newTask, titulo: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
                  placeholder="Descreva a tarefa..."
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Prazo</label>
                <input
                  type="date"
                  value={newTask.prazo}
                  onChange={(e) => setNewTask({ ...newTask, prazo: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Observação</label>
                <input
                  type="text"
                  value={newTask.observacao}
                  onChange={(e) => setNewTask({ ...newTask, observacao: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-slate-400"
                  placeholder="Opcional..."
                />
              </div>
              {saveError && (
                <p className="text-xs text-red-500">{saveError}</p>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setShowModal(false); setSaveError(""); }}
                className="flex-1 border border-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdd}
                disabled={saving}
                className="flex-1 bg-slate-900 text-white text-sm font-medium py-2 rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {saving ? "Criando..." : "Criar tarefa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
