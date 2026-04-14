export async function GET() {
  try {
    const res = await fetch("https://pedrobgsantos.app.n8n.cloud/webhook/decidir-acoes", {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { status: "error", message: "Erro ao consultar decision engine" },
      { status: 500 }
    );
  }
}
