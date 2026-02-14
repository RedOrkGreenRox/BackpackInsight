export const onRequest: PagesFunction<{ BACKEND: string }> = async (context) => {
  const { request, env } = context;

  // 1. Проверка наличия переменной
  if (!env.BACKEND) {
    return new Response("Error: BACKEND variable is missing", { status: 418 });
  }

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, '');
  // Убеждаемся, что нет двойного слеша между адресом и путем
  const targetHost = env.BACKEND.endsWith('/') ? env.BACKEND.slice(0, -1) : env.BACKEND;
  const destination = `${targetHost}${path}${url.search}`;

  // 2. Создаем полностью новый запрос
  // Мы НЕ копируем оригинальный request, чтобы избежать передачи служебных заголовков Cloudflare
  const proxyRequest = new Request(destination, {
    method: request.method,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      // Помогаем бэкенду понять реальный IP пользователя
      "X-Forwarded-For": request.headers.get("CF-Connecting-IP") || "",
    },
    // Тело передаем только для методов с данными
    body: ["GET", "HEAD"].includes(request.method) ? null : await request.blob(),
    redirect: "follow",
  });

  try {
    const response = await fetch(proxyRequest);

    // 3. Клонируем ответ, чтобы добавить CORS заголовки (на случай проблем с api.py)
    const newResponse = new Response(response.body, response);
    newResponse.headers.set("Access-Control-Allow-Origin", "*");
    newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    return newResponse;
  } catch (e: any) {
    // 4. Если мы здесь, значит Cloudflare разрешил запрос, но не смог его выполнить
    return new Response(
      JSON.stringify({
        error: "Proxy Connection Failed",
        message: e.message,
        destination: destination
      }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};