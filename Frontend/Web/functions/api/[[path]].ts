export const onRequest: PagesFunction<{ BACKEND: string }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Этот лог ОБЯЗАН появиться в Real-time logs при заходе на /api/...
  console.log(`[Proxy] Request to: ${url.pathname}`);

  const path = url.pathname.replace(/^\/api/, '');
  const destination = `${env.BACKEND}${path}${url.search}`;

  try {
    const response = await fetch(destination, {
      method: request.method,
      headers: {
        "Accept": "application/json",
        "X-Forwarded-For": request.headers.get("CF-Connecting-IP") || "",
      },
      // Безопасная передача тела запроса
      body: ["GET", "HEAD"].includes(request.method) ? null : await request.arrayBuffer(),
    });

    return response;
  } catch (e: any) {
    console.log(`[Proxy] Error: ${e.message}`);
    return new Response(JSON.stringify({ error: "Connection to VPS failed", detail: e.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};