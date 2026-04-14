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

    // O Decision Engine salva nos buckets agora/hoje/podeEsperar
    // O Dashboard consome um array flat com campo prioridade (urgente/atencao/ok)
    // Fazemos a tradução aqui
    const agora      = Array.isArray(raw?.agora)       ? raw.agora       : [];
    const hoje       = Array.isArray(raw?.hoje)        ? raw.hoje        : [];
    const podeEsperar = Array.isArray(raw?.podeEsperar) ? raw.podeEsperar : [];

    const response = [
      ...agora.map((i)        => ({ ...i, prioridade: "urgente" })),
      ...hoje.map((i)         => ({ ...i, prioridade: "atencao" })),
      ...podeEsperar.map((i)  => ({ ...i, prioridade: "ok"      })),
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
