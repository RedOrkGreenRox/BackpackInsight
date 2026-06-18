# [HTTP-заголовки хостинга (_headers)](../../Frontend/Web/_headers)

## Назначение
Файл правил кэширования для хостинга (Netlify/Cloudflare Pages-совместимый формат): задаёт `Cache-Control` для разных типов ресурсов.

## Правила
*   `/assets/*.js`, `*.css`, шрифты `*.woff2/woff` → `public, max-age=31536000, immutable` (год, т.к. имена хешированы).
*   `/assets/images/*` (webp/avif/png) → `max-age=2592000` (месяц).
*   `/index.html` → `max-age=0, must-revalidate` (всегда свежий).
*   `/lang/*.json` → `max-age=3600` (час).
*   `/api/*` → `no-cache, no-store, must-revalidate`.

## Связи (Dependencies)
*   Поисковую индексацию настраивает [robots.txt](static/robots.md).
*   Согласовано с политиками [server.ts](server.md) и Edge-кэшем [functions/api/[[path]]](functions/api/[[path]].md). Есть зеркальная копия в [static/_headers](static/_headers.md).

## AI-контекст
*   Долгий кэш на хешированных ассетах безопасен (новый билд = новое имя). HTML и API намеренно не кэшируются ради корректных обновлений.

---

> 📌 **Подпись документации:** создано при добивании полного покрытия (все файлы, включая конфиги/данные/PWA).
