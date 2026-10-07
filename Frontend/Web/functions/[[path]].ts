// Cloudflare Pages edge proxy for the Leptos site (Backend/crates/branches).
//
// Turned on by the LEPTOS_SSR=true environment variable. Until then every request
// falls through to the static TS frontend from the Pages build, as before.
// Routes under functions/api/ and functions/item/ are more specific and keep
// handling their paths. Images, fonts and other static files stay on Pages.

interface Env {
  BACKEND: string;
  API_SECRET?: string;
  LEPTOS_SSR?: string;
}

const STATIC_PREFIXES = ["/images/", "/fonts/", "/lang/"];
const STATIC_FILES = new Set(["/manifest.json", "/robots.txt", "/browserconfig.xml"]);

// @ts-ignore
export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  if (env.LEPTOS_SSR !== "true") return context.next();

  const url = new URL(request.url);
  if (isStatic(url.pathname)) return context.next();

  const destination = `${env.BACKEND.replace(/\/$/, "")}${url.pathname}${url.search}`;
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    return await fetch(destination, {
      method: request.method,
      headers: backendHeaders(request, env.API_SECRET),
      body: hasBody ? await request.arrayBuffer() : null,
      redirect: "manual",
    });
  } catch (error: any) {
    return new Response(`Backend offline: ${error?.message || "unknown error"}`, {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
};

function isStatic(path: string): boolean {
  return STATIC_FILES.has(path) || STATIC_PREFIXES.some((prefix) => path.startsWith(prefix));
}

// Forwards the browser's headers (cookies, language, the Islands-Router marker of
// client-side navigation) and adds the secret that only Cloudflare knows.
function backendHeaders(request: Request, apiSecret?: string): Headers {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("x-internal-secret");
  if (apiSecret && apiSecret.length > 0) {
    headers.set("X-Internal-Secret", apiSecret);
  }
  return headers;
}
