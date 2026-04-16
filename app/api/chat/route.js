export async function POST(request) {
  try {
    const body = await request.json();
    const { mensagem, sessionId } = body;
    const res = await fetch("https://pedrobgsantos.app.n8n.cloud/webhook/chat-agente", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem, sessionId: sessionId || "pedro-brigido" }),
    });
    const data = await res.json();
    return Response.json(data);
  } catch {
    return Response.json({ status: "error", mensagem: "Erro no chat" }, { status: 500 });
  }
}
