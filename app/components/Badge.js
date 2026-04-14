const variants = {
  Alta: "bg-red-50 text-red-700 ring-1 ring-red-200",
  Urgente: "bg-red-50 text-red-700 ring-1 ring-red-200",
  Média: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Atenção: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Baixa: "bg-green-50 text-green-700 ring-1 ring-green-200",
  Pendente: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "Em andamento": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Concluída: "bg-green-50 text-green-700 ring-1 ring-green-200",
  Atrasada: "bg-red-50 text-red-700 ring-1 ring-red-200",
  "Proposta enviada": "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  "Em negociação": "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  "Aguardando retorno": "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  "Contrato em revisão": "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  Qualificação: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

export default function Badge({ label }) {
  const cls = variants[label] ?? "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
