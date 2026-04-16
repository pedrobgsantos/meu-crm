export async function POST(request) {
  try {
    const { audio, mimeType } = await request.json();
    const buffer = Buffer.from(audio, 'base64');
    const blob = new Blob([buffer], { type: mimeType || 'audio/webm' });
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: formData,
    });
    if (!res.ok) throw new Error('Whisper error');
    const data = await res.json();
    return Response.json({ status: 'ok', texto: data.text });
  } catch (e) {
    return Response.json({ status: 'erro', mensagem: e.message }, { status: 500 });
  }
}
