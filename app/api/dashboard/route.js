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

    return Response.json({
      status: "ok",
      resultado: rows[0].resultado,
      gerado_em: rows[0].gerado_em,
    });
  } catch {
    return Response.json({ status: "error" }, { status: 500 });
  }
}
