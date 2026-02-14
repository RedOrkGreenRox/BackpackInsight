export const onRequest: PagesFunction<{ BACKEND: string; API_SECRET: string }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  // 1. Формируем URL. НЕ отрезаем /api, так как в api.py стоит prefix="/api"
  const targetHost = env.BACKEND.replace(/\/$/, '');
  const destination = `${targetHost}${url.pathname}${url.search}`;
  // 2. Базовая проверка Referer (защита от вызовов с чужих сайтов)
  const referer = request.headers.get("referer");
  if (!referer || !referer.includes("backpackinsight.pages.dev")) {
    return new Response(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const proxyRequest = new Request(destination, {
      method: request.method,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Forwarded-For": request.headers.get("CF-Connecting-IP") || "",
        "X-Internal-Secret": env.API_SECRET
      },
      body: ["GET", "HEAD"].includes(request.method) ? null : await request.arrayBuffer(),
    });
    return await fetch(proxyRequest);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "VPS_OFFLINE", detail: e.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};