// Backend-owned Cloudflare Pages edge proxy.
// It keeps API_SECRET on Cloudflare's server side and forwards only the binary
// RBackend contract. The browser never receives this secret.
// @ts-ignore
export const onRequest: PagesFunction<{ BACKEND: string; API_SECRET?: string }> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  const cacheableGet = request.method === "GET" && (
    path === "/api/items.fb" || path === "/api/catalog-summary.fb"
  );
  const proxied = cacheableGet ||
    (request.method === "GET" && path === "/api/sitemap") ||
    (request.method === "POST" && path === "/api/profile.fb");

  if (!proxied) {
    return new Response("RBackend endpoint not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  if (cacheableGet) {
    // @ts-ignore
    const cached = await caches.default.match(request);
    if (cached) return cached;
  }

  const targetHost = env.BACKEND.replace(/\/$/, "");
  const destination = `${targetHost}${path}${url.search}`;
  const headers = backendHeaders(request, env.API_SECRET);
  const staticMethod = request.method === "GET" || request.method === "HEAD";

  try {
    const proxyRequest = new Request(destination, {
      method: request.method,
      headers,
      body: staticMethod ? null : await request.arrayBuffer(),
    });

    let response = await fetch(proxyRequest);

    if (cacheableGet && response.status === 200) {
      response = new Response(response.body, response);
      response.headers.set("Cache-Control", "public, s-maxage=300, max-age=3600");
      // @ts-ignore
      context.waitUntil(caches.default.put(request, response.clone()));
    }

    return response;
  } catch (error: any) {
    return new Response(`RBackend offline: ${error?.message || "unknown error"}`, {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
};

function backendHeaders(request: Request, apiSecret?: string): Headers {
  const incoming = request.headers;
  const headers = new Headers();

  const contentType = incoming.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const accept = incoming.get("accept");
  if (accept) headers.set("Accept", accept);

  const acceptLanguage = incoming.get("accept-language");
  if (acceptLanguage) headers.set("Accept-Language", acceptLanguage);

  if (apiSecret && apiSecret.length > 0) {
    headers.set("X-Internal-Secret", apiSecret);
  }

  return headers;
}
