// @ts-ignore
import { serve, file } from "bun";
// @ts-ignore
import { resolve } from "path";

const PORT = 5080;
// @ts-ignore
const BACKEND_URL = process.env.BACKEND_API_URL || "http://backpack_insight_backend:8000";
const DIST_DIR = "/app/dist_build";
const STATIC_DIR = "/app/Frontend/Web/static";

// --- Конфигурация кэширования ---
const CACHE_FONTS = {
    "Cache-Control": "public, max-age=3600, immutable"
};

const CACHE_DEFAULT = {
    "Cache-Control": "public, max-age=60, immutable",
    "Content-Type": "application/javascript"
};

const CACHE_CSS = {
    "Cache-Control": "public, max-age=60, immutable",
    "Content-Type": "text/css"
};

const CACHE_HTML = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Content-Type": "text/html"
};

function getAssetHeaders(path: string) {
    // @ts-ignore
    if (path.includes("/fonts/") || path.match(/\.(woff2?|ttf|otf)$/)) {
        return CACHE_FONTS;
    }
    if (path.match(/\.(js|mjs)$/)) {
        return CACHE_DEFAULT;  // JavaScript с правильным Content-Type
    }
    if (path.match(/\.css$/)) {
        return CACHE_CSS;  // CSS с правильным Content-Type
    }
    return CACHE_DEFAULT;  // Fallback
}

serve({
  port: PORT,
  async fetch(req: Request) {
    const url = new URL(req.url);
    const path = decodeURIComponent(url.pathname);

    // --- 1. API Proxy ---
    // @ts-ignore
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
    let safePath = path.replace(/^\/+/, "");
    let staticFilePath = resolve(STATIC_DIR, safePath);
    
    // Защита от выхода за пределы и проверка существования
    if (staticFilePath.startsWith(resolve(STATIC_DIR))) {
        let staticFile = file(staticFilePath);
        if (await staticFile.exists()) {
            return new Response(staticFile, { headers: getAssetHeaders(path) });
        }
    }

    // --- 3. SPA Assets (from dist) ---
    // Ищем в папке сборки (JS, CSS и скопированная статика)
    let distFilePath = resolve(DIST_DIR, safePath);
    
    if (distFilePath.startsWith(resolve(DIST_DIR))) {
        let asset = file(distFilePath);
        if (await asset.exists()) {
          return new Response(asset, { headers: getAssetHeaders(path) });
        }
    }

    // --- 4. SPA Fallback (index.html) ---
    let core = file(DIST_DIR + "/core.html");
    if (await core.exists()) return new Response(core, { headers: CACHE_HTML });
    
    let index = file(DIST_DIR + "/index.html");
    if (await index.exists()) return new Response(index, { headers: CACHE_HTML });

    return new Response("<h1>Building... Please wait.</h1>", {
        headers: CACHE_HTML
    });
  },
});
