export async function POST(request) {
  try {
    const body = await request.json();
    const res = await fetch("https://pedrobgsantos.app.n8n.cloud/webhook/followup-feito", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json(
      { status: "error", message: "Erro ao marcar follow-up como feito" },
      { status: 500 }
    );
  }
}
