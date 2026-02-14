import { serve, file } from "bun";
import { resolve } from "path";

const PORT = 5080;
const BACKEND_URL = process.env.BACKEND_API_URL || "http://backpack_insight_backend:8000";
const DIST_DIR = "/app/dist_build";
const STATIC_DIR = "/app/Frontend/Web/static";

// Заголовки для долгосрочного кэширования (1 год)
const CACHE_HEADERS = {
    "Cache-Control": "public, max-age=31536000, immutable"
};

// Заголовки для отключения кэширования (HTML)
const NO_CACHE_HEADERS = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Content-Type": "text/html"
};

serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = decodeURIComponent(url.pathname);

    // --- 1. API Proxy ---
    if (url.pathname.startsWith("/api")) {
      try {
        const targetUrl = new URL(url.pathname + url.search, BACKEND_URL);
        
        const response = await fetch(targetUrl.toString(), {
          method: req.method,
          headers: req.headers,
          body: req.body,
        });

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        });
      } catch (e) {
        console.error("API Proxy Error:", e);
        return new Response(JSON.stringify({ error: "Backend unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // --- 2. Static Files (Direct from source) ---
    // Пытаемся найти файл в папке static (например, /images/logo.png -> static/images/logo.png)
    // Это нужно, если мы не используем dist или если файл не попал в сборку
    let safePath = path.replace(/^\/+/, "");
    let staticFilePath = resolve(STATIC_DIR, safePath);
    
    // Защита от выхода за пределы и проверка существования
    if (staticFilePath.startsWith(resolve(STATIC_DIR))) {
        let staticFile = file(staticFilePath);
        if (await staticFile.exists()) {
            return new Response(staticFile, { headers: CACHE_HEADERS });
        }
    }

    // --- 3. SPA Assets (from dist) ---
    // Ищем в папке сборки (JS, CSS и скопированная статика)
    let distFilePath = resolve(DIST_DIR, safePath);
    
    if (distFilePath.startsWith(resolve(DIST_DIR))) {
        let asset = file(distFilePath);
        if (await asset.exists()) {
          return new Response(asset, { headers: CACHE_HEADERS });
        }
    }

    // --- 4. SPA Fallback (index.html) ---
    let core = file(DIST_DIR + "/core.html");
    if (await core.exists()) return new Response(core, { headers: NO_CACHE_HEADERS });
    
    let index = file(DIST_DIR + "/index.html");
    if (await index.exists()) return new Response(index, { headers: NO_CACHE_HEADERS });

    return new Response("<h1>Building... Please wait.</h1>", {
        headers: NO_CACHE_HEADERS
    });
  },
});
