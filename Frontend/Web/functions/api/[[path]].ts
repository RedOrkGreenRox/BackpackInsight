export const onRequest: PagesFunction<{ BACKEND: string; API_SECRET: string }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  // 1. Формируем URL. НЕ отрезаем /api, так как в api.py стоит prefix="/api"
  const targetHost = env.BACKEND.replace(/\/$/, '');
  const destination = `${targetHost}${url.pathname}${url.search}`;
  try {
    // 1. Создаем копию всех входящих заголовков
    const newHeaders = new Headers(request.headers);

    // 2. Добавляем/перезаписываем нужные нам
    newHeaders.set("X-Internal-Secret", env.API_SECRET);
    newHeaders.set("X-Forwarded-For", request.headers.get("CF-Connecting-IP") || "");

    // Принудительно ставим JSON, если это API
    newHeaders.set("Accept", "application/json");

    const proxyRequest = new Request(destination, {
      method: request.method,
      headers: newHeaders, // Теперь тут есть If-None-Match от браузера!
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