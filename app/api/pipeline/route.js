function normalize(text) {
  return (text || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function parseBrDate(value) {
  if (!value) return null;
  const raw = String(value).trim();
  const parts = raw.split("/");
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  const dt = new Date(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T00:00:00`);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function diffDays(from, to) {
  const ms = 1000 * 60 * 60 * 24;
  return Math.floor((to - from) / ms);
}

function getPrioridade(item) {
  const status = normalize(item.status_norm || item.status);
  const inicio = parseBrDate(item.data_inicio_status);

  if (status === "fechamento") return "urgente";
  if (status === "compliance") return "atencao";
  if (status === "juridico") return "atencao";

  if (inicio) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dias = diffDays(inicio, hoje);
    if (dias >= 10) return "urgente";
    if (dias >= 5) return "atencao";
  }

  return "ok";
}

export async function GET() {
  try {
    const res = await fetch("https://pedrobgsantos.app.n8n.cloud/webhook/pipeline", {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();
    const raw = Array.isArray(data?.response) ? data.response : [];

    const filtered = raw
      .filter((item) => {
        const status = normalize(item.status_norm || item.status);
        return !["fechado", "ganho", "perdido", "finalizado"].includes(status);
      })
      .map((item) => ({
        ...item,
        prioridade: getPrioridade(item),
      }));

    return Response.json({ response: filtered });
  } catch (error) {
    return Response.json(
      { status: "error", message: "Erro ao buscar pipeline" },
      { status: 500 }
    );
  }
}
