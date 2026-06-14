// @ts-ignore
import { serve, file } from "bun";
// @ts-ignore
import { resolve } from "node:path";

const PORT = 5080;
// @ts-ignore
const BACKEND_URL = process.env.BACKEND_API_URL || "http://backpack_insight_backend:8000";
const DIST_DIR = "/app/dist_build";
const STATIC_DIR = "/app/Frontend/Web/static";

// --- Конфигурация кэширования ---
type HeadersMap = Record<string, string>;

const CACHE_SHORT = "public, max-age=60, immutable";
const CACHE_LONG = "public, max-age=3600, immutable";

const MIME_TYPES: Record<string, string> = {
    ".js": "application/javascript; charset=utf-8",
    ".mjs": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".avif": "image/avif",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".webmanifest": "application/manifest+json; charset=utf-8"
};

const CACHE_HTML = {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Content-Type": "text/html; charset=utf-8"
};

function getExtension(path: string): string {
    const cleanPath = path.split("?")[0]?.split("#")[0] || path;
    const dotIndex = cleanPath.lastIndexOf(".");
    return dotIndex >= 0 ? cleanPath.slice(dotIndex).toLowerCase() : "";
}

function getAssetHeaders(path: string): HeadersMap {
    const ext = getExtension(path);
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const isFont = path.includes("/fonts/") || /\.(woff2?|ttf|otf)$/i.test(path);
    const isBuildAsset = path.startsWith("/assets/");

    return {
        "Cache-Control": (isFont || isBuildAsset) ? CACHE_LONG : CACHE_SHORT,
        "Content-Type": contentType
    };
}

function isAssetRequest(path: string): boolean {
    return path.startsWith('/assets/')
        || path.startsWith('/images/')
        || path.startsWith('/fonts/')
        || path.startsWith('/lang/')
        || path === '/manifest.json'
        || path === '/browserconfig.xml'
        || path === '/robots.txt'
        || path === '/sw.js'
        || getExtension(path) !== '';
}

function notFound(path: string): Response {
    return new Response('Not found', {
        status: 404,
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Content-Type': MIME_TYPES[getExtension(path)] || 'text/plain; charset=utf-8'
        }
    });
}

console.log(`[web] Bun server starting on http://0.0.0.0:${PORT}`);
console.log(`[web] DIST_DIR=${DIST_DIR}`);
console.log(`[web] STATIC_DIR=${STATIC_DIR}`);
console.log(`[web] BACKEND_API_URL=${BACKEND_URL}`);

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

    // --- 4. Missing assets should stay 404 ---
    // Не отдаём index.html вместо JS/CSS/картинок: браузер воспринимает такой HTML
    // как module script/style и падает на строгой MIME-проверке после обновлений чанков.
    if (isAssetRequest(path)) {
        return notFound(path);
    }

    // --- 5. SPA Fallback (index.html) только для навигационных URL ---
    let index = file(DIST_DIR + "/index.html");
    if (await index.exists()) return new Response(index, { headers: CACHE_HTML });

    return new Response("<h1>Building... Please wait.</h1>", {
        headers: CACHE_HTML
    });
  },
});
