export const onRequest: PagesFunction<{ BACKEND: string }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  // 1. Формируем чистый путь (убираем /api)
  const backendPath = url.pathname.replace(/^\/api/, '');
  const destination = `${env.BACKEND}${backendPath}${url.search}`;

  // 2. Создаем абсолютно новые заголовки (не копируем старые!)
  const cleanHeaders = new Headers();
  cleanHeaders.set("Accept", "application/json");
  cleanHeaders.set("Content-Type", "application/json");

  // Передаем IP пользователя бэкенду (опционально)
  const clientIP = request.headers.get("CF-Connecting-IP");
  if (clientIP) {
    cleanHeaders.set("X-Forwarded-For", clientIP);
  }

  // 3. Выполняем запрос с минимальным набором данных
  try {
    const response = await fetch(destination, {
      method: request.method,
      headers: cleanHeaders,
      // Тело передаем только если это не GET/HEAD
      body: ["GET", "HEAD"].includes(request.method) ? null : request.body,
      redirect: "follow",
    });

    // Возвращаем ответ как есть
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: "Backend Unreachable", details: error.message }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
};