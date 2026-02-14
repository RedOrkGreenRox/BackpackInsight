import { serve, file } from "bun";
import { resolve } from "path";

const PORT = 5080;
const BACKEND_URL = process.env.BACKEND_API_URL || "http://backpack_insight_backend:8000";
const DIST_DIR = "/app/dist_build";
const STATIC_DIR = "/app/Frontend/Web/static";

// Заголовки для долгосрочного кэширования (1 год)
// Используем для статики и сбилженных ассетов (JS/CSS/Images/Fonts)
const CACHE_HEADERS = {
    "Cache-Control": "public, max-age=31536000, immutable"
};

// Заголовки для отключения кэширования
// Используем для HTML, чтобы пользователь всегда получал актуальную версию приложения
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
    // Декодируем путь, чтобы убрать %20 и прочие символы
    const path = decodeURIComponent(url.pathname);

    // --- 1. API Proxy ---
    // API запросы не декодируем, так как бэкенд может ожидать encoded
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

    // --- 2. Static Files (from /static alias) ---
    if (path.startsWith("/static")) {
        // Безопасное разрешение пути для предотвращения Path Traversal
        const relativePath = path.replace("/static", "").replace(/^\/+/, "");
        const fullPath = resolve(STATIC_DIR, relativePath);

        // Проверяем, что итоговый путь все еще внутри STATIC_DIR
        if (!fullPath.startsWith(resolve(STATIC_DIR))) {
            return new Response("Forbidden", { status: 403 });
        }

        const staticFile = file(fullPath);
        if (await staticFile.exists()) {
            return new Response(staticFile, { headers: CACHE_HEADERS });
        }
    }

    // --- 3. SPA Assets (from dist) ---
    // Защита от выхода за пределы DIST_DIR
    let safePath = path.replace(/^\/+/, "");
    let filePath = resolve(DIST_DIR, safePath);
    
    if (filePath.startsWith(resolve(DIST_DIR))) {
        let asset = file(filePath);
        if (await asset.exists()) {
          return new Response(asset, { headers: CACHE_HEADERS });
        }
    }

    // --- 4. SPA Fallback (index.html) ---
    // Ищем core.html (так как мы используем его как entry point)
    // Vite может переименовать его в index.html, если это root, но у нас input: main
    
    // Проверяем core.html
    let core = file(DIST_DIR + "/core.html");
    if (await core.exists()) return new Response(core, { headers: NO_CACHE_HEADERS });
    
    // Проверяем index.html (на всякий случай)
    let index = file(DIST_DIR + "/index.html");
    if (await index.exists()) return new Response(index, { headers: NO_CACHE_HEADERS });

    return new Response("<h1>Building... Please wait.</h1>", {
        headers: NO_CACHE_HEADERS
    });
  },
});
