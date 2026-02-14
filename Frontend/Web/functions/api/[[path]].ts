export const onRequest: PagesFunction<{ BACKEND: string }> = async (context) => {
  // 1. Проверяем, видит ли функция переменную
  if (!context.env.BACKEND) {
    return new Response("Error: BACKEND variable is missing in Cloudflare Settings", { status: 418 });
  }

  const url = new URL(context.request.url);
  const path = url.pathname.replace(/^\/api/, '');
  const destination = `${context.env.BACKEND}${path}${url.search}`;

  try {
    // 2. Пробуем сделать максимально простой запрос
    const response = await fetch(destination, {
      method: "GET",
      headers: { "Accept": "application/json" }
    });
    return response;
  } catch (e) {
    // 3. Если fetch упал, выводим причину
    return new Response(`Fetch failed: ${e.message} | Destination: ${destination}`, { status: 500 });
  }
};