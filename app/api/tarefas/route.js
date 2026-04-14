function normalize(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export async function GET() {
  try {
    const res = await fetch("https://pedrobgsantos.app.n8n.cloud/webhook/tarefas", {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();
    const raw = Array.isArray(data?.response) ? data.response : [];

    const filtered = raw.filter((item) => {
      const status = normalize(item.status_norm || item.status);
      return !["concluida", "concluido", "feito", "finalizado"].includes(status);
    });

    return Response.json({ response: filtered });
  } catch (error) {
    return Response.json(
      { status: "error", message: "Erro ao buscar tarefas" },
      { status: 500 }
    );
  }
}
