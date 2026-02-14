export const onRequest: PagesFunction<{ BACKEND: string; API_SECRET: string }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const cache = caches.default;

  // Кешируем только GET запросы к списку предметов
  const isItemsApi = url.pathname === "/api/items" && request.method === "GET";

  if (isItemsApi) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse; // Возвращаем из кеша CF
  }

  const targetHost = env.BACKEND.replace(/\/$/, '');
  const destination = `${targetHost}${url.pathname}${url.search}`;

  try {
    const newHeaders = new Headers(request.headers);
    newHeaders.set("X-Internal-Secret", env.API_SECRET);

    const proxyRequest = new Request(destination, {
      method: request.method,
      headers: newHeaders,
      body: ["GET", "HEAD"].includes(request.method) ? null : await request.arrayBuffer(),
    });

    let response = await fetch(proxyRequest);

    // Если это список предметов и сервер ответил успешно, сохраняем в кеш на 1 минуту
    if (isItemsApi && response.status === 200) {
      response = new Response(response.body, response);
      response.headers.set("Cache-Control", "s-maxage=60"); // Инструкция для Cloudflare
      context.waitUntil(cache.put(request, response.clone()));
    }

    return response;
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "VPS_OFFLINE", detail: e.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};