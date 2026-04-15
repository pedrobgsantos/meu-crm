const URL = "https://rsyvaviwzlhfncufutoa.supabase.co";
const KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzeXZhdml3emxoZm5jdWZ1dG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNTg3ODksImV4cCI6MjA5MTYzNDc4OX0.n54iwErxsXPHPVFm09ay2VuPtmXgxp20HLMKXGu1-VQ";

export async function GET() {
  try {
    const res = await fetch(`${URL}/rest/v1/reunioes?order=criado_em.desc&limit=10`, {
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
      cache: "no-store",
    });
    const data = await res.json();
    return Response.json({ status: "ok", reunioes: data });
  } catch {
    return Response.json({ status: "error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch(`${URL}/rest/v1/reunioes`, {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        parceiro:     body.parceiro || "",
        ponto_focal:  body.ponto_focal || "",
        data_reuniao: body.data_reuniao || "",
        notas:        body.notas || "",
        tarefas:      body.tarefas || [],
        pipeline:     body.pipeline || null,
        memoria:      body.memoria || [],
      }),
    });
    if (!res.ok) throw new Error();
    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "error" }, { status: 500 });
  }
}
