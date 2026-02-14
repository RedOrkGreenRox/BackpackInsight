export const onRequest: PagesFunction<{ BACKEND: string }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // Убираем /api из пути
  const path = url.pathname.replace(/^\/api/, '');
  const destination = `${env.BACKEND}${path}${url.search}`;

  // Создаем НОВЫЙ запрос. НЕ копируем request целиком!
  const proxyRequest = new Request(destination, {
    method: request.method,
    // Передаем только самое важное, без заголовка Host
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-Real-IP": request.headers.get("CF-Connecting-IP") || ""
    },
    // Тело только для методов с данными
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : null,
    redirect: "follow"
  });

  try {
    const response = await fetch(proxyRequest);

    // Если бэкенд всё же ответил ошибкой, мы это увидим
    return response;
  } catch (err) {
    // Если Cloudflare не смог даже "выстрелить" запросом
    return new Response(JSON.stringify({ error: "Connection Failed", message: err.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};