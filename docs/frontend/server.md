# [Bun-сервер раздачи (server.ts)](../../Frontend/Web/server.ts)

## Назначение
Prod-сервер на Bun: раздаёт собранную статику (`dist_build`/`static`) с корректными MIME-типами и политиками кеширования, проксирует API на бэкенд-контейнер, обслуживает SPA-fallback.

## Связи (Dependencies)
*   `process.env.BACKEND_API_URL` (адрес бэкенд-контейнера; дефолт `http://backpack_insight_backend:8000`).
*   Запускается в Docker-образе фронтенда ([Dockerfile]); порт `5080`.

## Подробное описание
*   Константы: `PORT=5080`, `DIST_DIR=/app/dist_build`, `STATIC_DIR=/app/Frontend/Web/static`.
*   `MIME_TYPES` — карта расширений → Content-Type (js/css/html/json/изображения/шрифты/манифест).
*   Политики кеша: `CACHE_SHORT` (60s), `CACHE_LONG` (3600s), `CACHE_HTML` (no-cache).
*   Хелперы: `getExtension`, `getAssetHeaders` (тип + кеш по пути; шрифты/`/assets/` — долгий кеш).
*   HTTP-обработчик раздаёт файлы, проксирует `/api/*` на бэкенд и отдаёт `index.html` для SPA-маршрутов.

## AI-контекст
*   Это серверная раздача для self-hosted варианта (в отличие от Cloudflare Pages + [functions/api/[[path]]](functions/api/[[path]].md)). HTML отдаётся с `no-cache`, ассеты с хешами — с длинным кешем.

---

> 📌 **Подпись документации:** создано при рефактор-документировании (приоритет по глубине вложенности).
