const SUPABASE_URL = "https://rsyvaviwzlhfncufutoa.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzeXZhdml3emxoZm5jdWZ1dG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTg3ODksImV4cCI6MjA5MTYzNDc4OX0.n54iwErxsXPHPVFm09ay2VuPtmXgxp20HLMKXGu1-VQ";

export async function GET() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/decision_engine_cache?order=gerado_em.desc&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error("Supabase error");

    const rows = await res.json();
    if (!rows || rows.length === 0) {
      return Response.json({ status: "empty", resultado: null });
    }

    const raw = rows[0].resultado;

    const agora       = Array.isArray(raw?.agora)       ? raw.agora       : [];
    const hoje        = Array.isArray(raw?.hoje)        ? raw.hoje        : [];
    const podeEsperar = Array.isArray(raw?.podeEsperar) ? raw.podeEsperar : [];

    function normalizeItem(item, prioridade) {
      const isPipeline = item.tipo === "pipeline";

      // Para pipeline: status vem do acao_recomendada não existe no cache
      // Usa o motivo[0] como fallback descritivo, ou deixa string vazia
      const status = item.status
        || (isPipeline ? (item.motivo?.[0] || "") : (item.motivo?.[0] || ""));

      return {
        ...item,
        prioridade,
        status,
        diasParado: item.diasParado ?? 0,
      };
    }

    const response = [
      ...agora.map((i)       => normalizeItem(i, "urgente")),
      ...hoje.map((i)        => normalizeItem(i, "atencao")),
      ...podeEsperar.map((i) => normalizeItem(i, "ok")),
    ];

    return Response.json({
      status: "ok",
      resultado: { response },
      gerado_em: rows[0].gerado_em,
    });

  } catch {
    return Response.json({ status: "error" }, { status: 500 });
  }
}
