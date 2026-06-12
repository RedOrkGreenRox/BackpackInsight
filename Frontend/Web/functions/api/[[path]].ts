// @ts-ignore
export const onRequest: PagesFunction<{ BACKEND: string; API_SECRET: string }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  // @ts-ignore
  const cache = caches.default;

  // Кешируем только GET запросы к списку предметов
  const isItemsApi = url.pathname === "/api/items" && request.method === "GET";

  if (isItemsApi) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) return cachedResponse;
  }

  const targetHost = env.BACKEND.replace(/\/$/, '');
  const destination = `${targetHost}${url.pathname}${url.search}`;

  try {
    const newHeaders = new Headers(request.headers);
    newHeaders.set("X-Internal-Secret", env.API_SECRET);
    newHeaders.delete("if-range"); // Очистка для стабильного кеширования


    // Безопасная проверка метода без .includes для старых таргетов
    const isStaticMethod = request.method === "GET" || request.method === "HEAD";

    const proxyRequest = new Request(destination, {
      method: request.method,
      headers: newHeaders,
      body: isStaticMethod ? null : await request.arrayBuffer(),
    });

    let response = await fetch(proxyRequest);

    if (isItemsApi && response.status === 200) {
      // Создаем новую оболочку ответа для изменения заголовков кеша
      response = new Response(response.body, response);
      // s-maxage заставляет Cloudflare кешировать файл на Edge-узле
      response.headers.set("Cache-Control", "public, s-maxage=60, max-age=3600");

      // Фоновое сохранение в кеш Cloudflare
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