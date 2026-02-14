export const onRequest: PagesFunction<{ BACKEND: string }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);

  console.log(`[Proxy] Attempting fetch to: ${env.BACKEND}${url.pathname.replace(/^\/api/, '')}`);

  const path = url.pathname.replace(/^\/api/, '');
  const destination = `${env.BACKEND}${path}${url.search}`;

  try {
    // Используем чистый Request без копирования заголовков
    const response = await fetch(destination, {
      method: request.method,
      headers: {
        "Accept": "application/json",
        "User-Agent": "Cloudflare-Worker-Proxy"
      },
      body: ["GET", "HEAD"].includes(request.method) ? null : await request.arrayBuffer(),
    });

    return response;
  } catch (e: any) {
    return new Response(`Proxy Error: ${e.message}`, { status: 502 });
  }
};