const URL = "https://rsyvaviwzlhfncufutoa.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzeXZhdml3emxoZm5jdWZ1dG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTg3ODksImV4cCI6MjA5MTYzNDc4OX0.n54iwErxsXPHPVFm09ay2VuPtmXgxp20HLMKXGu1-VQ";

export async function GET() {
  try {
    const res = await fetch(`${URL}/rest/v1/decision_engine_cache?order=gerado_em.desc&limit=1`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      cache: "no-store",
    });
    const rows = await res.json();
    if (!res.ok || !rows?.length) return Response.json({ status: "empty", resultado: null });

    const raw = rows[0].resultado;
    const agora = raw?.agora ?? [];
    const hoje = raw?.hoje ?? [];
    const podeEsperar = raw?.podeEsperar ?? [];

    // Só usa cache se tiver itens de pipeline com status
    const pipelineItems = [...agora, ...hoje, ...podeEsperar].filter(i => i.tipo === "pipeline");
    const hasStatus = pipelineItems.some(i => i.status);
    if (!hasStatus) return Response.json({ status: "empty", resultado: null });

    const norm = (item, prioridade) => ({ ...item, prioridade });

    return Response.json({
      status: "ok",
      resultado: {
        response: [
          ...agora.filter(i => i.tipo === "pipeline").map(i => norm(i, "urgente")),
          ...hoje.filter(i => i.tipo === "pipeline").map(i => norm(i, "atencao")),
          ...podeEsperar.filter(i => i.tipo === "pipeline").map(i => norm(i, "ok")),
        ]
      },
      gerado_em: rows[0].gerado_em,
    });
  } catch {
    return Response.json({ status: "error" }, { status: 500 });
  }
}
